export interface SlashCmd {
  name: string;
  description?: string;
  input?: { hint?: string };
}

/**
 * Slash commands the extension hides from both the autocomplete list and the
 * dispatch gate. `/always-approve` (#31) only mutates grok's *global*
 * config.toml — a surprising, sticky side effect that then silences permission
 * cards in every grok session — and is a no-op over ACP anyway. `/context`
 * (#39) renders only in the CLI's own TUI: over ACP stdio it streams nothing
 * back, so selecting it silently does nothing (`/session-info` is the working
 * equivalent). Filtered at ingestion (see `filterAdvertisedCommands`).
 */
export const HIDDEN_SLASH_COMMANDS: ReadonlySet<string> = new Set(["always-approve", "context"]);

/** Drop hidden commands from an advertised `available_commands_update` list. */
export function filterAdvertisedCommands<T extends { name: string }>(commands: T[]): T[] {
  return commands.filter((c) => !HIDDEN_SLASH_COMMANDS.has(c.name));
}

/**
 * Chinese display copy for slash-command autocomplete. Command **names** stay
 * English (CLI dispatch is name-based). Skill/plugin-defined commands with no
 * map entry keep the CLI description unchanged.
 */
export interface SlashLocale {
  description: string;
  hint?: string;
}

/** Built-in + common alias names → Chinese description (and optional arg hint). */
export const SLASH_COMMAND_ZH: Readonly<Record<string, SlashLocale>> = {
  // Session
  new: { description: "新建会话，清空当前对话", hint: undefined },
  clear: { description: "新建会话，清空当前对话（/new 别名）" },
  resume: { description: "打开会话列表，从磁盘恢复历史会话" },
  compact: {
    description: "压缩对话历史以释放上下文；可附加要保留的重点",
    hint: "[保留内容…]",
  },
  context: {
    description: "显示上下文占用与分类明细（仅 CLI TUI；侧栏请用顶部卡片）",
  },
  "session-info": { description: "显示会话信息：模型、轮次、上下文用量" },
  fork: { description: "在当前进度分叉新会话，保留此前历史" },
  rewind: { description: "回退到更早的回合，丢弃之后内容" },
  copy: { description: "复制最近一条回复；可跟数字复制第 N 条", hint: "[N]" },
  export: { description: "将会话导出到文件或剪贴板" },
  quit: { description: "退出应用" },
  exit: { description: "退出应用（/quit 别名）" },
  home: { description: "结束当前会话并返回欢迎页" },
  welcome: { description: "结束当前会话并返回欢迎页（/home 别名）" },
  rename: { description: "重命名当前会话", hint: "<新标题>" },
  title: { description: "重命名当前会话（/rename 别名）", hint: "<新标题>" },

  // Model / mode
  model: {
    description: "切换模型；可附推理力度（如 high）",
    hint: "<模型名> [力度]",
  },
  m: { description: "切换模型（/model 别名）", hint: "<模型名> [力度]" },
  effort: {
    description: "设置当前模型的推理力度：low / medium / high / xhigh",
    hint: "<low|medium|high|xhigh>",
  },
  "always-approve": { description: "切换始终批准权限（全局配置，侧栏已隐藏）" },
  auto: { description: "切换自动批准安全工具的模式" },
  multiline: { description: "切换多行输入：Enter 换行，Shift+Enter 发送" },
  ml: { description: "切换多行输入（/multiline 别名）" },
  history: { description: "搜索本会话历史提示词，选中后填回输入框" },
  "compact-mode": { description: "切换紧凑显示（减小间距）" },
  "vim-mode": { description: "切换 vim 风格滚动键位（j/k、g/G…）" },
  minimal: { description: "以极简/滚动模式重新打开当前会话" },
  fullscreen: { description: "以标准全屏 TUI 模式重新打开当前会话" },
  full: { description: "以标准全屏模式打开（/fullscreen 别名）" },
  plan: { description: "进入计划模式", hint: "[任务描述]" },
  "view-plan": { description: "打开当前已保存的计划预览" },
  "show-plan": { description: "打开当前已保存的计划预览（/view-plan 别名）" },
  "plan-view": { description: "打开当前已保存的计划预览（/view-plan 别名）" },

  // Memory
  memory: { description: "浏览与管理记忆；可传 on/off 开关", hint: "[on|off]" },
  mem: { description: "浏览与管理记忆（/memory 别名）", hint: "[on|off]" },
  flush: { description: "立即将当前会话要点写入记忆" },
  dream: { description: "整理记忆：合并会话日志为专题" },
  remember: { description: "立即记一条笔记到记忆", hint: "<笔记内容>" },

  // Extensions
  hooks: { description: "打开扩展面板 · Hooks 页" },
  plugins: { description: "打开扩展面板 · 插件页" },
  marketplace: { description: "打开扩展面板 · 市场页" },
  skills: { description: "打开扩展面板 · Skills 页" },

  // Media
  imagine: { description: "根据文字描述生成图片", hint: "<描述>" },
  "imagine-video": { description: "根据文字或图片生成视频", hint: "<描述>" },

  // Scheduling
  loop: {
    description: "按间隔循环执行提示词（如 30m）",
    hint: "[间隔] <提示词>",
  },

  // Other
  goal: {
    description: "设置/查看/暂停自主目标",
    hint: "<目标|status|pause|resume|clear>",
  },
  theme: { description: "切换 TUI 主题" },
  t: { description: "切换 TUI 主题（/theme 别名）" },
  feedback: { description: "反馈问题或建议", hint: "[留言]" },
  btw: { description: "旁注给助手，不打断当前任务", hint: "<旁注>" },
  mcps: { description: "打开 MCP 服务器管理" },
  "terminal-setup": { description: "查看终端能力与剪贴板/颜色配置说明" },
  "terminal-check": { description: "查看终端能力（/terminal-setup 别名）" },
  "terminal-info": { description: "查看终端能力（/terminal-setup 别名）" },
  "release-notes": { description: "查看当前版本更新说明" },
  changelog: { description: "查看更新说明（/release-notes 别名）" },
  docs: { description: "打开使用指南或在线文档", hint: "[web|标题]" },
  howto: { description: "打开使用指南（/docs 别名）" },
  guides: { description: "打开使用指南（/docs 别名）" },
  "import-claude": { description: "从 Claude 设置导入权限、MCP、hooks 等" },

  // Agents
  "config-agents": { description: "管理代理定义与默认/当前代理" },
  agents: { description: "管理代理（/config-agents 别名）" },
  personas: { description: "管理角色（personas）：创建、编辑、删除" },

  // Account
  login: { description: "登录或重新认证账号" },
  logout: { description: "退出登录" },
  usage: { description: "查看用量或管理账单" },
  privacy: { description: "查看/切换隐私与数据保留状态" },

  // Config UI
  settings: { description: "打开交互式设置" },
  config: { description: "打开设置（/settings 别名）" },
  preferences: { description: "打开设置（/settings 别名）" },
  prefs: { description: "打开设置（/settings 别名）" },
  timestamps: { description: "切换消息时间戳显示" },

  // Common shell-advertised hook helpers (if shown)
  "hooks-list": { description: "列出已加载的 hooks" },
  "hooks-trust": { description: "信任项目 hooks" },
  "hooks-add": { description: "添加自定义 hook" },
  "hooks-remove": { description: "移除 hook" },
  "hooks-untrust": { description: "取消项目 hooks 信任" },
};

/**
 * Overlay Chinese description/hint onto CLI-advertised slash commands for the
 * autocomplete UI. Pure. Unknown names (skills, plugins) keep CLI text.
 */
export function localizeSlashCommands<
  T extends { name: string; description?: string; input?: { hint?: string } },
>(commands: T[]): T[] {
  return commands.map((c) => {
    const loc = SLASH_COMMAND_ZH[c.name];
    if (!loc) return c;
    const next: T = { ...c, description: loc.description };
    if (loc.hint !== undefined) {
      next.input = { ...(c.input ?? {}), hint: loc.hint };
    } else if (c.input) {
      next.input = c.input;
    }
    return next;
  });
}

/**
 * Given the current composer text and cursor position, return the slash-command query
 * (the chars after `/` on the line that the caret is in) or `null` if no popover is active.
 *
 * The popover activates only when `/` is at the start of the line or after a newline.
 */
export function getSlashQuery(text: string, caret: number): string | null {
  const before = text.slice(0, caret);
  const m = before.match(/(?:^|\n)\/(\S*)$/);
  return m ? m[1] : null;
}

export function filterCommands(commands: SlashCmd[], query: string): SlashCmd[] {
  const q = query.toLowerCase();
  if (!q) return commands;
  return commands.filter((c) => c.name.toLowerCase().startsWith(q));
}

/** Replace the partial `/q` token with `/<name> ` and return the new text + caret. */
export function applySlashPick(
  text: string,
  caret: number,
  name: string,
): { text: string; caret: number } {
  const before = text.slice(0, caret);
  const after = text.slice(caret);
  const newBefore = before.replace(/(?:^|\n)\/(\S*)$/, (m) =>
    m.startsWith("\n") ? `\n/${name} ` : `/${name} `,
  );
  return { text: newBefore + after, caret: newBefore.length };
}

/**
 * The slash command a typed message dispatches, or `null` for ordinary prose.
 *
 * The CLI only recognizes a slash command when it sits at position 0 of the
 * prompt's text block — editor-injected context in front of it silently turns
 * `/compact` into a normal LLM turn (verified against grok 0.2.87 in
 * research/compact-probe.cjs). The caller uses a match to move that context
 * BEHIND the command text instead (see buildPrompt), so this must never match
 * prose: the token boundary rejects Unix paths (`/tmp/foo` — `tmp` is followed
 * by `/`, not whitespace/end), and a known-commands check rejects things shaped
 * like commands that grok never advertised. An empty `commandNames` means the
 * `available_commands_update` hasn't arrived yet — fall back to shape alone,
 * since a wrongly-trailing envelope (broken dispatch) costs far more than a
 * wrongly-leading one (grok just reads the context first).
 */
export function matchSlashCommand(text: string, commandNames: string[]): string | null {
  const m = text.match(/^\/([A-Za-z0-9][\w.:-]*)(?:\s|$)/);
  if (!m) return null;
  if (commandNames.length === 0) return m[1];
  return commandNames.includes(m[1]) ? m[1] : null;
}
