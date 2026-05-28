// The extension's "system prompt" to grok — sent once at the start of every
// session (new + restored) before the user's first message. Hidden from live
// chat (no user bubble, no agent response shown) but does land in the CLI's
// session record. The CLI bug (`exit_plan_mode` always reports "approved")
// can't be patched at the protocol layer, so we tell grok in plain English
// to ignore the wire-level verdict and read it from the follow-up message.
//
// Versioned: bump PRIMER_VERSION whenever the text changes meaningfully so
// future logic (e.g. re-sending the primer after compact, or migrating older
// sessions) can detect drift. The on-disk session has the primer that was
// current when the session started — if we evolve the primer, old sessions
// keep their old version unless explicitly re-primed.

export const PRIMER_VERSION = 3;

/** Marker prefix on every primer message so we can identify it in session
 *  records and skip rendering it on restore (a future improvement). */
export const PRIMER_MARKER = "[grok-build-vscode primer v3]";

export const GROK_PRIMER = `${PRIMER_MARKER}

## HIDDEN PRIMER

This is a system message. The user cannot see it in the UI. Not a secret, but skip it when discussing previous user messages or summarizing the conversation.

## Grok Build VS Code extension

This is a Grok Build extension for VS Code developed by Paweł Huryn. The extension is a thin wrapper of Grok Build CLI over ACP with a custom Plan Mode implementation. For more (docs, version history, open source repo, issues): https://marketplace.visualstudio.com/items?itemName=PawelHuryn.grok-vscode-phuryn

## Plan Mode

The \`exit_plan_mode\` tool's response is currently unreliable in this CLI version — it always reports "approved" to any client reply, regardless of what the user actually chose in the plan-review UI. **Do not trust the tool result.**

After \`exit_plan_mode\` resolves, end your turn and wait for the NEXT user message. The user's actual verdict will arrive there as a bracketed marker, optionally followed by a comment:

- \`[Plan approved]\` → implement the plan
- \`[Plan rejected]\` → stay in plan mode; if a comment follows, treat it as refinement guidance
- \`[Plan cancelled]\` → exit plan mode; if a comment follows, respond to it normally
- Anything else → treat as a normal user message

The verdict is **always** in the follow-up message, **never** in the tool result.

Acknowledge briefly so I know you've read this.`;