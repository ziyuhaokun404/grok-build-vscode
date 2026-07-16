import { describe, it, expect } from "vitest";
import {
  buildBreakdown,
  estimateTokensFromText,
  extractSkillMeta,
  formatSkillListing,
} from "../src/context-breakdown";

describe("estimateTokensFromText", () => {
  it("returns 0 for empty", () => {
    expect(estimateTokensFromText("")).toBe(0);
    expect(estimateTokensFromText(null)).toBe(0);
    expect(estimateTokensFromText(undefined)).toBe(0);
  });

  it("uses ceil(length/4)", () => {
    expect(estimateTokensFromText("abcd")).toBe(1);
    expect(estimateTokensFromText("abcde")).toBe(2);
    expect(estimateTokensFromText("a".repeat(100))).toBe(25);
  });
});

describe("extractSkillMeta", () => {
  it("reads name and description from frontmatter", () => {
    const md = `---
name: commit
description: Create conventional commits
---

# Body
more`;
    expect(extractSkillMeta(md, "dir")).toEqual({
      name: "commit",
      description: "Create conventional commits",
    });
  });

  it("falls back to directory name and first paragraph", () => {
    const md = "# Title\n\nDo the thing carefully.\n\nMore.";
    expect(extractSkillMeta(md, "my-skill")).toEqual({
      name: "my-skill",
      description: "Do the thing carefully.",
    });
  });
});

describe("formatSkillListing", () => {
  it("joins catalog lines", () => {
    expect(
      formatSkillListing([
        { name: "a", description: "one" },
        { name: "b", description: "" },
      ]),
    ).toBe("- a: one\n- b: (no description)");
  });
});

describe("buildBreakdown", () => {
  it("splits fixed vs messages when baseline is known", () => {
    const bd = buildBreakdown({
      used: 10000,
      window: 100000,
      fixed: 3000,
      systemPromptText: "x".repeat(400), // ~100 tokens
      agentsMdTexts: ["y".repeat(400)], // ~100
      skillListingText: "z".repeat(400), // ~100
      skillsCount: 3,
    });
    expect(bd.used).toBe(10000);
    expect(bd.window).toBe(100000);
    expect(bd.fixed).toBe(3000);

    const byId = Object.fromEntries(bd.buckets.map((b) => [b.id, b]));
    expect(byId.system?.tokens).toBe(100);
    expect(byId.agents?.tokens).toBe(100);
    expect(byId.skills?.tokens).toBe(100);
    expect(byId.skills?.label).toContain("3");
    expect(byId.other_fixed?.tokens).toBe(2700); // 3000 - 300
    expect(byId.messages?.tokens).toBe(7000); // 10000 - 3000
    expect(byId.free?.tokens).toBe(90000);
    expect(byId.system?.source).toBe("estimate");
    expect(byId.free?.source).toBe("exact");
  });

  it("scales estimates down when they exceed fixed", () => {
    const bd = buildBreakdown({
      used: 5000,
      window: 100000,
      fixed: 100,
      systemPromptText: "a".repeat(800), // 200
      agentsMdTexts: ["b".repeat(800)], // 200
      skillListingText: "c".repeat(800), // 200
    });
    const est = bd.buckets
      .filter((b) => b.id === "system" || b.id === "agents" || b.id === "skills")
      .reduce((s, b) => s + b.tokens, 0);
    expect(est).toBeLessThanOrEqual(100);
    // Floor rounding can leave a tiny residual under fixed — never overshoot.
    const other = bd.buckets.find((b) => b.id === "other_fixed")?.tokens ?? 0;
    expect(est + other).toBeLessThanOrEqual(100);
  });

  it("without fixed baseline uses residual for conversation", () => {
    const bd = buildBreakdown({
      used: 5000,
      window: 100000,
      systemPromptText: "a".repeat(400), // 100
    });
    const byId = Object.fromEntries(bd.buckets.map((b) => [b.id, b]));
    expect(byId.system?.tokens).toBe(100);
    expect(byId.messages?.label).toBe("对话与其它");
    expect(byId.messages?.tokens).toBe(4900);
    expect(byId.other_fixed).toBeUndefined();
    expect(bd.note).toMatch(/恢复/);
  });

  it("clamps free at zero when used exceeds window", () => {
    const bd = buildBreakdown({ used: 120, window: 100 });
    expect(bd.buckets.find((b) => b.id === "free")?.tokens).toBe(0);
  });
});
