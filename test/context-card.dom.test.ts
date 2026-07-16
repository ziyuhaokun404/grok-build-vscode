import { describe, it, expect } from "vitest";
import { bootWebview, dispatch, click } from "./webview-harness";

describe("context card (experimental)", () => {
  it("stays hidden until contextUsage arrives with used tokens", () => {
    const { window, doc } = bootWebview();
    const card = doc.getElementById("context-card")!;
    expect(card.hidden).toBe(true);

    dispatch(window, {
      type: "initialState",
      effort: "",
      cwd: "/tmp",
      useCtrlEnter: false,
      extVersion: "0.0.0",
      showThinking: false,
      expandCommandOutputs: false,
      showTurnMetrics: true,
      showContextCard: true,
    });
    expect(card.hidden).toBe(true);

    dispatch(window, {
      type: "contextUsage",
      used: 12000,
      window: 500000,
      breakdown: {
        used: 12000,
        window: 500000,
        fixed: 3000,
        note: "test note",
        buckets: [
          { id: "system", label: "System prompt", tokens: 1000, source: "estimate" },
          { id: "skills", label: "Skills 清单 (2)", tokens: 500, source: "estimate" },
          { id: "other_fixed", label: "其它固定（工具/MCP/…）", tokens: 1500, source: "residual" },
          { id: "messages", label: "对话与推理", tokens: 9000, source: "residual" },
          { id: "free", label: "剩余", tokens: 488000, source: "exact" },
        ],
      },
    });

    expect(card.hidden).toBe(false);
    expect(doc.getElementById("context-card-usage")!.textContent).toMatch(/12K/);
    expect(doc.getElementById("context-card-pct")!.textContent).toBe("2%");
    // Default collapsed
    expect(doc.getElementById("context-card-details")!.hidden).toBe(true);
    expect(doc.getElementById("context-card-toggle")!.getAttribute("aria-expanded")).toBe("false");
  });

  it("expands to show category rows and collapses again", () => {
    const { window, doc } = bootWebview();
    dispatch(window, {
      type: "initialState",
      effort: "",
      cwd: "/tmp",
      useCtrlEnter: false,
      extVersion: "0.0.0",
      showThinking: false,
      expandCommandOutputs: false,
      showTurnMetrics: true,
      showContextCard: true,
    });
    dispatch(window, {
      type: "contextUsage",
      used: 5000,
      window: 100000,
      breakdown: {
        used: 5000,
        window: 100000,
        note: "估算说明",
        buckets: [
          { id: "system", label: "System prompt", tokens: 800, source: "estimate" },
          { id: "messages", label: "对话与其它", tokens: 4200, source: "residual" },
          { id: "free", label: "剩余", tokens: 95000, source: "exact" },
        ],
      },
    });

    const toggle = doc.getElementById("context-card-toggle")!;
    click(window, toggle);
    const details = doc.getElementById("context-card-details")!;
    expect(details.hidden).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(details.textContent).toContain("System prompt");
    expect(details.textContent).toContain("估算说明");

    click(window, toggle);
    expect(details.hidden).toBe(true);
  });

  it("hides when showContextCard is toggled off", () => {
    const { window, doc } = bootWebview();
    dispatch(window, {
      type: "initialState",
      effort: "",
      cwd: "/tmp",
      useCtrlEnter: false,
      extVersion: "0.0.0",
      showThinking: false,
      expandCommandOutputs: false,
      showTurnMetrics: true,
      showContextCard: true,
    });
    dispatch(window, { type: "contextUsage", used: 1000, window: 500000 });
    const card = doc.getElementById("context-card")!;
    expect(card.hidden).toBe(false);

    dispatch(window, { type: "showContextCard", value: false });
    expect(card.hidden).toBe(true);

    dispatch(window, { type: "showContextCard", value: true });
    expect(card.hidden).toBe(false);
  });

  it("donut popover offers a jump that expands the top context card", () => {
    const { window, doc } = bootWebview();
    dispatch(window, {
      type: "initialState",
      effort: "",
      cwd: "/tmp",
      useCtrlEnter: false,
      extVersion: "0.0.0",
      showThinking: false,
      expandCommandOutputs: false,
      showTurnMetrics: true,
      showContextCard: true,
    });
    dispatch(window, {
      type: "contextUsage",
      used: 4000,
      window: 100000,
      breakdown: {
        used: 4000,
        window: 100000,
        note: "note",
        buckets: [
          { id: "system", label: "System prompt", tokens: 500, source: "estimate" },
          { id: "free", label: "剩余", tokens: 96000, source: "exact" },
        ],
      },
    });

    const donut = doc.getElementById("donut")!;
    click(window, donut);
    const jump = doc.querySelector(".context-card-jump-btn") as HTMLElement | null;
    expect(jump).toBeTruthy();
    click(window, jump!);
    expect(doc.getElementById("context-card-details")!.hidden).toBe(false);
    expect(doc.getElementById("context-card-toggle")!.getAttribute("aria-expanded")).toBe("true");
  });
});
