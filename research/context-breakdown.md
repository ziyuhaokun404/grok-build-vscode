# Context breakdown over ACP — data sources for the top-of-session card

Probe: `research/context-breakdown-probe.cjs`  
Verified: **grok 0.2.101** (stable), 2026-07-16.

## Goal

Surface a **categorical** context-window breakdown in the VS Code sidebar
(system prompt, skills listing, AGENTS.md, messages, free, …) matching what the
CLI TUI shows for `/context`.

## Official TUI contract

From `~/.grok/docs/user-guide/04-slash-commands.md`:

> `/context` — Show context window usage and session stats: a categorical
> breakdown (**system prompt, messages, reasoning/overhead, free**), plus
> informational rows for **tool definitions, the skills listing, and MCP
> server announcements** with their estimated token cost.

`/session-info` — model, turn count, and a single **Context: N / M tokens** line.

## ACP findings (0.2.101)

| Channel | Result |
|---|---|
| `/session-info` over `session/prompt` | Streams prose including `**Context:** 2888 / 500000 tokens (1%)`. `_meta.totalTokens` is **0** (placeholder — stripped by `gateZeroTokenMeta`). |
| `/context` over `session/prompt` | **Empty agent text** (length 0). `_meta.totalTokens` is 0. Still **TUI-only**. |
| ACP `usage_update` | Not observed (same as `research/compact.md`). |
| `signals.json` | `contextTokensUsed` / `contextWindowTokens` only — **no categories**. |
| `system_prompt.txt` | Partial system snapshot (~5KB base) — not the full assembled prompt (tools/skills listing live elsewhere). |
| `prompt_context.json` | AGENTS.md body + persona summaries; no token counts. |

Empty-session baseline from `/session-info` on a fresh ACP session: **~2888 / 500000** tokens before any user message — that is fixed overhead (system + tools + skills catalog + …).

## Extension strategy

Because exact categories are unavailable over ACP:

| Tier | Fields | Source |
|---|---|---|
| **A exact** | used, window, free | meta / signals / session-info parse |
| **B baseline** | fixed overhead | first `used` while `!session.hasHistory` |
| **C estimate** | system, AGENTS, skills listing | disk text, `ceil(chars/4)` |
| **residual** | other_fixed, messages | `fixed − Σ(C)` and `used − fixed` |

Implementation:

- Pure model: `src/context-breakdown.ts` (`buildBreakdown`, `estimateTokensFromText`)
- Disk readers: `readSessionContextSources`, `collectSkillListing` in `src/sessions.ts`
- Host emit: `emitContextUsage` → `contextUsage` host message with optional `breakdown`
- UI: sticky top card (`#context-card`), setting `grok.showContextCard`

`/context` remains in `HIDDEN_SLASH_COMMANDS` until this probe reports non-empty
ACP output with parseable categories.

## Re-run

```bash
node research/context-breakdown-probe.cjs
# optional: GROK_BIN=/path/to/grok
```

When `/context` starts returning breakdown text (or a structured
`usage_update`), prefer that over estimates and drop the "约" labels for those
rows.

## Related

- `docs/ACP-feedback.md` §2.2 / §2.3 — original `/context` + `totalTokens:0` feedback
- `research/compact.md` — compact + donut semantics
- `research/signals-refresh-probe.cjs` — when `signals.json` refreshes post-compact
