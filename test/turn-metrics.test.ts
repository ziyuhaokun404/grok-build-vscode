import { describe, it, expect } from "vitest";
import {
  beginHumanWait,
  beginShellWait,
  beginTurnTiming,
  computeTurnMetrics,
  endHumanWait,
  endShellWait,
  formatDurationMs,
  formatTokensPerSec,
  formatTurnMetricsLine,
  formatTurnMetricsTooltip,
  markFirstToken,
} from "../src/turn-metrics";

describe("turn-metrics", () => {
  it("computes TTFT, duration, and tok/s with tool-wait deduction", () => {
    const s = beginTurnTiming(1000, 3);
    markFirstToken(s, 1500, "thought"); // TTFT 500ms
    beginShellWait(s, "t1", 2000);
    endShellWait(s, "t1", 4000); // 2000ms tool wait
    const m = computeTurnMetrics(s, 5000, {
      outputTokens: 100,
      reasoningTokens: 50,
      inputTokens: 1000,
    });
    expect(m.ttftMs).toBe(500);
    expect(m.durationMs).toBe(4000);
    expect(m.afterUserMessage).toBe(3);
    // generation window = (5000-1500) - 2000 = 1500ms → 150 tokens / 1.5s = 100 tok/s
    expect(m.generationMs).toBe(1500);
    expect(m.tokensPerSec).toBeCloseTo(100, 5);
  });

  it("first token accepts thought or message; only first counts", () => {
    const s = beginTurnTiming(0, 1);
    markFirstToken(s, 100, "message");
    markFirstToken(s, 200, "thought");
    expect(s.tFirst).toBe(100);
    expect(s.firstEvent).toBe("message");
  });

  it("skips tok/s on compact and totalTokens:0", () => {
    const compact = beginTurnTiming(0, 1, { isCompact: true });
    markFirstToken(compact, 100, "thought");
    const m1 = computeTurnMetrics(compact, 1100, { outputTokens: 50 });
    expect(m1.tokensPerSec).toBeUndefined();

    const zero = beginTurnTiming(0, 1);
    markFirstToken(zero, 100, "thought");
    const m2 = computeTurnMetrics(zero, 1100, { outputTokens: 50, totalTokens: 0 });
    expect(m2.tokensPerSec).toBeUndefined();
  });

  it("human wait counts toward toolWaitMs", () => {
    const s = beginTurnTiming(0, 1);
    markFirstToken(s, 50, "thought");
    beginHumanWait(s, 100);
    endHumanWait(s, 600);
    const m = computeTurnMetrics(s, 1000, { outputTokens: 90 });
    // gen window = 1000-50-500 = 450ms → 90/0.45 = 200
    expect(m.generationMs).toBe(450);
    expect(m.tokensPerSec).toBeCloseTo(200, 5);
  });

  it("parallel tools count wall-clock once (not sum of durations)", () => {
    const s = beginTurnTiming(0, 1);
    markFirstToken(s, 0, "thought");
    // Two tools overlap 100–600 and 200–700 → busy 100–700 = 600ms, not 500+500.
    beginShellWait(s, "a", 100);
    beginShellWait(s, "b", 200);
    endShellWait(s, "a", 600);
    endShellWait(s, "b", 700);
    const m = computeTurnMetrics(s, 1000, { outputTokens: 100 });
    // gen = 1000 - 0 - 600 = 400ms → 100 / 0.4 = 250
    expect(m.generationMs).toBe(400);
    expect(m.tokensPerSec).toBeCloseTo(250, 5);
  });

  it("read/search-style tools (any id) deduct like shell tools", () => {
    const s = beginTurnTiming(0, 1);
    markFirstToken(s, 10, "message");
    beginShellWait(s, "read-1", 100);
    endShellWait(s, "read-1", 500);
    const m = computeTurnMetrics(s, 800, { outputTokens: 40 });
    // gen = 800-10-400 = 390 → 40/0.39 ≈ 102.56
    expect(m.generationMs).toBe(390);
    expect(m.tokensPerSec).toBeCloseTo(40 / 0.39, 5);
  });

  it("overlapping human wait + tool does not double-count wall clock", () => {
    const s = beginTurnTiming(0, 1);
    markFirstToken(s, 0, "thought");
    beginShellWait(s, "t", 100);
    beginHumanWait(s, 200); // during tool
    endShellWait(s, "t", 400);
    endHumanWait(s, 500);
    const m = computeTurnMetrics(s, 1000, { outputTokens: 50 });
    // busy 100–500 = 400ms
    expect(m.generationMs).toBe(600);
    expect(m.tokensPerSec).toBeCloseTo(50 / 0.6, 5);
  });

  it("formats duration and footer line in Chinese", () => {
    expect(formatDurationMs(800)).toBe("800ms");
    expect(formatDurationMs(1500)).toBe("1.5s");
    expect(formatDurationMs(12500)).toBe("13s");
    expect(formatTokensPerSec(42.3)).toBe("42.3");
    const line = formatTurnMetricsLine({
      ttftMs: 800,
      durationMs: 12400,
      tokensPerSec: 36.2,
    });
    expect(line).toContain("首字");
    expect(line).toContain("耗时");
    expect(line).toContain("tok/s");
    const tip = formatTurnMetricsTooltip({
      ttftMs: 800,
      durationMs: 12400,
      generationMs: 5000,
      tokensPerSec: 36,
      inputTokens: 1200,
      outputTokens: 100,
      reasoningTokens: 50,
    });
    expect(tip).toContain("生成窗口");
    expect(tip).toContain("本地处理");
    expect(tip).toContain("输入");
  });

  it("marks cancelled turns", () => {
    const s = beginTurnTiming(0, 2);
    s.cancelled = true;
    markFirstToken(s, 100, "thought");
    const m = computeTurnMetrics(s, 500, { outputTokens: 10 });
    expect(m.cancelled).toBe(true);
    expect(formatTurnMetricsLine(m)).toContain("已取消");
  });
});
