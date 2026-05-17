# CLAUDE.md — grok-build-vscode

VS Code sidebar extension for **xAI's Grok Build CLI**, driven by `grok agent stdio` over the [Agent Client Protocol (ACP)](https://agentclientprotocol.com). Thin client — all session state, MCP servers, subagents, memory, and plan-mode bookkeeping live in the CLI.

## Status

v0.1 (working, pre-publish, not in marketplace yet). 58 unit tests passing. Smoke-tested end-to-end against `grok` v0.1.211 on Linux and Windows-via-WSL.

## Module map

| File | Role |
|---|---|
| `src/extension.ts` | Entry point — registers commands, keybindings, output channel |
| `src/sidebar.ts` | Webview provider, message routing, fs handlers, diff editor preview |
| `src/acp.ts` | ACP client — spawns CLI, manages session lifecycle, emits events |
| `src/acp-dispatch.ts` | Pure protocol helpers — line parsing, update routing, response builders |
| `src/cli-locator.ts` | Locate `grok` binary (configured path → `~/.grok/bin/grok` → PATH); cross-platform |
| `src/terminal-manager.ts` | Headless shell children for the agent's `terminal/*` ACP calls; cross-platform via `shell:true` |
| `src/chips.ts` | File-chip CRUD (pure) |
| `src/prompt-builder.ts` | Chip → prompt-string with `@path` refs and fenced code blocks |
| `src/slash-filter.ts` | Slash-command autocomplete filter |
| `media/chat.{js,css}` | Webview UI |
| `scripts/install.{ps1,sh}` | Auto-detect VS Code CLI, build .vsix, install |
| `scripts/uninstall.{ps1,sh}` | Uninstall `phuryn.grok-vscode` |

Pure modules (`acp-dispatch`, `chips`, `prompt-builder`, `slash-filter`, `cli-locator`) were split out specifically so protocol behavior can be unit-tested without spawning processes.

## Build + test

```bash
npm install
npm test         # 58 tests, <1s, vitest
npm run package  # → grok-vscode-0.1.0.vsix
```

## Install

- **macOS / Linux / WSL Ubuntu:** `./scripts/install.sh`
- **Windows (UI only, no working chat — grok CLI is Linux/macOS):** `pwsh scripts\install.ps1`
- **Windows for real:** WSL2 Ubuntu + Remote-WSL → install in the WSL-side VS Code server

See `README.md § Install` for the full per-platform matrix.

## ACP surfaces implemented

- `initialize` → `session/new` → `session/set_model` → `session/prompt` lifecycle
- Streaming `agent_message_chunk` + `agent_thought_chunk`
- Handlers (mandatory or the agent crashes): `fs/read_text_file`, `fs/write_text_file`, `terminal/{create,output,wait_for_exit,kill,release}`
- `session/request_permission` → chat card with `allow-always` / `allow-once` / `reject-once`, diff editor preview for `kind:"edit"`
- `session/set_mode` (plan ↔ agent) + `x.ai/exit_plan_mode` Approve/Abandon/Reject card
- `--reasoning-effort` flag at agent spawn (`low | medium | high | xhigh | max`)
- `available_commands_update` → slash autocomplete
- `current_mode_update` → top-bar pill
- `_meta.totalTokens` → context donut

## Known v0.1 limits

- Subagent messages render inline as tool cards — no dedicated inspector
- No worktree UI
- Diff editor is preview-only; the write happens via `fs/write_text_file` after approval
- View defaults to left activity bar; user must drag to secondary side bar manually if desired

## Cross-platform notes

- `terminal-manager.ts` uses `spawn(cmd, { shell: true })` so Node picks `cmd.exe` on Windows, `/bin/sh` elsewhere. Don't hardcode shell paths.
- `cli-locator.ts` reads `HOME` / `USERPROFILE` env vars first (testability), falls back to `os.homedir()`. Uses `where` on Windows, `command -v` elsewhere. Checks `.cmd`/`.exe`/`.bat` extensions on Windows.
- Tests use `node -e "..."` everywhere so commands are deterministic across platforms — don't add `pwd`, `awk`, `sleep`, `true`, etc.

## What's next (priority order)

1. Real screenshots replacing placeholders in `docs/screenshots/`
2. `@vscode/test-electron` integration suite (scoped in `TESTS.md § v0.2`)
3. Status-bar indicator (current model + effort + token usage)
4. Subagent inspector (collapsible side panel)
5. Worktree UI (`Grok: New Worktree Session`)
6. Optional: auto-move view to secondary side bar on first activation (`workbench.action.moveView`)

## Publishing (when ready)

One-time: register `phuryn` publisher at marketplace.visualstudio.com/manage, generate Azure DevOps PAT with *Marketplace > Manage* scope, `npx @vscode/vsce login phuryn`.

Per-release: bump version in `package.json`, `npm test`, `npm run publish`.

## Repo conventions

- Direct-to-`main`, no feature branches
- Commits explain the *why*, not the *what*
- Don't introduce abstractions speculatively
- Don't add comments that explain what well-named code already says
- 58 tests is the floor — every PR should keep that green
