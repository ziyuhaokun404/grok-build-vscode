/**
 * Per-turn latency / throughput metrics for the chat footer.
 *
 * Timing is owned by the host (Session); this module is pure so it can be
 * unit-tested without VS Code. Definitions:
 *   - TTFT: tFirst − t0 (first thought or message chunk)
 *   - duration: tEnd − t0 (wall clock for the whole turn)
 *   - tok/s: genTokens / max(generationMs, 1) where generationMs is
 *     (tEnd − tFirst − nonGenWaitMs), floored at a 1ms minimum
 *   - genTokens: outputTokens + reasoningTokens
 *   - nonGenWaitMs: wall-clock time spent on *non-generation* work after
 *     first token — tool calls of any kind (read/search/edit/shell/…), plus
 *     human waits (permission / question / plan). Parallel tools count once
 *     (merged intervals), so local processing does not inflate the window
 *     and does not double-count under concurrency.
 */

import type { PromptResultMeta } from "./acp-dispatch";

export interface TurnTimingState {
  t0: number;
  tFirst?: number;
  firstEvent?: "thought" | "message";
  /**
   * Accumulated wall-clock ms that is NOT model generation
   * (tools of any kind + human waits). Kept as `toolWaitMs` for history compat.
   */
  toolWaitMs: number;
  /** Open "needs-you" wait (permission / question / plan). */
  waitOpenAt?: number;
  /** Open tool-call ids (any kind) — values unused; set membership drives wall clock. */
  shellOpen: Map<string, number>;
  /**
   * When non-generation work last became active (first open tool or human wait).
   * Cleared when all such sources go idle; the span is added to toolWaitMs.
   */
  nonGenSince?: number;
  /** userMessageCount at turn start — for resume placement. */
  userMessageIndex: number;
  /** Native /compact — never trust in/out for tok/s. */
  isCompact?: boolean;
  cancelled?: boolean;
}

export interface TurnMetrics {
  ttftMs?: number;
  durationMs: number;
  /** Generation window used for tok/s (after non-gen wait deduction). */
  generationMs?: number;
  tokensPerSec?: number;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cachedReadTokens?: number;
  totalTokens?: number;
  modelId?: string;
  cancelled?: boolean;
  /** Position for resume: user messages completed when this turn started. */
  afterUserMessage?: number;
}

export function beginTurnTiming(
  now: number,
  userMessageIndex: number,
  opts?: { isCompact?: boolean },
): TurnTimingState {
  return {
    t0: now,
    toolWaitMs: 0,
    shellOpen: new Map(),
    userMessageIndex,
    isCompact: opts?.isCompact,
  };
}

export function markFirstToken(
  state: TurnTimingState,
  now: number,
  kind: "thought" | "message",
): void {
  if (state.tFirst != null) return;
  if (now < state.t0) return;
  state.tFirst = now;
  state.firstEvent = kind;
}

/** True while any tool is running or a human wait is open. */
function nonGenActive(state: TurnTimingState): boolean {
  return state.shellOpen.size > 0 || state.waitOpenAt != null;
}

/** Arm wall-clock non-gen interval if not already open. */
function armNonGen(state: TurnTimingState, now: number): void {
  if (state.nonGenSince == null) state.nonGenSince = now;
}

/** If no non-gen sources remain, fold the open interval into toolWaitMs. */
function flushNonGenIfIdle(state: TurnTimingState, now: number): void {
  if (nonGenActive(state)) return;
  if (state.nonGenSince == null) return;
  state.toolWaitMs += Math.max(0, now - state.nonGenSince);
  state.nonGenSince = undefined;
}

export function beginHumanWait(state: TurnTimingState, now: number): void {
  if (state.waitOpenAt != null) return;
  state.waitOpenAt = now;
  armNonGen(state, now);
}

export function endHumanWait(state: TurnTimingState, now: number): void {
  if (state.waitOpenAt == null) return;
  state.waitOpenAt = undefined;
  flushNonGenIfIdle(state, now);
}

/**
 * Mark a tool-call as non-generation work (read/search/edit/shell/subagent/…).
 * Named beginShellWait historically; applies to every tool kind.
 */
export function beginShellWait(state: TurnTimingState, toolCallId: string, now: number): void {
  if (!toolCallId || state.shellOpen.has(toolCallId)) return;
  state.shellOpen.set(toolCallId, now);
  armNonGen(state, now);
}

/** @deprecated alias — same as beginShellWait (all tool kinds). */
export const beginToolWait = beginShellWait;

export function endShellWait(state: TurnTimingState, toolCallId: string, now: number): void {
  if (!toolCallId) return;
  if (!state.shellOpen.has(toolCallId)) return;
  state.shellOpen.delete(toolCallId);
  flushNonGenIfIdle(state, now);
}

/** @deprecated alias — same as endShellWait. */
export const endToolWait = endShellWait;

/** Close any still-open waits at turn end so they count toward toolWaitMs. */
export function finalizeOpenWaits(state: TurnTimingState, now: number): void {
  endHumanWait(state, now);
  for (const id of [...state.shellOpen.keys()]) {
    endShellWait(state, id, now);
  }
}

function genTokens(meta: PromptResultMeta | undefined): number | undefined {
  if (!meta) return undefined;
  const out = meta.outputTokens;
  const reason = meta.reasoningTokens;
  if (out == null && reason == null) return undefined;
  return Math.max(0, (out ?? 0) + (reason ?? 0));
}

/**
 * Build final metrics for a completed (or cancelled) turn.
 * `isCompact` / zero totalTokens disables tok/s (stale in/out on compact).
 */
export function computeTurnMetrics(
  state: TurnTimingState,
  tEnd: number,
  meta: PromptResultMeta | undefined,
  opts?: { cancelled?: boolean },
): TurnMetrics {
  const now = Math.max(tEnd, state.t0);
  finalizeOpenWaits(state, now);

  const durationMs = Math.max(0, now - state.t0);
  const cancelled = !!(opts?.cancelled || state.cancelled);

  const result: TurnMetrics = {
    durationMs,
    cancelled: cancelled || undefined,
    afterUserMessage: state.userMessageIndex,
    inputTokens: meta?.inputTokens,
    outputTokens: meta?.outputTokens,
    reasoningTokens: meta?.reasoningTokens,
    cachedReadTokens: meta?.cachedReadTokens,
    totalTokens: meta?.totalTokens,
    modelId: meta?.modelId,
  };

  if (state.tFirst != null && state.tFirst >= state.t0) {
    result.ttftMs = Math.max(0, state.tFirst - state.t0);
  }

  // tok/s: only when we have generation tokens and a first-token mark.
  // Compact turns report stale in/out — never show a fake rate.
  // Non-generation wall time (tools + human waits) is excluded from the window.
  const skipRate = state.isCompact || meta?.totalTokens === 0;
  const tokens = genTokens(meta);
  if (!skipRate && tokens != null && tokens > 0 && state.tFirst != null) {
    const rawGen = Math.max(0, now - state.tFirst - state.toolWaitMs);
    const generationMs = Math.max(1, rawGen);
    result.generationMs = generationMs;
    result.tokensPerSec = tokens / (generationMs / 1000);
  }

  return result;
}

/** Format a duration in ms for the footer (中文-friendly compact form). */
export function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  if (ms < 1000) return `${Math.max(1, Math.round(ms))}ms`;
  const s = ms / 1000;
  if (s < 10) return `${s.toFixed(1)}s`;
  if (s < 60) return `${Math.round(s)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m}:${String(rem).padStart(2, "0")}`;
}

export function formatTokensPerSec(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return "—";
  if (rate >= 100) return `${Math.round(rate)}`;
  if (rate >= 10) return rate.toFixed(1);
  return rate.toFixed(1);
}

/** One-line footer text (no trailing time — caller appends timestamp separately). */
export function formatTurnMetricsLine(m: TurnMetrics): string {
  const parts: string[] = [];
  if (m.ttftMs != null) parts.push(`首字 ${formatDurationMs(m.ttftMs)}`);
  parts.push(`耗时 ${formatDurationMs(m.durationMs)}`);
  if (m.tokensPerSec != null) parts.push(`${formatTokensPerSec(m.tokensPerSec)} tok/s`);
  const up = fmtCount(m.inputTokens);
  const down = fmtCount(m.outputTokens);
  const cache = fmtCount(m.cachedReadTokens);
  if (up != null) parts.push(`上传 ${up}`);
  if (down != null) parts.push(`下载 ${down}`);
  if (cache != null) parts.push(`缓存 ${cache}`);
  if (m.cancelled) parts.push("已取消");
  return parts.join(" · ");
}

function fmtCount(n: number | undefined): string | undefined {
  if (n == null || !Number.isFinite(n)) return undefined;
  return Math.round(n).toLocaleString("zh-CN");
}

/** Tooltip / title detail for the metrics span. */
export function formatTurnMetricsTooltip(m: TurnMetrics): string {
  const lines: string[] = [];
  if (m.ttftMs != null) lines.push(`首字耗时：${formatDurationMs(m.ttftMs)}`);
  lines.push(`对话耗时：${formatDurationMs(m.durationMs)}`);
  if (m.generationMs != null) {
    lines.push(`生成窗口：${formatDurationMs(m.generationMs)}（已扣除工具/本地处理与等待）`);
  }
  if (m.tokensPerSec != null) lines.push(`吞吐：${formatTokensPerSec(m.tokensPerSec)} tok/s`);
  const inT = fmtCount(m.inputTokens);
  const outT = fmtCount(m.outputTokens);
  const reasonT = fmtCount(m.reasoningTokens);
  const cacheT = fmtCount(m.cachedReadTokens);
  const bits = [
    inT != null ? `上传 ${inT}` : null,
    outT != null ? `下载 ${outT}` : null,
    reasonT != null ? `思考 ${reasonT}` : null,
    cacheT != null ? `缓存 ${cacheT}` : null,
  ].filter(Boolean);
  if (bits.length) lines.push(bits.join(" · "));
  if (m.totalTokens != null) lines.push(`上下文 ${fmtCount(m.totalTokens)}`);
  if (m.modelId) lines.push(`模型 ${m.modelId}`);
  if (m.cancelled) lines.push("本轮已取消");
  return lines.join("\n");
}
