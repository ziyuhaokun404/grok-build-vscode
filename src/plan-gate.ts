/**
 * Plan-mode enforcement policy (pure).
 *
 * grok's `x.ai/exit_plan_mode` treats *any* client response as approval, so we
 * cannot reject a plan at the protocol layer. Instead we enforce plan/act on
 * *our* side, at the two mandatory server→client choke points the agent cannot
 * avoid:
 *
 *   - `fs/write_text_file` — every file write
 *   - `terminal/create`    — every shell command
 *
 * Empirically (grok 0.2.3, ACP), a plan-mode turn only *reads* the workspace
 * (`fs/read_text_file` + internal search tools) and writes its plan to
 * `~/.grok/sessions/<cwd>/<id>/plan.md` — i.e. *outside* the workspace. So the
 * gate is not "block all writes"; it is "block writes that land inside the
 * workspace", which protects the user's project while letting grok persist its
 * own plan file.
 *
 * These functions are pure so the policy can be unit-tested without spawning a
 * CLI; `acp.ts` / `sidebar.ts` call them with the live path/command strings.
 */

import * as nodePath from "node:path";

/** JSON-RPC error code we use when refusing a mutating call during plan mode. */
export const PLAN_BLOCKED_CODE = -32010;
export const PLAN_BLOCKED_WRITE_MSG =
  "Blocked by Plan mode: approve the plan before writing files in the workspace.";
export const PLAN_BLOCKED_TERMINAL_MSG =
  "Blocked by Plan mode: approve the plan before running commands that may change the workspace.";

/**
 * Strip the Windows extended-length prefix (`\\?\` or `//?/`), normalize all
 * separators to `/`, collapse `.`/`..` segments, and drop a trailing slash.
 * Drive-letter / backslash paths are treated as Windows and lower-cased for a
 * case-insensitive compare; POSIX paths stay case-sensitive.
 */
function canonical(p: string): { norm: string; windows: boolean } {
  let s = String(p || "").trim();
  const windows = /^[\\/]{2}\?[\\/]/.test(s) || /^[a-zA-Z]:[\\/]/.test(s) || s.includes("\\");
  s = s.replace(/^[\\/]{2}\?[\\/]/, ""); // \\?\C:\... → C:\...
  s = s.replace(/\\/g, "/");
  s = nodePath.posix.normalize(s);
  s = s.replace(/\/+$/, ""); // drop trailing slash (but keep "/" root)
  if (s === "") s = "/";
  return { norm: windows ? s.toLowerCase() : s, windows };
}

/**
 * True if `target` resolves to `root` itself or somewhere beneath it. Used to
 * decide whether a write lands in the user's workspace (block) or outside it
 * (allow — e.g. grok's `~/.grok/.../plan.md`).
 */
export function isInsideWorkspace(target: string, root: string): boolean {
  if (!target || !root) return false;
  const t = canonical(target).norm;
  const r = canonical(root).norm;
  if (r === "/" ) return t === "/" || t.startsWith("/");
  return t === r || t.startsWith(r + "/");
}

/** Tool-call `kind`s that mutate state and must be rejected while planning. */
const MUTATING_KINDS = new Set(["edit", "execute", "delete", "move", "write"]);

/** Read-only `kind`s the agent may use freely while planning. */
export function isMutatingKind(kind: string | undefined): boolean {
  return MUTATING_KINDS.has(String(kind || "").toLowerCase());
}

// Shell metacharacters that can chain, redirect, background, or smuggle code —
// any of these means we can't trust a head-token allowlist, so we block. Note a
// single `|` is NOT here: pipes are handled specially (see isReadOnlyCommand),
// allowed only when every pipeline stage is itself read-only. Script-block
// braces `{ }` are blocked because an otherwise-safe cmdlet can host arbitrary
// code in one (e.g. `Select-Object @{e={ Remove-Item x }}`).
const UNSAFE_SHELL = /[>;`{}]|\$\(|&&|\|\||(^|\s)&(\s|$)|<\(/;

const READONLY_HEADS = new Set([
  // POSIX
  "ls", "dir", "pwd", "cd", "echo", "cat", "type", "head", "tail", "less", "more",
  "grep", "rg", "ag", "ack", "find", "fd", "tree", "wc", "stat", "file", "which",
  "where", "whereis", "basename", "dirname", "realpath", "readlink", "du", "df",
  "env", "printenv", "date", "whoami", "hostname", "uname", "sort", "uniq", "cut",
  "awk", "sed", // sed/awk are read-only without -i / redirection (blocked above)
  // PowerShell read-only cmdlets + aliases. Inspection/formatting only — anything
  // that writes (out-file, set-content, tee-object, export-*) or executes
  // (foreach-object, where-object, invoke-expression/iex, invoke-command, start-process)
  // is deliberately excluded, so a pipeline containing one is blocked.
  "get-childitem", "gci", "get-content", "gc", "get-item", "gi",
  "get-itemproperty", "gp", "test-path", "resolve-path", "rvpa", "get-location", "gl",
  "select-object", "select", "format-table", "ft", "format-list", "fl", "format-wide", "fw",
  "sort-object", "measure-object", "measure", "select-string", "sls", "out-string",
  "get-command", "gcm", "get-help", "get-member", "gm", "compare-object",
]);

const GIT_READONLY = new Set([
  "status", "diff", "log", "show", "branch", "remote", "ls-files", "ls-tree",
  "rev-parse", "blame", "describe", "shortlog", "config", "cat-file", "name-rev",
  "whatchanged", "reflog", "tag", // bare `git tag` lists; `git tag <name>` is rare in planning and harmless to block via fallthrough? we allow list-only below
]);

const PKG_READONLY = new Set(["ls", "list", "view", "info", "outdated", "why", "show", "audit"]);

/** One pipeline stage: read-only iff its head token is a known read-only program. */
function isReadOnlyStage(stage: string): boolean {
  const tokens = stage.trim().split(/\s+/);
  if (!tokens[0]) return false;
  const head = tokens[0].toLowerCase().replace(/\.(exe|cmd|bat)$/i, "");

  if (head === "git") {
    const sub = (tokens[1] || "").toLowerCase();
    if (sub === "tag") return tokens.length === 2; // bare `git tag` lists; with args it may create
    return GIT_READONLY.has(sub);
  }
  if (head === "npm" || head === "pnpm" || head === "yarn" || head === "bun") {
    const sub = (tokens[1] || "").toLowerCase();
    return PKG_READONLY.has(sub);
  }
  if (head === "node" || head === "python" || head === "python3" || head === "deno") {
    // Only allow trivially read-only invocations like `node --version`.
    return tokens.length >= 2 && /^(-v|--version|--help|-h)$/.test(tokens[1]);
  }
  return READONLY_HEADS.has(head);
}

/**
 * Conservative classifier: a command is "read-only" (safe to run while
 * planning) only if it has no chaining/redirection/script-block metacharacters
 * AND every `|`-separated stage is itself a known read-only program (with a
 * read-only subcommand for git/npm/pnpm/yarn). A pipe is allowed only when both
 * sides are read-only, so `Get-ChildItem | Select-Object` passes but
 * `Get-ChildItem | Out-File x` or `cat x | iex` do not. Everything else is
 * blocked. Errs toward blocking.
 */
export function isReadOnlyCommand(command: string): boolean {
  const cmd = String(command || "").trim();
  if (!cmd) return false;
  if (UNSAFE_SHELL.test(cmd)) return false; // `||` and all non-pipe metachars
  return cmd.split("|").every(isReadOnlyStage);
}

export interface PlanGateContext {
  active: boolean;
  workspaceRoot: string;
}

/** Should `fs/write_text_file` to `path` be refused right now? */
export function shouldBlockWrite(path: string, ctx: PlanGateContext): boolean {
  return ctx.active && isInsideWorkspace(path, ctx.workspaceRoot);
}

/** Should `terminal/create` of `command` be refused right now? */
export function shouldBlockTerminal(command: string, ctx: PlanGateContext): boolean {
  return ctx.active && !isReadOnlyCommand(command);
}

/** Should a `session/request_permission` for `toolKind` be auto-rejected? */
export function shouldRejectPermission(toolKind: string | undefined, ctx: PlanGateContext): boolean {
  return ctx.active && isMutatingKind(toolKind);
}

export interface PermissionOptionLike {
  optionId: string;
  kind: string;
  name?: string;
}

/**
 * Pick the option that means "no" from a permission request's options. Prefers
 * an explicit `reject_once`, then any reject/deny kind; returns undefined if the
 * request offers no way to decline (caller should then fall back to the user).
 */
export function pickRejectOption(options: PermissionOptionLike[]): string | undefined {
  if (!Array.isArray(options) || options.length === 0) return undefined;
  const exact = options.find((o) => o.kind === "reject_once");
  if (exact) return exact.optionId;
  const anyReject = options.find((o) => /reject|deny|cancel|no/i.test(o.kind));
  return anyReject?.optionId;
}

/**
 * True if `path` is grok's own plan file (`.grok/sessions/.../plan.md`). We
 * snoop the content of that write to populate the plan-review card, since
 * `exit_plan_mode` itself arrives with `planContent: null`.
 */
export function isPlanFileWrite(path: string): boolean {
  return /[\\/]\.grok[\\/]sessions[\\/].*[\\/]plan\.md$/i.test(String(path || ""));
}
