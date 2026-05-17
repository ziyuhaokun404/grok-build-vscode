# Changelog

## 0.1.0 — unreleased

Initial public preview. ACP client for `grok agent stdio`.

### Implemented

- Sidebar chat webview driven by `grok agent stdio` over ACP
- Streaming agent messages + separate thinking trace
- Permission-request cards with diff-editor preview (the 3 standard `always-allow / allow-once / reject-once` options)
- Plan-mode top-bar toggle (`session/set_mode`) + plan-approval cards (`x.ai/exit_plan_mode`)
- Effort selector (`low | medium | high | xhigh | max`, passed via `--reasoning-effort` at agent spawn)
- Model picker (live `session/set_model`)
- Slash-command autocomplete sourced from `available_commands_update`
- Context-usage donut from prompt result `_meta.totalTokens`
- File chips with `👁` hide-toggle, Explorer drag-and-drop (Shift = embed inline)
- Right-click "Grok: Send File / Selection" in Explorer + editor
- `Ctrl+;` opens sidebar; `Alt+G` inserts @-mention for active file
- Required server→client handlers: `fs/read_text_file`, `fs/write_text_file`, `terminal/{create,output,wait_for_exit,kill,release}`

### Known limits

- No subagent inspector beyond tool-call cards (subagent messages render inline)
- No worktree UI (use `grok worktree` from a regular terminal)
- Diff editor is preview-only (file writes go through `fs/write_text_file`, not editor-driven save)
