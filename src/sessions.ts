import * as nodeFs from "node:fs";
import * as path from "node:path";
import { isPrimerText, isPrimerSummary } from "./grok-primer";

/** A session with at most this many recorded messages is cheap to confirm as empty
 *  (a primer-only session has ~4). The sweep only reads `chat_history.jsonl` for
 *  sessions under this bound, so it never touches large real sessions. */
export const EMPTY_PRIMER_MAX_MESSAGES = 20;

export interface SessionListEntry {
  id: string;
  cwd: string;
  displayName: string;
  rawSummary: string;
  customName?: string;
  updatedAt: number;
  createdAt: number;
  numMessages: number;
  modelId?: string;
  /** Extension-owned pin time (ms). When set, session sorts above unpinned in UI. */
  pinnedAt?: number;
  /** Extension-owned archive time (ms). When set, session is hidden from the main rail by default. */
  archivedAt?: number;
  /** grok's `session_kind` when it marks a non-user session — a `spawn_subagent`
   *  delegation persists its child as a top-level session dir with
   *  `session_kind: "subagent"`; the history list hides those. */
  kind?: "subagent";
}

export interface SessionMetaOverride {
  customName?: string;
  /** When set, session is pinned in the left rail / history (ms epoch). */
  pinnedAt?: number;
  /** When set, session is archived (ms epoch). Hidden from the main rail unless expanded. */
  archivedAt?: number;
  /** Last verdict the user gave to an exit_plan_mode card in this session, for the restore-card label. */
  lastPlanVerdict?: "approved" | "rejected" | "abandoned";
  /** Every plan the user resolved in this session, in chronological order. grok's plan.md only
   *  retains the latest plan content on disk; saving each one here lets the resume view replay
   *  rejected/cancelled plans that grok overwrote later in the conversation. `afterUserMessage`
   *  is the count of user messages that had been sent at the moment the plan was resolved, so
   *  the resume view can render each card right after that message instead of dumping all the
   *  plan cards at the bottom of the restored conversation. */
  plans?: { text: string; verdict: "approved" | "rejected" | "abandoned"; afterUserMessage?: number }[];
  /** Every permission card the user answered in this session, in order. The CLI
   *  doesn't replay `session/request_permission` on `session/load` (it's a server
   *  request, not a session update), so we persist the title + outcome here and
   *  replay each as a collapsed card. `afterUserMessage` positions it inline, like
   *  `plans`. */
  permissions?: { title: string; outcome: "allowed" | "rejected"; toolCallId?: string; afterUserMessage?: number }[];
  /** Dashboard "unread" badge: a turn finished while this session wasn't focused and
   *  hasn't been opened since. Drives the green/red dot; cleared on open. Persisted
   *  (not tied to the live process) so the badge survives reaping and a reload. */
  unread?: boolean;
  /** The unread turn ended in an error (red dot instead of green). */
  unreadError?: boolean;
  /**
   * Per-turn latency/throughput metrics persisted by the extension (the CLI
   * does not replay prompt `_meta` on session/load). `afterUserMessage` places
   * each row on the agent footer for that user turn on restore.
   */
  turnMetrics?: {
    afterUserMessage: number;
    ttftMs?: number;
    durationMs: number;
    generationMs?: number;
    tokensPerSec?: number;
    inputTokens?: number;
    outputTokens?: number;
    reasoningTokens?: number;
    cachedReadTokens?: number;
    totalTokens?: number;
    modelId?: string;
    cancelled?: boolean;
  }[];
}
export type SessionMetaOverrides = Record<string, SessionMetaOverride>;

/** Move a renamed session's `customName` from one id to another and drop the source entry. Used when
 *  a primer-only session is discarded and restarted under a new grok id (a model/effort switch on an
 *  empty session): the user's rename should follow to the new session, and the abandoned id's
 *  override must not linger. Only `customName` carries — a fresh session has no plans/unread/etc.
 *  worth keeping. Pure: removing the on-disk dir is the caller's job. Returns a new map; the input is
 *  left untouched. No-op carry when the source has no `customName` or `toId` is undefined. */
export function carrySessionName(
  overrides: SessionMetaOverrides,
  fromId: string,
  toId: string | undefined,
): SessionMetaOverrides {
  const next: SessionMetaOverrides = { ...overrides };
  const carried = next[fromId]?.customName?.trim();
  delete next[fromId];
  if (carried && toId) next[toId] = { ...(next[toId] ?? {}), customName: carried };
  return next;
}

export interface FsLike {
  existsSync(p: string): boolean;
  readdirSync(p: string): string[];
  readFileSync(p: string, encoding: "utf8"): string;
  statSync(p: string): { isDirectory(): boolean; mtimeMs: number };
  rmSync?(p: string, opts?: { recursive?: boolean; force?: boolean }): void;
  rmdirSync(p: string, opts?: { recursive?: boolean }): void;
}

export interface ListDeps {
  fs: FsLike;
  grokHome: string;
  cwd: string;
  overrides: SessionMetaOverrides;
  now?: () => number;
  log?: (msg: string) => void;
}

export interface DeleteDeps {
  fs: FsLike;
  grokHome: string;
  cwd: string;
  id: string;
}

/** Build the directory grok uses for sessions rooted at `cwd`. Mirrors grok's URL-encoded layout. */
export function sessionsDirFor(grokHome: string, cwd: string): string {
  return path.join(grokHome, "sessions", encodeURIComponent(cwd));
}

/** Default friendly name when no `customName` or `session_summary` is available. */
export function fallbackName(summary: string, updatedAt: number): string {
  const s = (summary || "").trim();
  if (s) return s.length > 60 ? s.slice(0, 57) + "…" : s;
  const d = new Date(updatedAt || Date.now());
  if (isNaN(d.getTime())) return "未命名";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `未命名（${yyyy}-${mm}-${dd} ${hh}:${mi}）`;
}

function parseTimestamp(s: unknown, fallback: number): number {
  if (typeof s !== "string") return fallback;
  const t = Date.parse(s);
  return isNaN(t) ? fallback : t;
}

/** Parse one already-read summary.json into a list entry, applying any customName override. */
function buildEntry(
  dirName: string,
  raw: any,
  cwd: string,
  overrides: SessionMetaOverrides,
  fallbackNow: number,
): SessionListEntry {
  const id = (raw?.info?.id as string) ?? dirName;
  const sessCwd = (raw?.info?.cwd as string) ?? cwd;
  const rawSummary = typeof raw?.session_summary === "string" ? raw.session_summary : "";
  const updatedAt = parseTimestamp(raw?.updated_at, fallbackNow);
  const createdAt = parseTimestamp(raw?.created_at, updatedAt);
  const numMessages = typeof raw?.num_messages === "number" ? raw.num_messages : 0;
  const modelId = typeof raw?.current_model_id === "string" ? raw.current_model_id : undefined;
  const override = overrides[id];
  const customName = override?.customName?.trim() || undefined;
  const displayName = customName || fallbackName(rawSummary, updatedAt);
  const kind = raw?.session_kind === "subagent" ? ("subagent" as const) : undefined;
  const pinnedAt = typeof override?.pinnedAt === "number" && override.pinnedAt > 0 ? override.pinnedAt : undefined;
  const archivedAt = typeof override?.archivedAt === "number" && override.archivedAt > 0 ? override.archivedAt : undefined;
  return {
    id,
    cwd: sessCwd,
    displayName,
    rawSummary,
    customName,
    updatedAt,
    createdAt,
    numMessages,
    modelId,
    kind,
    pinnedAt,
    archivedAt,
  };
}

export interface SessionIndexEntry {
  /** Directory name = grok session id. */
  id: string;
  /** Modification time of the session's `summary.json` (ms). A cheap proxy for last activity —
   *  grok rewrites that file (which also holds `updated_at`) on every turn. */
  mtimeMs: number;
}

export interface IndexDeps {
  fs: FsLike;
  grokHome: string;
  cwd: string;
  log?: (msg: string) => void;
}

/** Cheap ordering pass: every session id newest-first by `summary.json` mtime, WITHOUT reading or
 *  parsing any summary content. One `stat` per dir instead of a `stat` + `read` + `JSON.parse`, so
 *  it stays fast even with thousands of sessions. The caller reads (via `readSessionEntries`) only
 *  the window it actually shows. mtime is an approximate sort key; the exact `updated_at` order is
 *  re-applied within the loaded page after reading. */
export function indexSessions(deps: IndexDeps): SessionIndexEntry[] {
  const { fs, grokHome, cwd, log } = deps;
  const dir = sessionsDirFor(grokHome, cwd);
  if (!fs.existsSync(dir)) return [];
  let names: string[];
  try {
    names = fs.readdirSync(dir);
  } catch (e) {
    log?.(`[sessions] failed to read ${dir}: ${(e as Error).message}`);
    return [];
  }
  const out: SessionIndexEntry[] = [];
  for (const name of names) {
    const summaryPath = path.join(dir, name, "summary.json");
    let st: { mtimeMs: number };
    try {
      // A stat on summary.json doubles as the "is this a real session dir?" check: a stray file
      // entry (or a dir without summary.json) makes the join non-existent and statSync throws.
      st = fs.statSync(summaryPath);
    } catch {
      continue;
    }
    out.push({ id: name, mtimeMs: st.mtimeMs });
  }
  out.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return out;
}

export interface ReadEntriesDeps {
  fs: FsLike;
  grokHome: string;
  cwd: string;
  ids: string[];
  overrides: SessionMetaOverrides;
  now?: () => number;
  log?: (msg: string) => void;
}

/** Read + parse summary.json for exactly the given ids (a page), returning full list entries in the
 *  same order. Malformed or vanished entries are skipped. This is the only path that touches file
 *  content, so callers keep it to the visible window. */
export function readSessionEntries(deps: ReadEntriesDeps): SessionListEntry[] {
  const { fs, grokHome, cwd, ids, overrides, log } = deps;
  const now = deps.now ? deps.now() : Date.now();
  const dir = sessionsDirFor(grokHome, cwd);
  const out: SessionListEntry[] = [];
  for (const id of ids) {
    const summaryPath = path.join(dir, id, "summary.json");
    let raw: any;
    try {
      raw = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
    } catch (e) {
      log?.(`[sessions] could not read summary.json for ${id}: ${(e as Error).message}`);
      continue;
    }
    out.push(buildEntry(id, raw, cwd, overrides, now));
  }
  return out;
}

export interface ContextUsage {
  used: number;
  window?: number;
  /** From signals.json when present — helps decide whether a used count is still pre-history. */
  turnCount?: number;
}

/** Read grok's persisted context usage from a session's `signals.json`
 *  (`contextTokensUsed` / `contextWindowTokens`). grok rewrites the file at the
 *  end of every turn — including a `/compact` turn — so it carries the real
 *  post-compact size that the ACP result meta doesn't (grok reports
 *  `totalTokens: 0` there, which the host strips; see `gateZeroTokenMeta`).
 *  It's also the only source of a count before any live turn has run, i.e. on
 *  a cold restore. Null when the file is missing/unreadable or the count isn't
 *  a positive number. Pure. */
export function readContextUsage(deps: { fs: FsLike; grokHome: string; cwd: string; id: string }): ContextUsage | null {
  const { fs, grokHome, cwd, id } = deps;
  const signalsPath = path.join(sessionsDirFor(grokHome, cwd), id, "signals.json");
  try {
    const raw = JSON.parse(fs.readFileSync(signalsPath, "utf8"));
    const used = raw?.contextTokensUsed;
    if (typeof used !== "number" || !Number.isFinite(used) || used <= 0) return null;
    const window = raw?.contextWindowTokens;
    const hasWindow = typeof window === "number" && Number.isFinite(window) && window > 0;
    const turnCount = raw?.turnCount;
    const hasTurn =
      typeof turnCount === "number" && Number.isFinite(turnCount) && turnCount >= 0;
    return {
      used,
      window: hasWindow ? window : undefined,
      turnCount: hasTurn ? turnCount : undefined,
    };
  } catch {
    return null;
  }
}

/** Disk sources for context-card category estimates (not tokenizer-exact). */
export interface SessionContextSources {
  systemPromptText?: string;
  agentsMdTexts: string[];
}

/** Read `system_prompt.txt` + AGENTS content from `prompt_context.json` for a session. Pure. */
export function readSessionContextSources(deps: {
  fs: FsLike;
  grokHome: string;
  cwd: string;
  id: string;
}): SessionContextSources {
  const { fs, grokHome, cwd, id } = deps;
  const dir = path.join(sessionsDirFor(grokHome, cwd), id);
  let systemPromptText: string | undefined;
  const agentsMdTexts: string[] = [];
  try {
    const sp = path.join(dir, "system_prompt.txt");
    if (fs.existsSync(sp)) {
      const t = fs.readFileSync(sp, "utf8");
      if (t.trim()) systemPromptText = t;
    }
  } catch { /* ignore */ }
  try {
    const pcPath = path.join(dir, "prompt_context.json");
    if (fs.existsSync(pcPath)) {
      const raw = JSON.parse(fs.readFileSync(pcPath, "utf8"));
      const files = raw?.agents_md_files;
      if (Array.isArray(files)) {
        for (const f of files) {
          if (typeof f?.content === "string" && f.content.trim()) agentsMdTexts.push(f.content);
        }
      }
    }
  } catch { /* ignore */ }
  return { systemPromptText, agentsMdTexts };
}

export interface SkillListingResult {
  text: string;
  count: number;
  skills: Array<{ name: string; description: string }>;
}

/**
 * Collect skill *catalog* entries (name + description only) from the same
 * roots the CLI scans. Used for the skills-listing estimate on the context card.
 * Pure over `fs`. Dedupes by skill name (first wins — higher-priority roots first).
 */
export function collectSkillListing(deps: {
  fs: FsLike;
  grokHome: string;
  cwd: string;
  /** Optional extra skill roots (absolute paths). */
  extraRoots?: string[];
}): SkillListingResult {
  // Lazy import keepers at call sites that need meta helpers — inline extract
  // here would create a circular risk if sessions were imported by breakdown;
  // extractSkillMeta lives in context-breakdown and is imported below only for
  // the format step. To keep sessions free of that dep for listing, parse lightly
  // here and let callers format via context-breakdown.
  const { fs, grokHome, cwd } = deps;
  const roots: string[] = [
    path.join(cwd, ".grok", "skills"),
    path.join(cwd, ".agents", "skills"),
    path.join(cwd, ".claude", "skills"),
    path.join(cwd, ".cursor", "skills"),
    path.join(grokHome, "skills"),
    path.join(grokHome, "bundled", "skills"),
    ...(deps.extraRoots ?? []),
  ];
  const seen = new Set<string>();
  const skills: Array<{ name: string; description: string }> = [];

  const walk = (dir: string, depth: number) => {
    if (depth > 6) return;
    let entries: string[];
    try {
      if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return;
      entries = fs.readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (name === "node_modules" || name === ".git") continue;
      const full = path.join(dir, name);
      let isDir = false;
      try {
        isDir = fs.statSync(full).isDirectory();
      } catch {
        continue;
      }
      if (isDir) {
        // Prefer SKILL.md inside this directory
        const skillMd = path.join(full, "SKILL.md");
        try {
          if (fs.existsSync(skillMd) && !fs.statSync(skillMd).isDirectory()) {
            const md = fs.readFileSync(skillMd, "utf8");
            const meta = parseSkillFrontmatterLite(md, name);
            const key = meta.name.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              skills.push(meta);
            }
            continue; // don't walk into skill package internals
          }
        } catch { /* fall through to recurse */ }
        walk(full, depth + 1);
      } else if (/^skill\.md$/i.test(name)) {
        try {
          const md = fs.readFileSync(full, "utf8");
          const base = path.basename(dir);
          const meta = parseSkillFrontmatterLite(md, base);
          const key = meta.name.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            skills.push(meta);
          }
        } catch { /* ignore */ }
      }
    }
  };

  for (const r of roots) walk(r, 0);

  // Listing blob matches context-breakdown.formatSkillListing shape
  const text = skills
    .map((s) => `- ${s.name}: ${s.description || "(no description)"}`)
    .join("\n");
  return { text, count: skills.length, skills };
}

/** Minimal frontmatter parse (duplicated lightly so sessions.ts stays free of
 *  context-breakdown for disk I/O tests). Keep in sync with extractSkillMeta. */
function parseSkillFrontmatterLite(
  md: string,
  fallbackName: string,
): { name: string; description: string } {
  let name = fallbackName;
  let description = "";
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md ?? "");
  if (fm) {
    const block = fm[1];
    const nameM = /^name:\s*(.+)$/m.exec(block);
    if (nameM) {
      let t = nameM[1].trim();
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) t = t.slice(1, -1);
      name = t.trim() || fallbackName;
    }
    const descM = /^description:\s*(.+)$/m.exec(block);
    if (descM) {
      let t = descM[1].trim();
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) t = t.slice(1, -1);
      description = t.trim();
    }
  }
  if (!description) {
    const body = fm ? (md ?? "").slice(fm[0].length) : (md ?? "");
    const para = body
      .trim()
      .replace(/^#+\s.*$/m, "")
      .trim()
      .split(/\n\n/)[0];
    description = (para || "").replace(/\s+/g, " ").trim().slice(0, 240);
  }
  return { name: name || fallbackName, description };
}

/** Full session list sorted by last activity. Equivalent to `indexSessions` + `readSessionEntries`
 *  over every id; reads every summary.json, so prefer the paginated index/read primitives on hot
 *  paths. Kept for callers that genuinely need the whole list at once. */
export function listSessions(deps: ListDeps): SessionListEntry[] {
  const { fs, grokHome, cwd, overrides, log } = deps;
  const now = deps.now ? deps.now() : Date.now();
  const index = indexSessions({ fs, grokHome, cwd, log });
  const out = readSessionEntries({
    fs,
    grokHome,
    cwd,
    ids: index.map((e) => e.id),
    overrides,
    now: () => now,
    log,
  });
  out.sort((a, b) => b.updatedAt - a.updatedAt);
  return out;
}

/** Pull the user-visible queries out of a grok `chat_history.jsonl`. grok wraps the
 *  user's actual prompt in `<user_query>…</user_query>` inside a `role:"user"`
 *  message; the separate `role:"user"` `<user_info>` context block carries no
 *  `<user_query>` and is naturally skipped. Non-user roles (system/assistant/
 *  reasoning) are ignored. Unparseable lines are skipped. Pure. */
export function extractUserQueries(chatHistoryJsonl: string): string[] {
  const out: string[] = [];
  for (const line of (chatHistoryJsonl ?? "").split(/\r?\n/)) {
    const s = line.trim();
    if (!s) continue;
    let o: any;
    try { o = JSON.parse(s); } catch { continue; }
    // grok keys the role on `type` (string like "system"/"user"/"reasoning"); some
    // builds use `role`. Either way we want only user turns.
    const role = o?.type ?? o?.role;
    if (role !== "user") continue;
    // Synthetic user turns — injected <system-reminder> / project-instructions /
    // background-task results — are not real queries; grok tags them `synthetic_reason`.
    if (o?.synthetic_reason) continue;
    const content = o?.content;
    const text = (
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map((c: any) => (typeof c === "string" ? c : c?.text ?? "")).join("")
          : ""
    ).trim();
    if (!text) continue;
    // Skip the environment-context block (carries no user prompt) and any stray
    // reminder that wasn't flagged synthetic.
    if (/^<user_info>/.test(text) || /^<system-reminder>/.test(text)) continue;
    // The prompt is usually wrapped in <user_query>…</user_query>, but NOT always —
    // grok/composer sends some prompts (notably slash commands like `/imagine`) as a
    // plain user message with no wrapper. Counting only wrapped queries made those
    // sessions look primer-only, so a real one could be swept. Unwrap when present,
    // otherwise take the message verbatim. (Tolerate a missing closing tag.)
    const m = text.match(/<user_query>([\s\S]*?)(?:<\/user_query>|$)/);
    out.push((m ? m[1] : text).trim());
  }
  return out;
}

/** Split a session's user queries into primer vs. real. A session is "empty" when
 *  it received our hidden primer and never a real (non-primer) query. Pure. */
export function classifyUserQueries(chatHistoryJsonl: string): { primer: number; real: number } {
  let primer = 0;
  let real = 0;
  for (const q of extractUserQueries(chatHistoryJsonl)) {
    if (isPrimerText(q)) primer++;
    else real++;
  }
  return { primer, real };
}

export interface EmptyPrimerInput {
  /** A user rename means the session matters — never empty, whatever its content. */
  customName?: string;
  /** `num_messages` from summary.json (the cheap gate; a primer-only session is ~4). */
  numMessages: number;
  /** `session_summary` from summary.json (fallback signal when no chat history). */
  summary?: string;
  /** `generated_title` from summary.json (fallback signal when no chat history). */
  generatedTitle?: string;
  /** `chat_history.jsonl` contents — the authoritative signal when provided. */
  chatHistory?: string;
}

/** Decide whether a session is an empty, primer-only extension session safe to
 *  delete. Bulletproof when `chatHistory` is supplied: true iff the session got our
 *  primer and zero real user queries — so a session we didn't start (no primer) or
 *  one with any real turn is never flagged. Without chat history it falls back to
 *  the conservative title heuristic ({@link isPrimerSummary}) gated on a low message
 *  count. Pure. */
export function isEmptyPrimerSession(
  inp: EmptyPrimerInput,
  maxMessages = EMPTY_PRIMER_MAX_MESSAGES,
): boolean {
  if (inp.customName?.trim()) return false;
  // Chat history is authoritative: a session is empty iff it got our primer and
  // ZERO real user queries — regardless of message count. An *agentic* primer turn
  // can balloon to dozens of tool/reasoning messages with no real user query (and
  // grok re-primes on restore/compact), so `num_messages` must NOT veto the content
  // signal — that false-negative left such sessions (e.g. a 74-message primer-only
  // session) in history forever.
  if (typeof inp.chatHistory === "string") {
    const { primer, real } = classifyUserQueries(inp.chatHistory);
    return primer > 0 && real === 0;
  }
  // No chat history available — fall back to the conservative title heuristic, gated
  // on a low message count so a large real session can't be flagged on its title.
  if (inp.numMessages > maxMessages) return false;
  return isPrimerSummary(`${inp.summary ?? ""} ${inp.generatedTitle ?? ""}`);
}

/** Remove the on-disk session directory. No-op if missing. */
export function deleteSessionDir(deps: DeleteDeps): void {
  const { fs, grokHome, cwd, id } = deps;
  const dir = path.join(sessionsDirFor(grokHome, cwd), id);
  if (!fs.existsSync(dir)) return;
  if (fs.rmSync) {
    fs.rmSync(dir, { recursive: true, force: true });
  } else {
    fs.rmdirSync(dir, { recursive: true });
  }
}

export interface ClearDeps {
  fs: FsLike;
  grokHome: string;
  cwd: string;
  /** Session id to keep (the live/focused one — grok re-persists it, so deleting it wouldn't stick). */
  exceptId?: string;
}

/** Remove every session directory under `cwd`, optionally keeping one. Returns the ids it removed.
 *  Best-effort: a directory that fails to remove is skipped, not thrown, so one locked dir doesn't
 *  abort the sweep. The directory name is the session id (mirrors `deleteSessionDir`). */
export function clearSessions(deps: ClearDeps): string[] {
  const { fs, grokHome, cwd, exceptId } = deps;
  const dir = sessionsDirFor(grokHome, cwd);
  if (!fs.existsSync(dir)) return [];
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  const removed: string[] = [];
  for (const name of entries) {
    if (exceptId && name === exceptId) continue;
    const full = path.join(dir, name);
    try {
      if (!fs.statSync(full).isDirectory()) continue;
    } catch {
      continue;
    }
    try {
      if (fs.rmSync) fs.rmSync(full, { recursive: true, force: true });
      else fs.rmdirSync(full, { recursive: true });
      removed.push(name);
    } catch {
      continue;
    }
  }
  return removed;
}

/** Default node fs adapter for production use. */
export const defaultFs: FsLike = {
  existsSync: nodeFs.existsSync,
  readdirSync: (p) => nodeFs.readdirSync(p) as string[],
  readFileSync: (p, enc) => nodeFs.readFileSync(p, enc),
  statSync: (p) => nodeFs.statSync(p),
  rmSync: (nodeFs as any).rmSync
    ? (p, opts) => (nodeFs as any).rmSync(p, opts)
    : undefined,
  rmdirSync: (p, opts) => nodeFs.rmdirSync(p, opts as any),
};

/** Resolve the grok home directory honoring HOME/USERPROFILE (matching cli-locator semantics). */
export function resolveGrokHome(env: NodeJS.ProcessEnv = process.env): string {
  const home = env.HOME || env.USERPROFILE || "";
  return path.join(home, ".grok");
}
