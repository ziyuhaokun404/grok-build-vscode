# Grok for VS Code

Native VS Code sidebar for **xAI's Grok Build** CLI, driven by `grok agent stdio` over the [Agent Client Protocol (ACP)](https://agentclientprotocol.com).

xAI's docs list Zed, Neovim, Emacs, and marimo as ACP-compatible. JetBrains is "coming soon". VS Code isn't on the list. This extension fills that gap.

![sidebar overview screenshot — placeholder](./docs/screenshots/01-sidebar.png)
> *Screenshot placeholder — capture before publish.*

## Status: v0.1 (working, pre-publish)

Implemented and smoke-tested end-to-end against `grok` v0.1.211:

- ACP `initialize` → `session/new` → `session/set_model` → `session/prompt` lifecycle
- Streaming `agent_message_chunk` (response) + `agent_thought_chunk` (reasoning)
- **File handlers** for `fs/read_text_file` and `fs/write_text_file` — mandatory; without these the agent can't read or write
- **Permission flow** — `session/request_permission` rendered as a chat card with the 3 standard options (`always-allow` / `allow-once` / `reject-once`), with optional VS Code diff editor preview for `kind: "edit"` calls
- **Plan mode** — `session/set_mode` toggle, `current_mode_update` reflected in the top-bar pill, `x.ai/exit_plan_mode` rendered as an Approve / Abandon / Reject card
- **Effort flag** — `--reasoning-effort` passed at agent spawn (`low | medium | high | xhigh | max`); changing effort prompts to restart the session
- **Model picker** — live `session/set_model` against the 8 models the API returns
- **Slash autocomplete** — sourced from `available_commands_update` (compact, context, plan, yolo, model, memory, hooks-*, skills, share, fork, rewind, new, ...)
- **Context donut** — token usage sourced from prompt result `_meta.totalTokens` against the model's `_meta.totalContextTokens` (e.g. 500k for `grok-build`)
- **File chips** — active editor file added automatically; `👁` toggles hidden; `×` removes
- **Drag-and-drop** files from Explorer (Shift = embed inline content)
- **Right-click menus** — Explorer + editor: "Grok: Send File / Selection"
- **Keybindings** — `Ctrl+;` opens the sidebar, `Alt+G` inserts an @-mention for the active file

### Known limits (v0.1)

- Subagent messages render inline as tool cards — no dedicated subagent inspector
- No worktree UI (use `grok worktree` from a regular terminal)
- Diff editor is preview-only; the actual file write happens via `fs/write_text_file` after the user approves the permission card

## Install

```bash
# 1. Install the Grok CLI (xAI's official Grok Build)
curl -fsSL https://x.ai/cli/install.sh | bash

# 2. Authenticate (either):
grok login                              # browser flow
# or
export GROK_CODE_XAI_API_KEY="xai-..."  # from console.x.ai
```

Then pick one of three install paths:

### A. Install a pre-built .vsix (recommended for daily use)

```bash
cd grok-vscode
npm install
npm run package                          # → grok-vscode-0.1.0.vsix (~32 KB)
code --install-extension grok-vscode-0.1.0.vsix
```

Then reload VS Code and click the **Grok** icon in the activity bar.

### B. Dev loop (F5 — best for hacking on the extension)

```bash
cd grok-vscode
npm install
code .                                   # open in VS Code
# press F5 — opens an Extension Development Host with the extension live
```

Recompile with `npm run watch` in another terminal; the Dev Host picks up changes on reload.

### C. Symlink into ~/.vscode/extensions (auto-loads on every VS Code launch)

```bash
cd grok-vscode
npm install && npm run compile
ln -s "$(pwd)" ~/.vscode/extensions/phuryn.grok-vscode-0.1.0
# restart VS Code
```

Useful when you want the extension always loaded but don't want to repackage on every change.

![welcome screenshot — placeholder](./docs/screenshots/02-welcome.png)
> *Screenshot placeholder — first-launch welcome with CLI path + effort.*

## Usage

1. Click the **Grok** icon in the activity bar.
2. The active editor file is added as context automatically — click `👁` to hide it from this turn, `×` to remove it entirely.
3. Type your prompt. `Enter` sends; `Shift+Enter` for a newline. Slash commands (`/compact`, `/plan`, `/yolo`, ...) autocomplete from the CLI's live command list.
4. When Grok wants to edit a file, a **permission card** appears with three buttons; click `open diff preview →` to inspect the proposed change in the VS Code diff editor before approving.

![permission card screenshot — placeholder](./docs/screenshots/03-permission.png)
![plan-mode screenshot — placeholder](./docs/screenshots/04-plan.png)
> *Screenshot placeholders — permission card with diff preview, plan-mode approval.*

## Architecture

```
VS Code webview ──postMessage──► extension host ──JSON-RPC over stdio──► grok agent --reasoning-effort <level> stdio
                                                  ◄── session/update notifications
                                                  ◄── fs/read_text_file, fs/write_text_file (server → client)
                                                  ◄── terminal/create, terminal/output, terminal/wait_for_exit, terminal/kill, terminal/release
                                                  ◄── session/request_permission
                                                  ◄── x.ai/exit_plan_mode
```

All session state, tool execution, MCP servers, subagents, memory, and plan-mode bookkeeping live in the CLI. The extension is a UI client over ACP.

### Module map

| File | Role |
|---|---|
| `src/extension.ts` | Entry point — commands, keybindings, output channel |
| `src/sidebar.ts` | Webview provider, message routing, fs handlers, VS Code integration |
| `src/acp.ts` | ACP client — spawns CLI, manages session lifecycle, emits events |
| `src/acp-dispatch.ts` | Pure protocol helpers — line parsing, update routing, response builders (all unit-tested) |
| `src/cli-locator.ts` | Locate `grok` binary (configured path → `~/.grok/bin/grok` → PATH) |
| `src/terminal-manager.ts` | Spawns headless `sh -c <cmd>` children for the agent's `terminal/*` ACP calls, respects `outputByteLimit` |
| `src/chips.ts` | File-chip CRUD (pure functions, unit-tested) |
| `src/prompt-builder.ts` | Build final prompt text from message + chips (unit-tested) |
| `src/slash-filter.ts` | Slash autocomplete query/filter/pick (unit-tested) |
| `media/chat.js`, `media/chat.css` | Webview UI |

## Configuration

| Setting | Default | Notes |
|---|---|---|
| `grok.cliPath` | `""` (auto) | Path to `grok`. Empty = auto-discover. |
| `grok.defaultModel` | `""` | Model ID to use on new sessions. Empty = CLI default. |
| `grok.defaultEffort` | `"high"` | `low \| medium \| high \| xhigh \| max`. Restart needed to apply. |
| `grok.defaultPermissionMode` | `"default"` | Reserved; not yet wired in v0.1. |
| `grok.includeActiveFileByDefault` | `true` | Auto-add active editor as a chip. |
| `grok.useCtrlEnterToSend` | `false` | `Enter` newline, `Ctrl/Cmd+Enter` sends. |

## Commands

`Grok: Open` · `Grok: New Session` · `Grok: Pick Model` · `Grok: Pick Effort` · `Grok: Toggle Plan / Agent Mode` · `Grok: Send File` · `Grok: Send Selection` · `Grok: Insert @-Mention` · `Grok: Show Logs`

## Tests

```bash
npm test          # vitest run
npm run test:watch
```

58 tests covering pure logic + a fast TerminalManager suite that spawns real `/bin/sh` children — ACP line parsing & dispatch, session-update routing, prompt-meta extraction, response builders, file-chip CRUD, prompt building (file refs vs. inline selections), slash-command query/filter/pick, CLI locator fallback chain, and terminal create/output/wait/kill semantics including `outputByteLimit` truncation. See [TESTS.md](./TESTS.md) for the full design and what's deferred.

## Publishing to the VS Code Marketplace

1. Register a publisher at https://marketplace.visualstudio.com/manage (one-time).
2. Generate a Personal Access Token in Azure DevOps with **Marketplace > Manage** scope.
3. `npx @vscode/vsce login <publisher-name>` (paste the PAT once; cached locally).
4. `npm run publish` — auto-bumps via the version in `package.json`, packages, uploads.

First-publish prerequisites (already satisfied):

- Public GitHub repo URL in `package.json` `repository.url`
- 128×128 PNG icon (`resources/grok-icon.png`)
- `README.md`, `CHANGELOG.md`, `LICENSE`
- `displayName`, `description`, `categories`, `keywords` set
- `engines.vscode` minimum version

Smoke-test the .vsix in a clean VS Code (no other extensions) before publishing.

## License

MIT
