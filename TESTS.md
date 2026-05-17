# Test Design

Two layers:

1. **Pure-logic unit tests** (Vitest, no VS Code, no spawn) plus a fast TerminalManager suite that does spawn real `/bin/sh` children — extracted into modules under `src/` and tested directly. **58 tests, all passing.** Listed below.
2. **VS Code integration tests** (deferred to v0.2 with `@vscode/test-electron`) — covers command registration, view lifecycle, settings reads, and the diff editor. Deferred because they require a headed VS Code, are slow, and the pure modules already cover the bug-prone surface.

The goal of layer (1) is to make the protocol surface and UI logic regression-proof. Anything that goes wrong against the real CLI in v0.2 should fall into a documented gap (network, auth, model entitlement, terminal handlers) — not into our protocol code.

---

## What we test

### `test/acp-dispatch.test.ts` — protocol primitives (19 tests)

The wire format is the highest-value test surface: ACP changes break everything else if we miss them.

- **`parseAcpLine`**
  - Returns `null` for empty / whitespace-only input
  - Flags non-JSON lines as `{kind:"non-json"}` so the host can log them
  - Recognizes responses by `id` + missing `method`
  - Carries `error` through on error responses
  - Recognizes `session/update` notifications by method name
  - Recognizes server→client requests with both `method` and `id`
- **`routeSessionUpdate`** — every documented update tag has an explicit route
  - `agent_message_chunk` → `{event:"messageChunk", text}`
  - `agent_thought_chunk` → `{event:"thoughtChunk", text}`
  - `tool_call` and `tool_call_update`
  - `current_mode_update` → carries `modeId` (drives the top-bar pill)
  - `available_commands_update` → carries `commands`
  - Unknown tags fall through to `{event:"update"}` (forward-compat)
  - Missing `content.text` defaults to empty string (defensive)
- **`extractPromptMeta`** — pulls token counts out of `_meta` for the donut and handles missing `_meta` gracefully
- **Response builders** — `makePermissionResponse`, `makeExitPlanResponse`, `makeAckResponse`, `makeRequest`. These encode the exact shapes the agent expects. Bugs here are silent.

### `test/chips.test.ts` — file-chip CRUD (6 tests)

- Implicit chips have stable ids (so the active-editor watcher can replace them)
- Explicit chips have unique ids even when created in the same millisecond (regression: original `Date.now()` impl collided)
- `removeChip` / `toggleChip` are pure (don't mutate inputs)
- `clearImplicitChips` leaves explicit chips intact

### `test/prompt-builder.test.ts` — final prompt assembly (7 tests)

- Bare text passes through
- File-only chip → `@relPath` reference
- Selection chip → fenced code block with the right language tag and line range
- Hidden chips are skipped
- Falls back to `@ref` when the file can't be read
- Multiple chips concatenate cleanly
- Files without extensions get an empty fence language

### `test/slash-filter.test.ts` — slash autocomplete (12 tests)

- `getSlashQuery` only activates after `/` at line-start or newline (no false positives on `path/foo/bar`)
- Empty query returns the full command list
- Prefix filter is case-insensitive
- `applySlashPick` replaces only the slash token, preserves trailing text, returns the new caret position

### `test/terminal-manager.test.ts` — terminal handler (10 tests)

These actually spawn real `/bin/sh` children — fast enough to keep in the unit suite.

- Captures stdout from a quick command + exit code
- Captures stderr and nonzero exit
- Honors `outputByteLimit` and sets the `truncated` flag
- Returns `exitStatus: null` while still running
- Injects env from ACP-style `[{name, value}]` pairs
- Honors `cwd`
- `waitForExit` resolves on repeated calls after exit
- Throws on unknown terminalId
- `kill` / `release` on missing id is a no-op
- `disposeAll` kills outstanding terminals

### `test/cli-locator.test.ts` — CLI discovery (4 tests)

- Configured path wins if it exists
- Returns `undefined` when configured path is missing
- Falls back to PATH lookup; `~/.grok/bin/grok` is also accepted when present
- Returns `undefined` when nothing is found

---

## What we deliberately don't unit-test

- **`AcpClient.spawn` and child process I/O.** This is exercised by the `smoke-extension.mjs` integration script (lives in `Temp/` outside the repo, hits the real `grok` binary) and is what v0.2 integration tests will cover.
- **`sidebar.ts`** end-to-end. It's mostly glue between VS Code APIs and the modules above; the modules carry the logic. A regression-prone area here is the diff editor invocation — that's better tested with `@vscode/test-electron` than with mocks.
- **Webview UI (`chat.js`).** Could be tested with happy-dom, but the value/cost ratio is bad. Visual regression on the cards is better caught by manual smoke + future Playwright.

---

## Running

```bash
npm test            # one shot
npm run test:watch  # TDD loop
```

Tests run in <1s with no network and no fixtures, so they're suitable for pre-commit hooks once the repo moves out.

---

## v0.2 test plan (deferred)

1. **`@vscode/test-electron` suite** — open the test workspace, activate the extension, assert the Grok view is registered, send a fake `permissionRequest` through the webview message channel, verify a permission card renders.
2. **AcpClient integration test** — use a fixture script that pretends to be `grok agent stdio` (reads JSON-RPC, emits canned responses). Tests the spawn → initialize → newSession → setModel path against fixture, not the real CLI.
3. **Webview snapshot test** — Playwright loads the webview HTML in isolation, sends representative messages, snapshots the DOM. Catches CSS/layout regressions.
4. **Permission round-trip** — fake permission request from a fixture, click card button, assert correct `respondPermission` JSON written to fixture's stdin.
