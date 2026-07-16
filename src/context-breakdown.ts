/**
 * Session context-window breakdown for the top-of-chat experimental card.
 *
 * Authoritative used/window come from the CLI (signals / session-info / meta).
 * Per-category rows for system prompt, AGENTS.md, and skills listing are
 * **estimates** (chars/4 heuristic) because `/context` is TUI-only over ACP
 * and never streams a categorical breakdown (research + live probe 0.2.101).
 * Pure — no vscode / fs — so unit tests stay hermetic.
 */

export type ContextBucketId =
  | "system"
  | "agents"
  | "skills"
  | "other_fixed"
  | "messages"
  | "free";

export type ContextBucketSource = "exact" | "estimate" | "residual";

export interface ContextBucket {
  id: ContextBucketId;
  /** Display label (Chinese, ready for the webview). */
  label: string;
  tokens: number;
  source: ContextBucketSource;
}

export interface ContextBreakdown {
  used: number;
  window: number;
  /** Session fixed baseline when captured (empty / pre-history). */
  fixed?: number;
  buckets: ContextBucket[];
  skillsCount?: number;
  /** Short footnote for the card footer. */
  note: string;
}

/** Rough token estimate used when the CLI does not expose a category count. */
export function estimateTokensFromText(text: string | undefined | null): number {
  if (!text) return 0;
  const n = text.length;
  if (n <= 0) return 0;
  return Math.ceil(n / 4);
}

/**
 * Pull name + description from a SKILL.md body for the skills-*listing* row
 * (not the full skill body — only the catalog entry that sits in context).
 */
export function extractSkillMeta(
  md: string,
  fallbackName: string,
): { name: string; description: string } {
  let name = fallbackName;
  let description = "";
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md ?? "");
  if (fm) {
    const block = fm[1];
    const nameM = /^name:\s*(.+)$/m.exec(block);
    if (nameM) name = stripYamlScalar(nameM[1]);
    // description may be a single line or a YAML folded/quoted scalar on one line
    const descM = /^description:\s*(.+)$/m.exec(block);
    if (descM) description = stripYamlScalar(descM[1]);
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

function stripYamlScalar(s: string): string {
  let t = (s || "").trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }
  return t.trim();
}

/** Join skill catalog entries into a single listing blob for estimation. */
export function formatSkillListing(
  skills: Array<{ name: string; description: string }>,
): string {
  if (!skills.length) return "";
  return skills
    .map((s) => `- ${s.name}: ${s.description || "(no description)"}`)
    .join("\n");
}

export interface BuildBreakdownInput {
  used: number;
  window: number;
  /** Fixed overhead captured before real conversation growth (optional). */
  fixed?: number;
  systemPromptText?: string;
  agentsMdTexts?: string[];
  skillListingText?: string;
  skillsCount?: number;
}

/**
 * Build the card model. Sub-rows that exceed `fixed` (when known) are scaled
 * down so they never over-account. Missing estimates simply omit that row.
 */
export function buildBreakdown(input: BuildBreakdownInput): ContextBreakdown {
  const used = Math.max(0, Math.floor(input.used) || 0);
  const window =
    typeof input.window === "number" && Number.isFinite(input.window) && input.window > 0
      ? Math.floor(input.window)
      : 500_000;
  const free = Math.max(0, window - used);

  const sysEst = estimateTokensFromText(input.systemPromptText);
  const agentsEst = estimateTokensFromText((input.agentsMdTexts ?? []).join("\n\n"));
  const skillsEst = estimateTokensFromText(input.skillListingText);
  const estSum = sysEst + agentsEst + skillsEst;

  const fixed =
    typeof input.fixed === "number" && Number.isFinite(input.fixed) && input.fixed > 0
      ? Math.floor(input.fixed)
      : undefined;

  // Scale sub-estimates to fit under fixed when we know the real fixed budget.
  let scale = 1;
  if (fixed != null && estSum > fixed && estSum > 0) {
    scale = fixed / estSum;
  }
  const sys = Math.floor(sysEst * scale);
  const agents = Math.floor(agentsEst * scale);
  const skills = Math.floor(skillsEst * scale);
  const scaledSum = sys + agents + skills;

  const buckets: ContextBucket[] = [];

  if (sys > 0) {
    buckets.push({
      id: "system",
      label: "System prompt",
      tokens: sys,
      source: "estimate",
    });
  }
  if (agents > 0) {
    buckets.push({
      id: "agents",
      label: "项目规则 (AGENTS.md)",
      tokens: agents,
      source: "estimate",
    });
  }
  if (skills > 0 || (input.skillsCount != null && input.skillsCount > 0)) {
    buckets.push({
      id: "skills",
      label:
        input.skillsCount != null && input.skillsCount > 0
          ? `Skills 清单 (${input.skillsCount})`
          : "Skills 清单",
      tokens: skills,
      source: "estimate",
    });
  }

  if (fixed != null) {
    const other = Math.max(0, fixed - scaledSum);
    if (other > 0) {
      buckets.push({
        id: "other_fixed",
        label: "其它固定（工具/MCP/…）",
        tokens: other,
        source: "residual",
      });
    }
    const messages = Math.max(0, used - fixed);
    buckets.push({
      id: "messages",
      label: "对话与推理",
      tokens: messages,
      source: "residual",
    });
  } else {
    // No session baseline — treat remainder after estimates as conversation+other.
    const rest = Math.max(0, used - scaledSum);
    if (rest > 0) {
      buckets.push({
        id: "messages",
        label: "对话与其它",
        tokens: rest,
        source: "residual",
      });
    }
  }

  buckets.push({
    id: "free",
    label: "剩余",
    tokens: free,
    source: "exact",
  });

  const note =
    fixed != null
      ? "已用/窗口由 CLI 统计；System / AGENTS / Skills 为本地估算（约）。"
      : "已用/窗口由 CLI 统计；分项为本地估算（约）。恢复的会话无固定开销基线。";

  return {
    used,
    window,
    fixed,
    buckets,
    skillsCount: input.skillsCount,
    note,
  };
}
