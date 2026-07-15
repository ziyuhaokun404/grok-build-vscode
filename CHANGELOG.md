# 更新日志

## 1.3.2 — 2026-07-15

### 变更

- 打包发行 `1.3.2`（在 1.3.1 会话置顶/归档能力之上的当前工作区最新构建）。

## 1.3.1 — 2026-07-15

### 变更

- **会话置顶 / 归档**：左侧会话栏与历史列表每行悬停显示置顶、归档图标；置顶排在最前，归档默认隐藏可通过「归档（N）」展开。状态保存在扩展 globalState。
- **一键删除全部归档**：侧栏「删除全部归档（N）」与归档分区内「一键删除」；确认后永久删除磁盘会话与元数据。
- **历史弹层不显示已归档会话**（仅侧栏归档区管理）。

## 1.2.0 — 2026-07-15

### 变更

- **token/s 生成窗口修正**：扣除**全部**工具墙钟（读/搜/写/编辑/shell 等本地处理，不再只扣命令）与权限/提问/计划等待；并行工具按墙钟合并，避免重复扣时。吞吐更接近真实模型生成速度。

## 1.1.0 — 2026-07-15

### 变更

- **左侧会话栏可拖动调宽**：分隔条拖动 120–420px，双击恢复默认；宽度持久化。
- **会话状态动画与文案**：运行中 spinner / 待处理脉冲 / 新消息呼吸 / 出错警示；侧栏显示「运行中」「待处理」等短文案。

## 1.0.0 — 2026-07-15

### 变更

- **ziyuhaokun 独立发行起点**：扩展 ID `ziyuhaokun.grok-vscode-ziyuhaokun`，版本重置为 `1.0.0`。
- **身份与品牌**：publisher / author / 仓库链接 / 欢迎页 / 安装卸载脚本均为 ziyuhaokun；LICENSE 保留上游 MIT 版权并追加 ziyuhaokun。
- **遥测**：清空上游 Aptabase 密钥，默认关闭。
- **左侧会话栏可拖动调宽**：会话栏与对话区之间的分隔条可拖动（120–420px，双击恢复默认 168px），宽度在 webview 状态中持久化；支持方向键微调。
- **会话状态更明确**：状态点改为可区分动画（运行中 spinner / 待处理脉冲 / 新消息呼吸 / 出错警示），侧栏另显示简短状态文案（运行中、待处理等）。

## 1.5.26 — 2026-07-15

### 变更

- **推理强度轨道加粗到与拇指同高**（24px），拇指嵌在轨道端点上更贴合。
- **完整身份重塑为 ziyuhaokun**：`publisher` / `name` / 扩展 ID `ziyuhaokun.grok-vscode-ziyuhaokun`、仓库链接、安装/卸载脚本、UI GitHub 入口、遥测 SDK 名；LICENSE 保留上游版权并追加 ziyuhaokun；清空上游 Aptabase 密钥且遥测默认关闭。


## 1.5.25 — 2026-07-15

### 变更

- **推理强度滑条按 Sol 风格像素级重绘**：
  - 轨道加粗（14px）+ **蓝→紫→淡紫** 全轨锁定渐变
  - 白色拇指加大（24px），填充区白点高光
  - 说明文案移到滑条**上方**，紫色强调（如「消耗用量更快」）
  - 卡片去掉底部滚动条；模型列表独立滚动
  - 芯片强度文案使用紫色强调

## 1.5.24 — 2026-07-15

### 变更

- **压缩对话迁至上下文卡片**：从设置页移除「压缩对话」；点击输入栏「已用上下文」甜甜圈打开的卡片中提供压缩按钮（会话忙碌时禁用）。

## 1.5.23 — 2026-07-15

### 变更

- **推理强度滑条动效打磨**：
  - 拖动时拇指/填充沿轨道**连续跟随**（不再一格一格跳）
  - 松手用弹簧曲线吸附档位，拇指 **pop + 涟漪环**
  - 拖动时拇指放大 + 蓝色光晕，邻近档位点轻微放大
  - 填充渐变与轨道光斑，档位说明在吸附时轻量交叉淡入

## 1.5.22 — 2026-07-15

### 变更

- **推理强度滑条支持按住拖动**：在轨道上 pointer capture 连续滑动，松手吸附到最近档位；拖动中拇指即时跟随，松手用缓动回弹。
- **滑条动效重做**：独立白圆拇指（不再用档位点“变大”冒充拇指），填充与拇指共用同一坐标系；拖动时略放大拇指，松手平滑过渡。

## 1.5.21 — 2026-07-15

### 变更

- **模型选择小组件重设计**（参考主流输入栏样式）：
  - 右下角为圆角胶囊芯片：`模型名 强度 ▾`
  - 点击弹出磨砂小卡片：顶部「模型 ›」展开模型列表；主体为蓝色分段推理强度滑条（白圆拇指 + 档位点）

## 1.5.20 — 2026-07-15

### 变更

- **回合指标去「卡片感」**：去掉边框、底色与胶囊徽章，改为安静的行内元信息（`首字 · 耗时 · 吞吐`），悬停仍可看明细。
- **模型芯片幽灵化**：输入栏右下角模型/强度入口去掉描边方框，与模式按钮同一套轻量工具栏风格。

## 1.5.19 — 2026-07-15

### 变更

- **设置改为独立页面**：齿轮按钮打开全屏设置页（压缩对话、版本与关于、配置与调试、退出登录、移动视图），不再塞在输入栏弹层里。
- **模型与推理强度常驻输入栏右下角**：对话区右下角始终显示当前模型名与思考强度；点击弹出小卡片，可切换模型与调节推理强度（会话忙碌时锁定）。

## 1.5.18 — 2026-07-15

### 变更

- **回合指标改为常驻小卡片**：首字 / 耗时 / 吞吐 不再挤在悬停才显示的页脚里，而是在回合结束后以独立小卡片常驻显示（胶囊标签布局，悬停仍可看明细）。

## 1.5.17 — 2026-07-15

### 新增

- **每轮对话指标**：回合结束后在 agent 页脚显示 **首字耗时**、**对话耗时**、**token/s**（输出+思考 token / 生成窗口；生成窗口 = 首字→结束 − 工具与权限/提问/计划等待）。悬停可看输入/输出/思考/缓存明细。
- 设置 **`grok.showTurnMetrics`**（默认开）与齿轮 → **配置与调试 → 显示回合指标**。
- 指标按会话持久化到扩展 `globalState`，`session/load` 恢复时可回放；重聚焦走 session buffer。

### 变更

- 欢迎页署名为 `by ziyuhaokun`（社区本地构建）。

## 1.5.16 — 2026-07-15

### 变更

- **README 与更新日志中文化**：`README.md` 与 `CHANGELOG.md` 全文译为简体中文（技术标识、路径、issue 号保留原文）。

## 1.5.15 — 2026-07-15

### 变更

- **界面文案中文化（社区本地构建）**：扩展展示名、命令面板、设置项、侧栏 HTML 与聊天 Webview 中面向用户的字符串改为简体中文；CLI/协议标识与内部逻辑保持英文。

## 1.5.14 — 2026-07-14

### 修复

- **内联 diff 行号不再在数字中间换行。** 编辑的内联 diff 中，行号 ≥100 时可能断成两行（`147` → `14` / `7`）；行号槽现已足够宽，数字不会换行。感谢 [@jiezaichan](https://github.com/jiezaichan)（#47）。（[media/chat.css](media/chat.css)）

## 1.5.13 — 2026-07-13

### 修复

- **在 Windows 上，代理的 shell 命令现改为在 PowerShell 下运行，而非 cmd（#46）** — 已安装则用 `pwsh.exe`，否则 Windows PowerShell 5.1（`powershell.exe`），再否则 cmd.exe。扩展执行 Grok 请求的每条命令（经 ACP 委托），因此 shell 由我们选择；与独立 Grok CLI 对齐后，PowerShell 配置函数与管道（`… | Format-List`）可直接工作，而不再在 cmd 下失败并迫使代理昂贵重试。Linux/macOS 不变（`/bin/sh`）。（[src/terminal-manager.ts](src/terminal-manager.ts)）
  - **建议安装 PowerShell 7（`pwsh`）以获最佳体验** — Windows PowerShell 5.1 回退不支持 `&&` 命令链，且失败命令的退出码一律报 `1`；pwsh 7 均无此问题。
  - 新增 **`grok.terminalShell`** 设置（`auto` | `cmd`）— 若 PowerShell 主机有问题，可在 Windows 上回退到 `cmd.exe`。（[package.json](package.json)、[src/sidebar.ts](src/sidebar.ts)）
- **Composer 代理的工具行也显示命令输出。** Composer 在 CLI 侧自有 shell 中跑命令（不像 Grok Build 经 ACP 委托），因此命令行只显示命令（IN）而无输出（OUT）。现从已完成的 tool-call 更新中按 id 读取并附加捕获输出 — 即使 Composer 并行跑命令且完成顺序不定也可靠。（[media/chat.js](media/chat.js)、[media/webview-helpers.js](media/webview-helpers.js)）
- **命令行的一行标签不再拖入带引号的参数。** `Write-Output '=== banner ==='` 现在显示为 “Run Write-Output”，而非截断的 “Run Write-Output === 1. git statu…” — 引号参数是数据，不是子命令。（[media/webview-helpers.js](media/webview-helpers.js)）

## 1.5.12 — 2026-07-13

### 新增

- **即使在自动接受模式下，也可在聊天中内联审阅编辑 diff（#45）。** 每个编辑行始终显示 `+N −M` 变更计数（汇总到折叠的「编辑了 N 个文件」组标题，按路径去重），以及可展开的 **内联 diff** — Codex 风格行号槽、彩色左边框、淡色底，以及便于色盲阅读的 `+/−` 符号。与命令 IN/OUT 共用展开控件，实时与会话恢复均可用；且因 diff 数据始终在 ACP 线上、与权限模式无关，无需权限卡片。原生 `打开 diff →` 链接仍可用于完整并排对比。（[media/chat.js](media/chat.js)、[media/webview-helpers.js](media/webview-helpers.js)、[media/chat.css](media/chat.css)）

### 变更

- **齿轮开关「展开命令输出」现为「展开工具详情」** — 同时管理命令 IN/OUT 块 **与** 编辑 diff，与 *展开全部工具详情* 命令一致（设置键 `grok.expandCommandOutputs` 不变）。Grok 消息中的 ` ```diff ` 块现共享同一 Codex diff 配色与左边框样式。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)、[package.json](package.json)）

### 修复

- **退出码 0 且无输出的 shell 命令** 现显示淡化的 `✓ done · no output` 标记，而非空的 `(no output)` 行。（[media/chat.js](media/chat.js)）

## 1.5.11 — 2026-07-13

### 新增

- **添加上下文后光标落在输入区（#43）。** 发送选区、发送文件、@ 提及、**+** 文件选择器与图片粘贴都会显示面板并 *取得焦点*，可立刻输入提示 — 无需先点输入框。（[src/sidebar.ts](src/sidebar.ts)、[src/protocol.ts](src/protocol.ts)、[media/chat.js](media/chat.js)）

### 变更

- **「Grok: 发送选区」现为「将选区添加到 Grok」**，经命令发送的选区附加在 **顶部** 附件行（可移除，带行范围），与其它文件一样 — 仅环境活动编辑器芯片仍在底部工具栏。（[package.json](package.json)、[media/chat.js](media/chat.js)）
- **「Grok: 发送文件」在命令面板中无打开文件时不再静默无操作** — 会打开文件选择器，而非什么都不做并丢失焦点。（[src/sidebar.ts](src/sidebar.ts)、[src/extension.ts](src/extension.ts)）
- 内部调试命令（`grok._debugDummyPlan`）从命令面板隐藏。（[package.json](package.json)）

## 1.5.10 — 2026-07-12

### 新增

- **展开 / 折叠全部工具详情。** 两条命令面板命令 — *Grok: 展开全部工具详情（本会话）* / *…折叠全部…* — 打开或关闭所有工具组与命令 IN/OUT 框，**包括仍在运行的批次**，并对之后流式到达的工具调用持续生效。为按会话闩锁（相对齿轮设置后操作优先；切换设置会清除闩锁），在代理仪表盘焦点切换间保留，冷启动重开重置 — 永不落盘。可自行绑定快捷键。（[src/extension.ts](src/extension.ts)、[media/chat.js](media/chat.js)、[src/sidebar.ts](src/sidebar.ts)）

### 变更

- **`grok.expandCommandOutputs` 现也会打开含命令的工具 *组*，** 不仅是每条命令的 IN/OUT 细节 — 自动接受的「运行了 N 条命令」批次零点击即可审计；仅探索/编辑的组仍折叠。（[media/chat.js](media/chat.js)）
- **命令行读作「Run \<程序\>」** — 可执行文件加非标志子命令（`Run git status`、`Run npm test`、`Run node`、`Run Get-Date`），而非截断的整段 shell。完整命令仍在行的 IN/OUT 细节中。（[media/webview-helpers.js](media/webview-helpers.js)）
- 刷新 README — 新的模式选择器与图片粘贴截图，更精简的 **安装** 小节（扩展引导安装 CLI 并登录），从源码构建 / 按 IDE 脚本移至 [docs/INSTALL.md](docs/INSTALL.md)。（[README.md](README.md)）

### 修复

- **失败的非 shell 工具现内联显示真实错误**，而非通用的 “Tool call failed.” — 在无 `message`/`content` 可读时，从按变体键控的 `rawOutput` 中挖掘原因（如 `list_dir` → `NotFound`、`read_file` → `FileReadError`）。（[media/webview-helpers.js](media/webview-helpers.js)）

## 1.5.9 — 2026-07-12

### 变更

- 仅文档补丁：README 主截图现显示运行 **Grok 4.5** 的当前 UI（[docs/screenshots/grok_4.5.png](docs/screenshots/grok_4.5.png)，替换 v1.4.20 截图）。无代码变更。

## 1.5.8 — 2026-07-12

### 修复

- **RTL 文本（阿拉伯语、希伯来语、波斯语）现可正确渲染**（用户反馈）。每个段落与块的方向由其首个强方向字符决定 — 右对齐且标点在正确一侧 — 覆盖聊天气泡、思考轨迹、计划卡片、子代理结果、表格、列表（标记与缩进也会翻转）以及排队块；输入区随输入跟随。代码块与行内代码固定 LTR（与 Codex 扩展相同规则），聊天外壳不动 — 仅按块改变文本方向。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)、[src/sidebar.ts](src/sidebar.ts)）

## 1.5.7 — 2026-07-12

### 新增

- **命令详情（#41）。** 每条 shell 命令行可展开（尾部 `›` ↔ `v`）为 Claude-Code 风格的 **IN/OUT 块**：立即显示完整命令文本 — 单独运行中的命令中途也可展开 — 结束后显示完整捕获输出（扩展自行执行命令，输出与 grok 收到的逐字节一致）。退出码 0 保持安静；失败渲染带错误色的 `[Error] exit N` 标记；取消渲染淡化的 `[Cancelled]`。`grok.expandCommandOutputs`（也在齿轮 → 配置与调试）预开所有细节 — 自动接受会话的审计视图。仅实时会话：CLI 在恢复时不重放终端。（[src/acp.ts](src/acp.ts)、[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)）

### 变更

- **工具行读作可扫描的一行** — 标签截断至 40 字符（完整文本一键可达），长内容在行边缘省略而非换行，圆角尺度统一（气泡 12 → 代码/IN-OUT 块 8 → 行内芯片 6）。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）
- 刷新市场描述与 README（新截图：成本控制、力度选择器、文件芯片）。（[README.md](README.md)、[package.json](package.json)）
- 每条出站 `session/cancel` 在 Grok 输出通道记录触发源（Stop 点击 / 计划裁决），便于将来排查误取消（#37）。（[src/acp.ts](src/acp.ts)）

### 修复

- 私有工作文档不再打进公开发布的 `.vsix`（此前因 `.vscodeignore` — 而非 `.gitignore` — 决定包内容而误打包）。（[.vscodeignore](.vscodeignore)）

## 1.5.6 — 2026-07-11

### 新增

- **子代理行，完整实时。** 委托渲染为紫色 *Subagent · \<任务\>* 行，带运行圆点，随后时长戳与可点击展开的 “Output of the subagent:” 结果 — 在存在时剥离 CLI 信封（管道标签、套话前缀、一层包裹的 `<response>`、Agent ID 提示），且从不因剥离失败。覆盖 grok-build 的 `spawn_subagent` — 含 `background: true` 生成（其开始确认不再伪装成结果；卡片由输出轮询的 `TaskOutput` 按 task id 匹配完成）— 以及 Composer 代理的 `Task`。`subagent_spawned`/`subagent_finished` 生命周期事件已路由，待 CLI 真正经 ACP 发送（0.2.93 仅日志、不发 — 已实机验证）。测试套件端到端重放真实捕获会话。（[media/chat.js](media/chat.js)、[media/webview-helpers.js](media/webview-helpers.js)、[src/acp.ts](src/acp.ts)、[test/fixtures/composer-subagent-session.jsonl](test/fixtures/composer-subagent-session.jsonl)）

- **[docs/ACP-feedback.md](docs/ACP-feedback.md)** — 面向上游的 grok-CLI/ACP 摩擦摘要：grok-build 与 Composer 线差异、扩展绕过或隐藏的一切（附建议修复）、运作良好之处，以及 Grok 4.5 验证清单。基于 `research/` 中的线捕获与探测。

### 变更

- **每轮一个复制/时间戳页脚，在回合结束时显示。** 复制操作与时间仅在回合最终代理消息（结论）下，且回合完成后才出现 — 不再在 grok 工作时于对话中途闪烁复制图标；时间戳即为回合结束时间。代码块保留各自复制按钮。（[media/chat.js](media/chat.js)）
- **输入区随文字增高。** 静止 2 行（Cursor 风格），输入时扩至 5 行后滚动；随 `grok.chatFontScale` 缩放。（[media/chat.js](media/chat.js)、[src/sidebar.ts](src/sidebar.ts)）

### 修复

- **编写子代理相关代码时不再出现假 Subagent 卡片。** grok 会用查询/文件名作为 Grep/Read 的标题（搜索 `spawn_subagent` 标题即如此），标题匹配会误将普通工具打成卡片；分类器现将线的 `_meta["x.ai/tool"].name` 双向视为权威，否则匹配精确工具名。（[media/webview-helpers.js](media/webview-helpers.js)）
- **子代理子会话不再污染历史。** 每次委托将子会话持久化为顶层会话（`session_kind: "subagent"`）；历史列表隐藏它们，分页按消耗的索引槽前进（`nextOffset`），避免隐藏行卡住或重复加载更多。（[src/sessions.ts](src/sessions.ts)、[src/sidebar.ts](src/sidebar.ts)）
- **恢复的计划/权限卡片不再漂到对话末尾。** 主机把重放的 `<system-reminder>` 回合与仅标记的裁决计入计划位置，而 webview（正确）不为它们渲染气泡 — 因此会话恢复后给出的每个裁决都持久化为不可达位置，卡片下次恢复落在底部。主机现精确统计 webview 会打泡的内容（`countsAsUserBubble`）。旧构建已持久的位置保持原样。（[src/plan-restore.ts](src/plan-restore.ts)、[src/sidebar.ts](src/sidebar.ts)）

## 1.5.5 — 2026-07-11

### 变更

- **Codex 风格聊天重排。** 用户气泡使用与主题无关的前景色调（修复 Cursor 暗色主题下气泡消失）；行内与围栏代码共用芯片表面 + 编辑器对比文本；页眉/输入区/消息/代码操作统一 28px 幽灵图标按钮；文件引用与「打开 diff →」渲染为真链接（仅悬停下划线）；计划/权限卡片文字匹配聊天字体；输入区使用 UI 字体而非编辑器等宽字体。（[media/chat.css](media/chat.css)、[media/chat.js](media/chat.js)）
- 永久计划取消通知不再写 “Grok is processing the cancellation…” — 瞬时圆点指示器承载该状态。（[src/sidebar.ts](src/sidebar.ts)）
- **已裁决计划卡片去掉内联计划正文。** 计划批准/拒绝/取消后（实时或恢复），卡片仅显示计划文件链接 + 裁决 — 文件作为编辑器标签打开；仅在无计划文件时保留显示/隐藏切换。（[media/chat.js](media/chat.js)）
- **工具栏图标对齐。** 模式按钮、上下文甜甜圈与模式选择器图标现与设置/历史按钮同为 16px 字形、28px 高亮高度。（[media/chat.css](media/chat.css)）

### 新增

- **甜甜圈上的上下文弹出层。** 点击上下文甜甜圈查看精确 token 数（`used / window`，%）。（#39）（[media/chat.js](media/chat.js)）

### 修复

- **已裁决计划卡片在重新聚焦时保持已裁决。** 重新打开存活会话不再用有效的批准/拒绝/取消按钮复活已回答的计划审阅；已裁决卡片在显示/隐藏计划后折叠重放并带裁决（`planResolved`，对应权限的 `permissionResolved`）。（[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)、[src/protocol.ts](src/protocol.ts)）
- **`/session-info` 不再把上下文甜甜圈清零。** 回合的 `totalTokens: 0` 报告从不是真实测量（`/compact` 缩小上下文，不会清空）并始终忽略；`/context`（ACP 上 CLI-TUI 无操作）从自动补全隐藏 — 请用 `/session-info`。（#39）（[src/acp-dispatch.ts](src/acp-dispatch.ts)、[src/slash-filter.ts](src/slash-filter.ts)）
- **恢复后以及 `/compact` 后上下文甜甜圈为真值。** 恢复会话从 grok 持久化的 `signals.json` 播种甜甜圈，而非显示 0 直到第一轮；`/compact` 后跟随隐藏的、仅 CLI 本地的 `/session-info` 回合（约 25ms，无模型调用，不写入历史），其回复携带精确的压缩后计数 — 在 “Compacted.” 后很快解析并推到甜甜圈（压缩回合自身 meta 报 0，CLI 仅在下一轮结束重算 `signals.json`，否则不可知 — 探测验证）。（[src/sessions.ts](src/sessions.ts)、[src/acp-dispatch.ts](src/acp-dispatch.ts)、[src/sidebar.ts](src/sidebar.ts)、[research/signals-refresh-probe.cjs](research/signals-refresh-probe.cjs)）
- **批准计划不再泄漏 grok 裁决后的填充语**（“I'll wait for your verdict…”）到聊天：在批准时对 CLI 因我们的响应而解除的规划回合执行取消与内容抑制，与拒绝/取消已有行为一致 — 该文本从不在会话恢复中存活，因此实时也不绘制。（[src/sidebar.ts](src/sidebar.ts)）
- **聊天有内容后欢迎 logo/副文确实隐藏**（CSS `display` 规则曾覆盖 `hidden` 属性）；仅 primer 的恢复保留欢迎屏而非空聊天。（[media/chat.css](media/chat.css)、[media/chat.js](media/chat.js)）
- **取消计划后不再永远转圈。** 回合结束现始终清除等待指示器（grok 的 `[Plan cancelled]` 确认可无内容，曾使其孤立）；普通取消设计为静默：「计划已放弃」通知即为全部 UX — 裁决仍经隐藏回合到达 grok，但其确认回复不再绘制。（[media/chat.js](media/chat.js)、[src/sidebar.ts](src/sidebar.ts)）
- **修复 webview 加载白闪**（仅 VS Code）：内联关键样式立即绘制主题背景，并在样式表加载前保持欢迎不可见。（[src/sidebar.ts](src/sidebar.ts)、[media/chat.css](media/chat.css)）

## 1.5.4 — 2026-07-11

### 变更

- **一条待发消息，而非队列。** 在已有排队消息时再输入，现 **追加** 到单一待发块（空行分隔 — 与实际发送一致），而非堆叠多条队列项。编辑把整段待发文本拉回输入区，移除丢弃，Stop 仍交还 — 不再出现编辑后的消息落到本将合并为一条的队列末尾。（#37 后续）（[media/chat.js](media/chat.js)、[src/sidebar.ts](src/sidebar.ts)）

## 1.5.3 — 2026-07-11

### 修复

- **Grok 工作时输入不再取消其工具。** Enter（与发送按钮）在回合进行中曾兼作隐藏 Stop，因此中途「继续」会静默把进行中的工具解析为 *「用户取消」* — 忙碌状态跨仪表盘会话切换泄漏时更严重。输入文本现 **永不取消**：消息写入按会话队列，显示为聊天末尾的待发块（斜体、时钟标签、每条可编辑/移除），跨会话切换保留，该会话回合结束时作为一条合并消息自动发送 — 即使在后台。Stop（方按钮，仅空输入区）把排队文本交回输入区而非发出。感谢 @githubuser1256！（#37）（[media/chat.js](media/chat.js)、[src/sidebar.ts](src/sidebar.ts)、[src/session.ts](src/session.ts)、[src/protocol.ts](src/protocol.ts)）
- **CJK IME 组合中按 Enter 不再中途发送。** 输入区现尊重 `isComposing`/`keyCode 229`，Enter 确认 IME 候选（Claude-Code 风格：第一次 Enter 选字，第二次发送）。感谢 @yyu0310！（#38）（[media/chat.js](media/chat.js)）

### 新增

- **实时套件覆盖 Stop 契约与并发会话。** `cancel-mid-turn` 固定无 id 的 `session/cancel` 将回合结算为已取消且会话仍可用；`parallel-sessions` 固定同一工作区上两个 CLI 进程独立回答重叠提示。（[scripts/live-tests.cjs](scripts/live-tests.cjs)）

## 1.5.2 — 2026-07-10

### 新增

- **齿轮菜单中一键「移动视图」。** 齿轮 → **配置与调试 → 移动视图** 立即将聊天移到辅助侧栏、主侧栏或面板 — 直接进入各位置视图容器，无选择器 — 各有匹配的面板图标。在 Cursor 中尤其有用，其侧栏右键菜单隐藏了内置「移动到」。（[src/view-move.ts](src/view-move.ts)、[media/chat.js](media/chat.js)）
- **安装脚本检测 Cursor，并可一次面向所有 IDE。** `cursor` 加入自动检测链；`--all`（Windows：`-All`）构建一次并安装到所有检测到的 IDE。（[scripts/](scripts/)）

### 变更

- **视图现默认打开在辅助侧栏**（`viewsContainers.secondarySidebar`），与其它 AI 工具相邻。最低 VS Code 升为 **1.106** — 更旧宿主（如 Antigravity，目前基线 1.104）请使用最后一个兼容版本。你自行设置的位置仍优先；用齿轮迁移或 *重置位置* 可采用新默认。

## 1.5.1 — 2026-07-09

### 修复

- **`config.toml` 中设置了 `always-approve` 时模式按钮如实显示。** grok 全局 `permission_mode = "always-approve"`（TUI 中 Shift+Tab 或 `/always-approve`）在服务端自动批准每会话，且 ACP 上不可见，扩展曾误显示「代理模式」且无权限卡片。现检测该设置（项目 `.grok/config.toml` 覆盖全局 `~/.grok/config.toml`）并显示 **自动接受**，以及一次性说明这是全局配置设置。（#31）（[src/grok-config.ts](src/grok-config.ts)、[src/sidebar.ts](src/sidebar.ts)）

### 变更

- **隐藏 `/always-approve` 斜杠命令。** 它只改 grok 全局 `config.toml` — 粘性且意外的副作用 — 且在 ACP 上为无操作，因此不再出现在自动补全或分发中。（#31）（[src/slash-filter.ts](src/slash-filter.ts)、[src/acp.ts](src/acp.ts)）
- **为主机↔webview 消息契约添加类型。** 主机→webview 方向曾为 `any`；现为 `src/protocol.ts` 中的可辨别联合（单一真相源），webview 保持同步镜像，测试断言两侧一致 — 因此「发一种形状、处理另一种」漂移（恢复/分页/媒体）成为构建错误。途中还发现两处潜伏不匹配。（[src/protocol.ts](src/protocol.ts)、[media/webview-helpers.js](media/webview-helpers.js)）
- **加强测试与发版门控。** `release.*` 脚本默认运行 `test:live`（`-SkipLive`/`--skip-live` 可跳过）；真实 grok 计划模式测试现用磁盘快照围堵金丝雀模拟真实批准/拒绝流（旧单回合测试发明了不可能状态）；实时套件增加能力漂移探测与快速 `--smoke` 通道；CI 要求 `@vscode/test-electron` 激活冒烟（`npm run test:integration`，对真实扩展主机验证）。
- **文档一致性整理：** 修正 README 最低 VS Code 版本，记录 `Grok: 压缩对话` 命令，在架构图中加入遥测/模式偏好/grok-config 模块，并从 `CLAUDE.md` 裁剪变更叙事（改指向更新日志与 `research/*`）。

## 1.5.0 — 2026-07-09

### 新增

- **粘贴或附加图片 — Grok 现在看到像素。** Ctrl+V 截图、拖放，或附加 png/jpg/gif/webp，会作为行内视觉块随提示发送（发送时校验，20 MiB 上限，会话作用域 `[Image #N]` 标签恢复为芯片；SVG 保持路径芯片以便 Grok 编辑源）。感谢 @cpulxb！（#32）（[src/chips.ts](src/chips.ts)、[src/prompt-builder.ts](src/prompt-builder.ts)、[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)）
- **活动编辑器上下文芯片跟踪实时选区**（`file.ts:8-15`），选区片段在重新打开会话时恢复为带范围芯片。感谢 @cpulxb！（#32）（[src/sidebar.ts](src/sidebar.ts)、[media/webview-helpers.js](media/webview-helpers.js)）

### 修复

- **`/compact` 再次真正压缩 — 并说明。** 前导上下文信封曾静默将其降级为普通 LLM 回合，上下文 *增长* 约 6 倍；确认的斜杠命令现引导文本块，上下文甜甜圈接受压缩后重置，之后重发隐藏的计划模式 primer（感谢 @cpulxb！#32），回合以可见 **「Compacted.」** 确认结束。（[src/prompt-builder.ts](src/prompt-builder.ts)、[src/slash-filter.ts](src/slash-filter.ts)、[src/sidebar.ts](src/sidebar.ts)）
- **计划模式不再拦截安全链式命令。** `cd repo && git status` 曾被直接拒绝，导致 grok-4.5 规划阶段崩溃；链（`&&`、`||`、`;`）在 **每一** 段都只读时放行 — 任一段有变更仍拦截整条命令。（#36）（[src/plan-gate.ts](src/plan-gate.ts)）

### 变更

- **输入区打磨：** 单一可聚焦卡片、VS Code 风格 webview 滚动条，面板打开、窗口重获焦点、新会话与会话切换时光标落在输入框（感谢 @cpulxb！#32）；无法读取的粘贴图片阻止发送而非静默丢弃；内联图片带「勿从磁盘读取」提示，避免 Grok 吵闹地 `Read` 自己的副本。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）

## 1.4.31 — 2026-07-09

### 新增

- **安装/卸载脚本可面向任意 code 兼容 IDE。** 传入 CLI 名称或路径 — `./scripts/install.sh antigravity-ide`（Windows：`pwsh scripts\install.ps1 -Cli antigravity`）— 或设置 `CODE_CLI=…`；无参数时自动检测 `code` → `code-insiders` → Antigravity，并提示找到的其它 IDE。感谢 @mingminghome 的 Antigravity 基础工作。（#35）（[scripts/](scripts/)）

### 修复

- **无效或不可用的 `grok.defaultModel` 不再导致会话启动崩溃。** 会话创建/加载时失败的 `setModel` 被捕获并记录，回退到 CLI 当前模型而非退出；若配置模型不在 CLI 列表中，警告 toast 建议更新设置。感谢 @mingminghome。（#33、#34）（[src/acp.ts](src/acp.ts)、[src/sidebar.ts](src/sidebar.ts)）

## 1.4.30 — 2026-07-09

### 修复

- **登录（与退出）终端命令现真正运行。** 引导按钮曾向终端输入 `"C:\…\grok.exe" /login` — 命令错误（`login` 是 CLI 子命令；`/login` 仅在交互 TUI 内有效）*且* 导致 PowerShell 解析错误（带引号路径后跟参数需要 `&` 调用运算符）。登录与退出现直接将 grok 二进制作为终端自身进程启动，在 PowerShell、cmd 与 POSIX shell 上行为一致。README 示例也更新为 `grok login`。（[media/chat.js](media/chat.js)、[src/sidebar.ts](src/sidebar.ts)、[README.md](README.md)）

### 变更

- 登录引导中的 API 密钥选项不再声称额外模型 — 现仅说明「按 token 计费」。（[media/chat.js](media/chat.js)）

## 1.4.29 — 2026-07-05

### 修复

- **仅含编辑的权限请求现可审阅，且其 diff 在 VS Code 重启后仍在。** 独立编辑曾折叠为无法打开 diff 的单行 — 而读+编辑批次可展开 — 且恢复时 diff 完全丢失。单独编辑现保留与多工具批次相同的可折叠工具组（chevron、「N → M 行」、「打开 diff →」），实时与恢复顺序均如此。（[media/chat.js](media/chat.js)）（#30）

## 1.4.28 — 2026-07-01

### 修复

- **会话启动中禁用模式切换（代理 / 计划 / 自动接受）。** 会话尚不存在时选模式会过早调用 `setMode` 并显示 *「无法切换模式：无会话。」* 模式按钮在会话就绪前灰显不可点 — 与发送按钮类似 — 切换模式命令在服务端也有守卫。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)、[src/sidebar.ts](src/sidebar.ts)）

## 1.4.27 — 2026-07-01

### 新增

- **上下文文件现告知 Grok 来源。** 你显式附加的文件列为 **「Attached file(s)」**（强意图）；因在编辑器中打开而自动包含的文件单独列为 **「Currently open in the editor (for context)」**（较弱、环境性）— 因此 Grok 不会把你只是在看的文件当作要求它操作的对象。（[src/prompt-builder.ts](src/prompt-builder.ts)）
- **上传附件现有独立行在输入框上方**，每项带移除（×）按钮。活动编辑器文件仍在底部工具栏。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)、[src/sidebar.ts](src/sidebar.ts)）

### 修复

- **grok-build 现显示真实名称与 512K 上下文窗口。** grok 将 `set_model("grok-build")` 解析为 *带版本* id（`grok-build-0.1`），不在模型列表中，因此工具栏显示原始 id，上下文甜甜圈回退到 200K 默认（百分比约高 2.5 倍）。id 现规范回列表项，窗口在每次模型变更时重算。（[src/acp.ts](src/acp.ts)、[src/acp-dispatch.ts](src/acp-dispatch.ts)、[media/chat.js](media/chat.js)）
- **语音/麦克风按钮在附件出现时不再跳动。** 现锚定到输入框而非整个输入区，输入上方的新附件行不会把它挤开。（[media/chat.css](media/chat.css)、[src/sidebar.ts](src/sidebar.ts)）
- **附件芯片仅显示文件名** — 在输入区、已发送消息气泡 *与* 恢复会话中 — 对工作区外文件（Windows 绝对路径此前完整显示）；完整路径保留在悬停提示，Grok 仍收到完整路径。文件路径上下文以机器可读的 `<vscode-context>` 信封发送，webview 可在恢复时确定解析，而非显示原始重放路径。（[media/chat.js](media/chat.js)、[media/webview-helpers.js](media/webview-helpers.js)、[src/prompt-builder.ts](src/prompt-builder.ts)）
- **代码块不再在周围出现双空白行。** 围栏代码块曾在自有外边距上再包 `<br><br>`（模型只发一个空行），看起来双倍行距；代码块现作为独立块发出，与表格和数学一致。（[media/chat.js](media/chat.js)）

## 1.4.26 — 2026-06-30

### 修复

- **更新 Grok Build CLI 不再因「无法重命名已锁定可执行文件」失败。** 更新拆掉会话池但未 *等待* grok 进程真正退出，因此 `grok update` 与仍持有的 Windows `grok.exe` 锁竞态（`Access is denied. (os error 5)`）。拆卸现仅在每个进程真正退出后解析，在 Windows 上杀死整棵进程 **树**（`taskkill /T /F`，避免 grok 后台子代理/命令子进程继续锁二进制），若残留锁仍漏过则更新重试一次。（[src/acp.ts](src/acp.ts)、[src/sidebar.ts](src/sidebar.ts)、[src/cli-locator.ts](src/cli-locator.ts)）

### 变更

- **目录列表显示带尾斜杠的完整相对路径** — `List docs/` 与 `List docs/screenshots/`，而非仅基名 `List screenshots`。（[media/chat.js](media/chat.js)）

## 1.4.25 — 2026-06-30

### 修复

- **即使较大的空 primer 会话也会清理。** 隐藏 primer 回合可膨胀为数十条代理工具/推理消息而无真实用户消息；启动扫描因 `num_messages` 超门槛跳过，导致带 primer 派生标题的会话滞留历史。聊天历史内容检查现无论消息数均权威 — 含我们 primer 且零真实用户查询的会话会被清扫（真实与已重命名会话仍永不触碰）。（[src/sessions.ts](src/sessions.ts)、[src/sidebar.ts](src/sidebar.ts)）
- **发送按钮从面板打开起就显示转圈。** 初始会话启动期间曾短暂既无发送箭头也无转圈；现默认禁用转圈直到会话存活。（[media/chat.js](media/chat.js)）
- **List / Search / Fetch 工具行再次显示细节。** 目录列表显示文件夹（`List docs`），读取显示文件与行范围（`Read README.md lines 1-30`），搜索显示模式，网页抓取显示页面 URL — 曾因未读取 rawInput 字段名（`target_directory`、`url`）回退为裸动词。已对真实磁盘会话验证。（[media/chat.js](media/chat.js)）

### 变更

- **diff 预览编辑行现为单行** — `Edit chat.js  9 → 10 lines  open diff →`，而非三行堆叠。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）
- **表格单元格不再在词中断字。** 长表头/单元格词曾在字母间切开，列显得局促且任意变窄；单元格现仅在空格与连字符处换行（不可断长串回退到表格横向滚动）。（[media/chat.css](media/chat.css)）
- **Grokking 指示器反转旋转方向。**（[media/chat.css](media/chat.css)）
- **滚到底部按钮略上移**，使其与输入区顶边的间距匹配边框到文本区间距。（[media/chat.css](media/chat.css)）
- **精简 README 隐私小节** 为简短隐私优先摘要；完整细节移至 [docs/privacy.md](docs/privacy.md)。（[README.md](README.md)、[docs/privacy.md](docs/privacy.md)）

## 1.4.24 — 2026-06-29

> 隐私优先、默认可关的匿名使用遥测。

### 新增

- **匿名使用遥测（Aptabase）。** 每会话一个 `session_start` 事件 — 在 **首条真实用户消息** 时触发（从不为 primer 或空/放弃会话）— 仅携带匿名安装 id（随机 GUID，无账户或 grok 登录身份）以及所选 **模式 / 模型 / 力度**。**从不发送消息内容、代码或文件路径；** 国家由 Aptabase 从请求 IP 派生后丢弃 IP。**默认开启但完全门控** — 仅在 VS Code 全局 `telemetry.telemetryLevel` 启用 *且* 新设置 `grok.telemetry.enabled` 开启时发送；任一关闭即停止。事件同步构建（捕获正确会话的模式/模型/力度）但 **异步离开发送路径**，错误 **静默吞掉**，因此遥测永不拖慢、表面给用户或打断回合 — 失败（离线、错误/错打密钥 → 无害 404、畸形事件）仅表示未落地。无 SDK 的薄客户端。（[src/telemetry.ts](src/telemetry.ts)、[src/sidebar.ts](src/sidebar.ts)、[package.json](package.json)）

### 测试 — 609

- 新增：遥测辅助 — `aptabaseHost`（从应用密钥推断区域）、`osNameFromPlatform`、`shouldSendTelemetry` 双门检查、不同的 prod/dev 密钥、`buildSessionStartEvent`（安装 id + 模式/模型/力度为 props，无内容），以及 `postEvent` **永不抛错**（循环/畸形事件或无区域密钥为静默无操作）（[test/telemetry.test.ts](test/telemetry.test.ts)）。单元套件保持无网络；单独的 `npm run telemetry:probe`（[scripts/telemetry-probe.cjs](scripts/telemetry-probe.cjs)，可用 `APTABASE_KEY` 覆盖以发错误密钥）向 **dev** Aptabase 项目发真实事件（已发布扩展始终报告到 prod）。

## 1.4.23 — 2026-06-29

> 默认隐藏思考轨迹、始终显示进度指示、记住的模式偏好，以及 YOLO → 自动接受重命名。

### 新增

- **思考轨迹默认隐藏（#26）。** Grok 推理不再占满聊天 — 推理时显示淡化 **思考中…** 占位（大脑图标）。从齿轮 → **配置与调试 → 显示思考轨迹** 重新打开（由 `grok.showThinking` 支持的实时开关）；对已加载会话也生效。显示时，思考行与工具行一致 — 同字号、前导 **大脑图标**、共用 chevron + 悬停（曾为较小 11px 且无图标）。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)、[src/sidebar.ts](src/sidebar.ts)、[package.json](package.json)）
- **回合进行中聊天始终显示实时进度。** 回合进行时，保证屏幕上有 **Grokking / 运行中工具 / 思考中…** 之一 — 无死帧，即使轨迹隐藏。（[media/chat.js](media/chat.js)）
- **滚到底部（#28）。** 向上滚离底部后，输入区上方出现浮动按钮；点击动画跳回底部。锚定到聊天输入区域，任意 `chatFontScale` 缩放位置正确。（[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）
- **新会话记住上次模式（#25）。** **代理** 与 **自动接受** 之间的上次切换在新会话上重应用（计划模式故意永不记忆），与模型与力度已有持久化一致。预先应用，因此工具栏从首次绘制即显示正确模式 — 无代理 → 自动接受闪烁。由 `grok.defaultMode` 支持。（[src/sidebar.ts](src/sidebar.ts)、[package.json](package.json)）

### 变更

- **进度指示器统一外观。** *Grokking*、*思考中…* 占位与运行中工具均使用编辑器字号、15px 前导图标、相同淡色与间距 — 运行中工具不再变亮像悬停。动效按指示器区分：*Grokking* 旋转 lucide **orbit** 图标（通用等待），*思考* 与工具使用 **三点闪烁**（离散进度）— 均替换旧的变形「…」药丸。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）
- **「YOLO」模式重命名为「自动接受」。** 模式选择器与底部工具栏按钮现显示 **自动接受**；「YOLO」仅保留在选择器一行描述中。内部模式 id（`yolo`）与 `autoApprove` 标志不变。（[media/chat.js](media/chat.js)）
- **用户消息的复制 + 时间戳现悬停显示**（气泡或其下行），与 grok 消息一致 — 曾始终显示。（[media/chat.css](media/chat.css)）
- **精简已有截图的 README 功能描述**，去掉多余的「长什么样」散文。（[README.md](README.md)）

### 测试 — 599

- 新增：自动接受标签、思考轨迹开关（默认隐藏 body class、实时翻转、**思考中…** 占位 vs 可见轨迹、配置与调试开关）、Grokking orbit 指示器、滚到底部可见阈值 + 点击，以及 **逐步回合模拟** 断言在轨迹隐藏 *与* 显示时每中途事件后有实时进度指示（[test/webview-ui.dom.test.ts](test/webview-ui.dom.test.ts)、[test/webview-harness.ts](test/webview-harness.ts)）；记住的模式策略 `modeToRemember`/`startsInYolo` — 计划永不持久、仅应用于新会话（#25）（[test/mode-prefs.test.ts](test/mode-prefs.test.ts)）。

## 1.4.22 — 2026-06-29

> 单一宿主侧栏以便在 Cursor 中移动，并停止对附件强制整文件读取。

### 修复

- **视图可再次重定位（Cursor）。** 我们曾同时在 **两处** 声明 `grokSidebar` 容器（`activitybar` + `secondarySideBar`）；`secondarySideBar` 仅在 VS Code ≥ 1.106 存在，在较旧基线（含当时 Cursor）上多余声明被解析但不支持 — 将视图钉在左侧，甚至可能移动 *其它* 扩展的视图。容器现单一宿主到 `activitybar`；右键 **Grok** 标题 → **移动到 → 辅助侧栏** 即可重定位（会持久）。（[package.json](package.json)）
- **附加文件以路径交给 grok，而非 `@` 读取。** 文件芯片曾变成 `@relPath`，即 grok「读整个文件」约定 — 会把大文件（大 CSV/日志）吸入上下文，且 *对二进制直接失败*：附加图/视频触发 `read_file` → *「Cannot read binary file」*（grok 无视觉）。芯片现渲染为普通 **「Attached file(s):」** 路径列表，由 grok 决定如何消费 — 对大文本 grep/范围读、将图/视频路径交给媒体工具、完整读小文件。选区范围芯片仍内联你选中的精确行。（[src/prompt-builder.ts](src/prompt-builder.ts)）
- **修正订阅要求说明。** 登录屏曾称 Grok Build 需要 *SuperGrok **Heavy*** — 两处错误：实为 **任意 SuperGrok *或* X Premium+** 订阅，且点名 $300/月 Heavy 层吓退了符合条件的用户。已在引导、README 与市场描述中修复（并澄清 Grok 免费层不包含 CLI 代理）。（[media/chat.js](media/chat.js)、[README.md](README.md)、[package.json](package.json)）

### 变更

- **「语音输入」功能在 UI 与文档中重命名为「语音控制」。**（[README.md](README.md)、[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)）
- **欢迎副文再次为「(The Product Compass)」**（去掉 “Newsletter” 后缀）。（[src/sidebar.ts](src/sidebar.ts)）

## 1.4.21 — 2026-06-29

> 仅文档补丁：README 截图匹配当前（v1.4.20）UI。

### 变更

- **刷新 README 截图。** 新主图，以及 **会话历史**、重新设计的 **工具调用行** 与 **权限 diff 预览** 卡片截图；工具调用描述匹配分类/图标设计。移除旧 v1.2.0 侧栏截图。（[README.md](README.md)、[docs/screenshots/](docs/screenshots/)）

## 1.4.20 — 2026-06-28

> 聊天可读性大修与清理：工具与思考行采用 Codex 风格类别图标与默认淡化、悬停变亮；失败工具终于显示 *原因*；每段叙述位于其描述的工具之上；空「primer」会话不再污染历史（#24）。并将 **Unofficial → Community（社区版）** 重命名。

### 变更

- **工具调用摘要按工具实际行为分类。** 读、glob 与 grep 曾一律汇总为「Ran N commands」；现按 ACP kind 分桶为「Explored N items」/「Edited N files」/「Deleted N files」/「searched web」/「Ran N commands」— 读了五个文件的回合显示「Explored 5 items」而非「Ran 5 commands」。恢复会话也适用：线形式省略 `kind` 时从工具标题恢复类别。（[media/chat.js](media/chat.js)）
- **回合叙述现与工具组交错，而非堆在其上方。** grok 每步先叙述再跑工具（叙述 → 工具 → 叙述 → 工具）；叙述曾合并为一个气泡、工具摘要连续堆在下方，看起来随意。每句叙述现直接渲染在其引入的工具组之上，保留 grok 真实顺序。（[media/chat.js](media/chat.js)）
- **工具与思考行重排（对齐 Codex）。** 每个工具行（单条或组）前导一个 **lucide 类别图标** — `file`（读）/ `folder-search`（搜索）/ `pencil`（编辑）/ `square-terminal`（命令，及兜底），按组内最强动作选取。行左对齐标准字体，**默认淡化、悬停变亮**（无背景高亮）；运行中组完成前保持「活动」。展开体用细次要边框（非蓝）。思考块现共享工具行 chevron — 同字形，在标签 **右侧** — 以及相同展开边框。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）
- **生成的图/视频与消息文本对齐** — 去掉额外水平内边距。（[media/chat.css](media/chat.css)）
- **「Unofficial」→「Community（社区版）」。** 聊天页眉、扩展标题与 README 现为 **Grok Build（社区版）** / **Grok Build for VS Code（社区版）**；关于细则仍注明非官方、社区构建、与 xAI 无隶属。（[package.json](package.json)、[README.md](README.md)、[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)）

### 修复

- **工具调用标签不再泄漏原始正则/glob 模式。** 搜索工具曾把裸模式（如 `image_edit|/imagine`）整段作为标签；现显示 `Search <pattern>`，未预知的工具回退到 grok 自身格式化标题，而非刮取任意原始输入。（[media/chat.js](media/chat.js)）
- **失败的工具调用现显示原因，而非静默丢弃。** `status: "failed"` 的工具更新（如 *「Tool `image_to_video` failed: image reference not readable: …」* — grok 偶尔弄坏图片参数）曾渲染为无，看起来像 grok 放弃了。行现为错误色并在下方显示失败消息（含失败子项的折叠组图标变红）。（[media/webview-helpers.js](media/webview-helpers.js)、[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）
- **空「primer」会话不再在历史中堆积（#24）。** 扩展每次打开曾留下仅 primer 的空会话（标题「… Primer v4 Plan Mode …」）。现放弃空会话时 — 新建会话或切到另一会话 — 当场删除，因此至多存在一个未命名 **新会话**；一次性启动扫描清理更早运行留下的空项，通过 **读取聊天历史** 确认仅 primer，真实或非扩展会话永不触碰。检测基于内容且与代理无关 — 统计 `<user_query>` 包裹提示与 grok/composer 为 `/imagine` 等斜杠命令发送的 **未包裹** 提示（因此真实 composer 会话不会被误判为空）— 已对 `grok-build` 与 `cursor`（composer）代理的真实磁盘会话验证。存活的未命名会话始终显示为 **新会话**，而非 grok 的 primer 派生标题。（[src/sidebar.ts](src/sidebar.ts)、[src/sessions.ts](src/sessions.ts)、[src/grok-primer.ts](src/grok-primer.ts)）

### 测试 — 582

- 新增：从真实 Grok + Composer 转录重建的工具调用分类、原始模式泄漏修复、未预知工具回退、叙述↔工具组交错、计划/权限卡片落在交错铺垫下方、每行 **类别图标**（最强动作选取）与 **失败工具呈现**，驱动真实 `media/chat.js`（[test/tool-summary.dom.test.ts](test/tool-summary.dom.test.ts)）；思考↔工具 **chevron 统一**（[test/webview-ui.dom.test.ts](test/webview-ui.dom.test.ts)）；空 primer 会话检测含未包裹 composer 提示 — `extractUserQueries` / `classifyUserQueries` / `isEmptyPrimerSession`（[test/sessions.test.ts](test/sessions.test.ts)）与 `isPrimerSummary`（[test/grok-primer.test.ts](test/grok-primer.test.ts)）。

## 1.4.19 — 2026-06-28

> 来自实时图像生成会话的卡片 UX 打磨：权限卡片按序阅读、回答后最小化，恢复的计划默认折叠，后台任务通知不再污染聊天。

### 修复

- **权限提示后 Grok 的回复现渲染在卡片 *下方*，而非上方。** 权限请求中途到达，流式输出继续追加到已在屏幕上 *高于* 新卡片的代理气泡 — 只有新的用户回合才会把对话推过它。卡片现先结束进行中的回合（计划卡片已用的 `commitAgentTurn()`），因此回答后的一切有序落在其下。（[media/chat.js](media/chat.js)）
- **已回答的权限卡片在重新聚焦后台会话时不再以 *活动* 状态重现。** 重新聚焦重放会话的 post 缓冲，但答案（仅 webview 的折叠）不在其中，因此已决定的卡片会以完全展开与活动按钮回来。主机现于回答时在缓冲中记录 `permissionResolved` 标记，重放卡片以折叠态回来。（[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)）

### 新增

- **已回答的权限卡片跨完整重载持久化。** CLI 在 `session/load` 上不重放 `session/request_permission`，恢复会话曾丢失你做过的每个批准。扩展现持久化每张已回答卡片（标题 + 允许/拒绝 + 门控的 tool-call id），并作为 **折叠** 卡片 **锚定到其门控的精确工具** 重放 — 按 tool-call id，或无 id 时按工具标题（卡片标题 *即* 工具标题）— 因此落在你回答的位置、回合中间，而非回合边界（若工具从不重放则回退到用户消息位置）。（[src/sidebar.ts](src/sidebar.ts)、[src/session.ts](src/session.ts)、[src/sessions.ts](src/sessions.ts)、[src/acp-dispatch.ts](src/acp-dispatch.ts)、[media/chat.js](media/chat.js)）

### 变更

- **已回答的权限卡片折叠为一条淡化行。** 选择选项后曾留下带灰按钮与「你选择了：…」的完整卡片。现最小化为一行不可交互文本 — 彩色 `Allowed` / `Rejected` 动词 + 应用对象 — 与已裁决提问/计划卡片一致，下方有「Grokking…」指示器直到 grok 恢复。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）
- **恢复的计划卡片默认折叠。** 恢复长会话不再倾倒完整计划正文 — 每个恢复的计划显示标题、裁决与 `显示计划` / `隐藏计划` 切换（正文仍在 DOM 中，仅隐藏）。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）
- **后台任务完成为一次性 toast，而非聊天气泡。** 当 grok 将长命令（如嵌套 `grok -p …` 图/视频任务）后台化时，CLI 发出结构化 `task_completed` 更新 *并* 以包裹在 `<system-reminder>…` 中的 `user_message_chunk` 回馈结果。扩展现将 `task_backgrounded` / `task_completed` 路由到自有事件，完成时弹出单次 `showInformationMessage`（含 **显示日志**）— 会话重放时跳过 — 并丢弃重放的 `<system-reminder>` 回合，使其永不在恢复时作为假用户气泡出现。（[src/acp-dispatch.ts](src/acp-dispatch.ts)、[src/acp.ts](src/acp.ts)、[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)）

### 测试 — 545

- 新增：`task_backgrounded` / `task_completed` 路由、`summarizeBackgroundCommand` 与 `permissionOutcomeFor`（[test/acp-dispatch.test.ts](test/acp-dispatch.test.ts)）；权限卡片排序 + 折叠 + 重新聚焦存活 + 恢复折叠卡片交错、恢复计划折叠切换，以及恢复时 `<system-reminder>` 抑制，驱动真实 `media/chat.js`（[test/card-collapse-tasks.dom.test.ts](test/card-collapse-tasks.dom.test.ts)）。

## 1.4.18 — 2026-06-28

> Grok CLI 修复了 #22 Windows 会话启动回归（0.2.71，现稳定通道 0.2.72）— 采用并重新启用更新。

### 修复

- **最新 Grok CLI 上会话再次可启动，Windows 更新不再暂停（#22）。** xAI 修复了 Windows 上跨 0.2.61–0.2.70 挂起会话启动的 `agent stdio` 回归（0.2.61–0.2.64 在 initialize，随后 0.2.67–0.2.70 在 `session/new`）。修复进入 **0.2.71**，现已在 **stable** 通道为 **0.2.72**。在原生 Windows 端到端验证 — `session/new` stdin-open 探测通过，完整实时 ACP 门控全绿（握手、提示往返、会话恢复、计划模式、子代理）。扩展现将 **0.2.72 视为受支持构建**：启动前将有界损坏范围 **0.2.61–0.2.70** 钉到 0.2.72，齿轮 → **更新 Grok Build CLI** 操作（与升级时静默更新）在 Windows 上再次正常工作。失败时反应式降级仍作为任何 *未来* 仍损坏、高于 0.2.72 构建的后盾。（[src/cli-locator.ts](src/cli-locator.ts)、[src/sidebar.ts](src/sidebar.ts)）

## 1.4.17 — 2026-06-27

> 将 Windows 钉到最后一个可用的 Grok CLI，针对 *任意* 更新构建 — 0.2.61–0.2.69 均破坏会话启动（#22）。

### 变更

- **#22 Windows 守卫现将 *任意* 高于 0.2.60 的 Grok CLI 构建在启动前钉回 0.2.60**，而非跟踪固定损坏范围。0.2.61–0.2.64 在 `initialize` 挂起；0.2.67（stable）与 0.2.69（alpha）回答 `initialize` 但在 `session/new` 挂起 — bug 在每个高于 0.2.60 的构建上持续，两通道均无修复。与其每构建扩大范围（并在每个新构建上承受约 120s 反应式挂起），扩展将受支持 0.2.60 之后的一切在 Windows 上视为损坏。当 xAI 发布通过 `session/new` 检查的构建时，提高一行受支持版本即可采用；失败时反应式降级保留为后盾。（[src/cli-locator.ts](src/cli-locator.ts)）

## 1.4.16 — 2026-06-26

> 更清晰的列表与文档；更轻的更新日志。

### 变更

- **重写 README**，以扩展为你做的事领先 — diff 预览批准、`@file` 上下文、内联图/视频、语音 — 而非内部实现，并精简功能列表。
- **列表澄清** 为 **非官方社区扩展**（展示名 + 描述）。
- **更新日志精简：** 1.4.0 之前的发布移至 [docs/CHANGELOG-ARCHIVE.md](docs/CHANGELOG-ARCHIVE.md)；后续条目保持简洁。

## 1.4.15 — 2026-06-26

> 覆盖 #22 Windows 会话启动 bug 的更新 Grok CLI 构建（至 0.2.67）以及挂起移到会话启动时的情况。

### 修复

- **Windows 会话启动变通现覆盖 Grok CLI 0.2.65–0.2.67 与 `session/new` 阶段挂起（#22）。** Grok CLI 0.2.67 *看起来* 已修复 — ACP `initialize` 握手再次应答 — 但 stdin-until-EOF 回归仅 **移动**：下一请求 `session/new` 现挂起（stdin 保持打开，任何实时客户端必须如此），真实会话仍无法启动。v1.4.14 仅知 0.2.61–0.2.64 范围且仅识别 `initialize` 阶段挂起，因此落到 0.2.65–0.2.67 的用户卡住。现：主动钉覆盖完整已确认损坏范围 **0.2.61–0.2.67** 并在启动前将 CLI 钉回最后一个完全可用的 **0.2.60**；基于证据的反应式恢复也在 **`session/new` / `session/load`** 超时时触发，不仅是 `initialize` — 因此未来仍损坏的构建会在观察到的失败上自愈，无论哪个启动请求挂起。用受控 stdin-open 探测（`initialize` 然后 `session/new`）对真实 0.2.67 验证。（[src/cli-locator.ts](src/cli-locator.ts)、[src/sidebar.ts](src/sidebar.ts)）

### 文档

- 记录 **0.2.67 未修复 #22** — 挂起从 `initialize` 移到 `session/new` — 复现探测见 [research/stdio-eof-regression.md](research/stdio-eof-regression.md)。将 CLAUDE.md 状态重写为简洁当前状态项目图（按版本历史在此更新日志，不在那里）。

## 1.4.14 — 2026-06-25

> 权限卡片上更顺畅的 diff 审阅。

### 功能

- **Diff 预览不再催你保存、自动打开并自行清理（#21）。** 关闭 diff 预览 **不再提示保存**：扩展打开的每个 diff — 无论来自编辑卡片上的 *打开 diff 预览 →* 链接还是权限卡片自动打开 — 现由只读虚拟文档支持而非临时缓冲，因此无可保存内容（并获得正确语法高亮）。权限卡片上 diff 也 **自动打开**（*打开 diff →* 按钮保留以便重开）并在你点 **允许 / 拒绝** 时 **自行关闭**。预览在 Grok 许多小顺序编辑间复用单一标签并保持聊天焦点，因此审阅一串编辑只需：扫一眼、决定、重复。（[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)）

## 1.4.13 — 2026-06-25

> 若 *未来* Grok CLI 构建带有相同 Windows bug，可自愈恢复。_（未单独发布 — 并入 1.4.14。）_

### 修复

- **不仅对已知损坏构建，对仍损坏的未来 CLI 构建也自动恢复（#22）。** v1.4.12 在启动前检测到 *已知* 损坏构建（0.2.61–0.2.64）时将 CLI 钉回 0.2.60。但若 xAI 发布 **新** 构建（0.2.65+）仍有 bug，封闭范围抓不到，会话会挂起且无自动修复。扩展现也 **反应式** 恢复：若 Windows 上会话启动失败且带回归签名（`initialize` 握手超时 / *「exited (code null)」*）且 CLI 高于受支持 0.2.60，自动降级到 0.2.60 并 **重试启动一次** — 由实际失败触发而非硬编码版本列表，因此对尚不存在的构建也自愈。若你后来手动更新到另一损坏构建，下次失败时同样恢复。每次自动降级（主动或反应式）显示解释发生了什么的通知。若降级无法运行，仍得到与此前相同的手动变通消息。（[src/cli-locator.ts](src/cli-locator.ts)、[src/sidebar.ts](src/sidebar.ts)）

### 内部

- 在 macOS（Apple Silicon）验证回归 **仅 Windows** — 在 Windows 上挂起的 grok 0.2.64 在 stdin-open ACP `initialize` 握手约 450ms 完成（4/4 次）— 因此整个变通正确仅门控到 Windows。记录于 [research/stdio-eof-regression.md](research/stdio-eof-regression.md) 及复现探测。（[research/stdio-eof-mac-probe.cjs](research/stdio-eof-mac-probe.cjs)）

## 1.4.12 — 2026-06-25

> 绕过阻止会话启动的 Grok CLI 0.2.61+ bug。

### 修复

- **Grok CLI 0.2.61–0.2.64 上会话再次可启动（#22）。** Grok CLI 回归破坏了 `grok agent stdio`：代理不再在输入流关闭前读取首行输入，而实时连接永远不会关闭 — 因此扩展启动握手永久挂起，你看到 *「Grok exited (code null)」* / *「ACP request timed out: initialize」*。最后可用构建为 **0.2.60**。扩展无法让 CLI 读输入，因此现 **在启动时检测损坏 CLI 版本并在连接前自动钉回 0.2.60**，带一次性通知 — 无需手动降级。CLI 健康后不改动。若自动降级无法运行，启动失败消息现准确说明如何手动修复（`grok update --version 0.2.60`）。版本范围限定为已知损坏构建，以免未来修复版被不必要降级。（回归迄今仅报告于 Windows，因此自动钉与下方更新守卫目前仅在该处应用。）（[src/cli-locator.ts](src/cli-locator.ts)、[src/sidebar.ts](src/sidebar.ts)）
- **「更新 Grok Build CLI」不会把你移到损坏构建。** 因 Grok CLI 0.2.61+ 对扩展不可用（如上），齿轮 → **关于** 更新操作在你处于最新受支持版本（0.2.60）或更新时现 **禁用并附说明** — 以免一键更新重装损坏构建。仅当你 *低于* 0.2.60 时保持启用，且该情况下更新 **到 0.2.60**（从不更新到不受支持的 `latest`）。升级时静默 CLI 更新遵循相同规则。（[src/cli-locator.ts](src/cli-locator.ts)、[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)）

### 文档

- 在 [research/stdio-eof-regression.md](research/stdio-eof-regression.md) 记录根因、受控复现与可复制给 xAI 的 bug 报告。

## 1.4.11 — 2026-06-20

> 嵌套代码块正确渲染。

### 修复

- **嵌套代码块不再吃掉外层围栏（#20）。** 请求用 4 或 5 个反引号围栏的代码块（以便内含 ```` ``` ```` 块）时，曾剥掉外层围栏前三个反引号并在内层围栏处提前关闭 — 把一块拆成多块并弄乱输出。Markdown 渲染器现匹配三或更多反引号的围栏，并要求关闭围栏同长，因此更长外层正确包裹更短内层（符合 CommonMark 规范）。这使干净、可复制的嵌套示例（如 `AGENTS.md`）与 grok.com 和 Grok CLI 渲染一致。（[media/chat.js](media/chat.js)）

## 1.4.10 — 2026-06-18

> 在数千会话下仍保持快速的会话历史。

### 功能

- **会话历史分页加载，大规模仍快。** 历史下拉曾在每次打开时读取并解析 *所有* 已保存会话，项目有成百上千会话后变慢。现加载 **最近 100 条**（按最后活动最新优先）并在你 **滚到底部** 时拉取更早记录。**搜索框** 按名称过滤 **全部** 历史 — 不仅当前页 — 因此仍可瞬间找到旧会话。幕后用每次目录廉价 `stat` 排序会话（不读文件），仅读你查看的页，并按文件修改时间缓存，因此重开下拉几乎无磁盘读取。（[src/sessions.ts](src/sessions.ts)、[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）
- **在全新会话上切换模型或推理力度不再污染历史。** 部分模型与力度变更需要重启会话。若打开会话后、实际说话前多次切换，每次重启曾留下空的相同会话。现空会话（仅运行过隐藏设置）干净重启，无「总结并重启 vs. 仅重启」提示，并移除一次性会话而非堆积。若你重命名过该会话，名称带到重启后的会话。（[src/sidebar.ts](src/sidebar.ts)、[src/sessions.ts](src/sessions.ts)）

### 修复

- **历史下拉不再打开时裁切出右边缘。** 在行加载完成前快速打开会话历史弹出层可能定位过右，溢出面板边缘，仅关闭再开才正常。弹出层现右对齐到面板（尊重边缘内边距）并向左增长，因此无论会话加载时内容如何缩放都完整在屏内。窄面板中也限制宽度以适应，长会话名用省略号截断而非把弹出层推出左边缘。下拉打开时调整面板大小现实时重适配（无需关闭再开），切到其它面板标签或扩展会关闭它，避免回来时尺寸错误地重现。（[media/chat.js](media/chat.js)）

### 内部

- **历史弹出层的可选性能模拟。** 新 `npm run test:perf` 套件（不在 `npm test` 与 CI 中）构建 5000 会话内存存储并断言访问次数改进：首次打开文件读取从 5000 降到 100（约 98%），重复打开零读取（修改时间缓存），搜索先预热目录后保持无读 — 含建模延迟投影与真实内存解析成本挂钟。（[test/sessions.perf.ts](test/sessions.perf.ts)、[vitest.perf.config.ts](vitest.perf.config.ts)、[package.json](package.json)）

### 文档

- 在 [docs/architecture.md](docs/architecture.md)（§ 大规模历史）与 [CLAUDE.md](CLAUDE.md)（§ 历史分页）记录分页设计，并更新 [README](README.md) 中 *会话历史* 功能说明。

## 1.4.9 — 2026-06-16

> 放大聊天 — 仅聊天。

### 功能

- **可调聊天字号（#14）。** 新设置 `grok.chatFontScale` 仅缩放 Grok 聊天面板 — 文字、图标与间距一起 — 为百分比（如 `150`、`200`，或更小如 `70`）。不同于 VS Code 全局 `Ctrl/Cmd+Shift+=`，其余编辑器保持正常大小，因此可仅为可读性放大（或缩小）聊天。实时生效无需重载，任意缩放输入区钉在面板底部，支持用户（全局）与工作区（本地）范围。（[package.json](package.json)、[src/sidebar.ts](src/sidebar.ts)、[media/chat.css](media/chat.css)、[media/chat.js](media/chat.js)）

### 文档

- **README 打磨。** 为 *语音输入* 与 *代理仪表盘* 增加截图，并将部分线级实现细节从功能简介移至 [docs/architecture.md](docs/architecture.md)，使功能列表不那么像内部实现。（[README.md](README.md)、[docs/architecture.md](docs/architecture.md)）

## 1.4.8 — 2026-06-15

> 同时跑多个 Grok 会话 — 即时切换，一眼看到谁需要你。

### 功能

- **多会话代理仪表盘。** 侧栏现同时保持多个会话 *存活* 而非一次一个。从历史下拉切换 **即时且无损** — 离开的对话在后台继续（进行中、待批准等），切回精确状态无重载。选择已非存活的会话则与以往一样从历史加载。（[src/sidebar.ts](src/sidebar.ts)、[src/session.ts](src/session.ts)）
- **历史下拉中的状态圆点。** 每个会话显示圆点，无需打开即可了解：默认 **灰**，仅在有事时点亮：**蓝** = 工作中，**黄** = 需要你（权限、提问或待审计划），**绿** = 完成且有未打开输出，**红** = 出错且未打开。绿/红是 *未读* 角标 — 打开会话即清除，且 **持久化**，因此跨下方空闲清理甚至 VS Code 重启仍在。离开再回来，绿会话正是有结果等待的。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)、[src/session-pool.ts](src/session-pool.ts)）
- **空闲会话自动清理。** 为避免后台会话各自占着存活进程，闲置约一小时 — 或超过约 8 个存活 — 的会话被安静关闭（永不关闭正在工作或等你处理的）。它出现在历史中，点击重载，无丢失。（[src/session-pool.ts](src/session-pool.ts)）
- **更新 Grok Build CLI 时警告进行中的会话。** 现可同时跑多个会话，*更新 Grok Build CLI* 在有会话进行中或等你时会先确认 — 以免更新静默打断后台工作。（[src/sidebar.ts](src/sidebar.ts)）
- **Grok 启动前不再长时间停顿。** 发送首条消息曾静默 15–40 秒才出现内容。幕后扩展用隐藏计划模式指令为每会话 priming，该 primer 曾跑在你的首条消息 *之前*，且因 Grok Build 是代理式 CLI 会去读文件搜索工作区，真实提示才跑。primer 现 **会话一活就** 在后台静默触发，因此几乎总在你点发送前完成；若你很快，消息立即显示并在 primer 稳定时放行。primer 文本本身也裁到仅需教导的协议（曾诱使 Grok 去探索的产品简介与仓库链接已去掉），因此一拍完成而非数十秒。（[src/sidebar.ts](src/sidebar.ts)、[src/grok-primer.ts](src/grok-primer.ts)、[src/session.ts](src/session.ts)）
- **等待时的「Grokking…」指示器。** 每回合在你发送瞬间显示动画 *Grokking…* 占位，立即反馈 Grok 已收到消息 — 首个想法、回复或工具动作到达时就地替换。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）

## 1.4.7 — 2026-06-15

> 更清晰的数学，以及公式与图表的一键导出。

### 功能

- **数学现用 [MathJax](https://www.mathjax.org) 渲染（替换 KaTeX）。** MathJax 生成自包含 SVG，更接近「真 LaTeX」，渲染 `\label`/`\ref` 风格环境而不画红错，且 — 关键 — 每个公式可导出为矢量。行内 `\(…\)` 落在编辑器文本色基线上；独立 `\[…\]` 获得居中、可横向滚动的块。交换还修复了 Chromium 将 MathJax 隐藏可访问性 MathML 画成每个公式 *第二* 可见副本的双重渲染 bug（`enableAssistiveMml: false`）。（[media/chat.js](media/chat.js)、[src/sidebar.ts](src/sidebar.ts)、[media/mathjax/](media/mathjax/)）
- **独立数学 + Mermaid 图上的复制 / 下载 / 打开操作。** 悬停任一独立公式或已渲染图表，右上角浮层（镜像生成图操作）：**复制** LaTeX/Mermaid 源码、**下载** 为图片，或在 VS Code 图片预览中 **打开**。下载提供快速选择 — **PNG**（以 VS Code 主题背景栅格化，即你所见），或调优 **暗色** / **亮色** 背景的 **透明 SVG**。数学为每种重着色；Mermaid 以匹配的亮/暗主题重渲染，使「亮色背景」图实际使用亮色板。（[media/chat.js](media/chat.js)、[src/sidebar.ts](src/sidebar.ts)）

### 内部

- **`video-gen` 排除出默认实时测试门控**（通过 `--only=video-gen` 可选）。在无头测试线具中 grok 0.2.x 在 `/imagine-video` 上空转而不产生片段，因此永不完成 — 功能在交互下可用，默认开启测试只产生噪音。（[scripts/live-tests.cjs](scripts/live-tests.cjs)）

## 1.4.6 — 2026-06-15

> Grok 的 Mermaid 图现按图渲染。

### 功能

- **Mermaid 图渲染。** Grok 以 ` ```mermaid ` 围栏块回答 — 流程图、时序/状态图、git 图、类图、ER、饼图等 — 聊天此前显示为原始图源。现通过 vendored **[Mermaid](https://mermaid.js.org)** 库渲染为真图（打进扩展，无网络 — 离线与打包构建可用）。图随 VS Code（暗/亮）主题适配，并横向滚动以免宽流程图撑破窄侧栏。渲染异步且基于 DOM（Mermaid 测文字以布局节点），因此与 LaTeX 路径不同，作为对已插入消息的后渲染 pass；按图源键控的 SVG 缓存使流式气泡无闪烁（代理消息每动画帧重渲染）并避免同一图在首次渲染解析前布局数十次。半流式块在关闭 ` ``` ` 到达前保持纯文本；若 Mermaid 无法加载或图畸形，显示可读源码而非错误。（[media/chat.js](media/chat.js)、[src/sidebar.ts](src/sidebar.ts)、[media/mermaid/](media/mermaid/)）

## 1.4.5 — 2026-06-15

> Grok 的数学现按数学渲染。

### 功能

- **LaTeX / 数学渲染。** Grok 越来越多用 TeX 回答 — 行内 `\(…\)` 与独立 `\[…\]`（含 `\begin{pmatrix}` 矩阵、分数、求和、希腊字母）— 聊天此前显示为原始反斜杠汤。数学现用 **[KaTeX](https://katex.org)** 渲染，vendored 进扩展（无网络，离线与打包构建可用）。渲染器在 HTML 转义 *前* 抽出 LaTeX，使反斜杠与花括号完整保留；行内数学随文本流动，独立数学自有块并可横向滚动，以免宽矩阵撑破窄侧栏。畸形表达式渲染为行内红错（KaTeX `throwOnError:false`）而非空白消息；若 KaTeX 无法加载，显示原始 TeX 而非吞掉。`\label{…}`（Grok 在 `align`/`equation` 块中为交叉引用发出）在渲染前剥离 — KaTeX 无 `\ref`/`\eqref` 系统否则会画红错，且 `\label` 在真 LaTeX 中也无可见输出。单 `$…$` 故意 **不是** 分隔符 — 与正文货币（「$5 and $10」）假阳性过多。（[media/chat.js](media/chat.js)、[media/webview-helpers.js](media/webview-helpers.js)、[src/sidebar.ts](src/sidebar.ts)、[media/katex/](media/katex/)）

## 1.4.4 — 2026-06-15

> Grok 思考时你可再次阅读历史。

### 修复

- **Grok 思考时向上滚动不再被拽回底部**（[#16](https://github.com/phuryn/grok-build-vscode/issues/16)）。聊天曾在 *每次* 流式更新时吸到底部，因此任何向上重读更早消息（或 Grok 更早推理）的尝试会在下一块思考时被撤销。视图现仅在你已钉在底部时跟随流式输出；一旦向上滚读历史，自动滚动暂停并留在那里。你需要看到的真正交互活动 — **权限卡片**、**提问卡片** 与 **你自己发送的消息** — 仍将视图拉回并重新钉住。这也恢复了在权限卡片堆叠时继续关注推理的能力（[#15](https://github.com/phuryn/grok-build-vscode/issues/15)）。（[media/chat.js](media/chat.js)、[media/webview-helpers.js](media/webview-helpers.js)）

## 1.4.3 — 2026-06-09

> 文档跟上，以及更快、更精简的会话启动。

### 文档

- **重写 README。** 围绕三类受众重构：用户获得清晰的 **要求 → 安装 → 快速开始** 路径，然后是 **功能与能力** 小节，每项可折叠 — 按真正卖点排序（diff 预览批准、模式、`/imagine` 图+视频、语音…）而非实现。**配置**、**命令与快捷键** 与 **开发** 各折叠为单个 `<details>`，页面秒扫完，同时对市场列表自包含。深度内容 — 图示、消息流、模块图、设计说明，以及计划模式「唯一不薄的部分」说明 — 移至新 [docs/architecture.md](docs/architecture.md)，从短 *工作原理* 预告链接。
- **移除过时声明。** 去掉 **子代理** 功能小节（仍仅研究 — 实践中很少触发，不应读作已交付）与「生成媒体以内联 base64」已知限制（1.4.2 改为 `asWebviewUri` 流式）。主截图精简为侧栏 + 内联 `/imagine` 结果，*更多截图* 链到文件夹；移除无信息量的装饰图。
- **规范 `README.md` / `CHANGELOG.md` 大小写。** 工作树文件在磁盘上为小写（Windows 大小写不敏感疏忽）而 git 已跟踪大写；磁盘现匹配。（`vsce` 仍将 *打包* 副本在 `.vsix` 内规范为小写 — 其自有约定，市场渲染正常。）`scripts/release.*` 现引用 `CHANGELOG.md`，以便在大小写敏感文件系统上也能提取发布说明。

### 变更

- **隐藏计划模式 primer 不再消耗启动往返。** 扩展向 Grok 发送隐藏「primer」以教导计划模式裁决协议。曾在 **每次** 会话启动触发 — 新建 *与* 每次恢复 — 锁定输入区直到 Grok 确认，即使只是扫一眼也烧掉一轮。现 **惰性** 发送，作为你的 **首条真实提示** 前的自有隐藏回合 — 新建 *或* 恢复会话 — 因此与你已触发的工作同行。会话一连接输入区即可用，打开/放弃会话（或仅为读历史而恢复）零成本。在恢复后首次发送时重断言 primer（而非信任埋在重放历史中的副本，`/compact` 可能丢掉）使计划模式跨恢复可靠。尽力而为且协议不变 — 计划门控仍是真正强制。（[src/grok-primer.ts](src/grok-primer.ts)、[src/sidebar.ts](src/sidebar.ts)）

## 1.4.2 — 2026-06-09

> 生成视频现可渲染，内联媒体为更紧凑缩略图。

### 修复

- **生成视频（`/imagine-video`）终于可渲染。** 检测、路径提取、MIME 与 CSP 均已正确 — 失败在交付：多 MB 片段 base64 内联到单一 `postMessage` `data:` URI 被静默丢弃，因此 `<video>` 得到空源。生成文件现经 `webview.asWebviewUri` 提供（grok 主目录为 `localResourceRoots` 项），webview **直接从磁盘流式文件** 而非作为巨型字符串携带 — 视频可播，大图惰性加载。写在服务根外的文件仍回退 base64 `data:` URI，无回归。（[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)）

### 打磨

- **复制路径 / 在 VS Code 中打开 悬停图标现落在图片上。** 曾锚定到聊天列右边缘，缩略图上浮在图片右侧空白。媒体块现按渲染图尺寸，图标钉在图片自身右上角 — 视频亦然。（[media/chat.css](media/chat.css)）
- **内联媒体最大宽 320px**（曾 640px），生成在窄侧栏中读作紧凑缩略图而非主导聊天。文件未改 — 点击图片（或 **在 VS Code 中打开**）看全分辨率。（[media/chat.css](media/chat.css)）

## 1.4.1 — 2026-06-09

> 针对 1.4.0 中生成图片停止渲染的两部分修复。

### 修复

- **生成图片再次可见。** 1.4.0 用 `width: fit-content` 容器将内联媒体限制 640px。这使 `<img>` 的 `max-width: 100%` 相对 *不确定* 宽度解析，在 Chromium 中将替换元素塌为 0 — 因此每次生成（含普通 `/imagine`）渲染为不可见零宽图。容器现为普通块（确定宽度），百分比正确解析而 **640px 上限保留**。（[media/chat.css](media/chat.css)）
- **参考编辑图（`image_edit`）也可渲染。** 用 `/imagine` 编辑真实照片会跑 Grok 的 **`image_edit`** 工具（标题 `imagine-edit: …`，变体 `ImageEdit`）— 1.4.0 检测器未知该表面，保存文件从未内联。对 grok 0.2.x 实机确认：完成结果以与其它媒体工具相同的机器可读 JSON `{path}` 报告路径（扩展长度 `\\?\C:\…` Windows 路径，剥为规范形式）。`isMediaGenToolCall` 现识别它。（[src/acp-dispatch.ts](src/acp-dispatch.ts)）

## 1.4.0 — 2026-06-08

> 两个新 CLI 表面 — 生成图/视频渲染与退出登录操作。媒体线格式已对 grok 0.2.33 实机确认（见 [research/image-generation.md](research/image-generation.md)）。可在 [VS Code 市场](https://marketplace.visualstudio.com/items?itemName=PawelHuryn.grok-vscode-phuryn) 获取。

### 修复

- **你发送的每条消息不再渲染两次（grok 0.2.33 回归）。** grok **≥0.2.33 将实时提示回显** 为回合中途的 `user_message_chunk` — 0.2.3 不会（代码自有注释写「代理从不回显」）。webview 已从 `send()` 乐观渲染气泡，因此回显产生 **第二个重复气泡**（并双计 `userMessageCount`，扭曲计划定位）。主机现 **仅在 session/load 重放期间** 转发 `user_message_chunk`（新 `replaying` 标志），webview 的 `appendUserChunk` 同样守卫 — 因此实时回显永不双泡。（[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)）

### 图片与视频生成

- **生成图片与视频内联渲染。** 当 Grok 生成图片（订阅专属 `/imagine`）或视频（`/imagine-video`）时，现显示为实际图片或可播放 `<video>`，而非死工具芯片。真实线格式（实机确认，[research/image-generation.md](research/image-generation.md)）**不是** ACP 图片块 — Grok 的 **`image_gen`** / **`image_to_video`** 工具将文件写入会话目录（`images/*.jpg`、`videos/*.mp4`）并在完成工具结果文本中以 JSON 字符串报告路径。主机识别媒体生成调用，解析路径并按扩展名区分图/视频（`isMediaGenToolCall`/`extractGeneratedMediaPaths`），读取文件并以内联 `data:` URI（CSP 下 webview 不能加载任意磁盘路径 — 为视频加了 `media-src data:`），webview 渲染。悬停图/视频显示右上角两图标（样式如代码块复制按钮）：**复制路径** 与 **在 VS Code 中打开** — 后者是打开 *视频* 文件的唯一方式，因其点击驱动播放控件（点击图片仍打开源）。内联媒体长边 **640px** 上限，使全分辨率生成在聊天中仍可读（文件未改）。也处理 ACP 标准图片/`resource_link` 块作为前向兼容回退。二者在 **会话恢复** 上相同渲染（Grok 将生成重放为单个折叠 `tool_call`）。（[src/acp-dispatch.ts](src/acp-dispatch.ts)、[src/acp.ts](src/acp.ts)、[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)）

### 账户

- **从扩展退出登录（#13）。** 新 `Grok: 退出登录` 命令（面板）与齿轮菜单 **退出登录** 项运行 `grok logout` 清除 CLI 缓存凭证、拆卸存活会话并回到需认证的引导屏 — 无需切终端换 xAI 账户。（[src/sidebar.ts](src/sidebar.ts)、[src/extension.ts](src/extension.ts)、[package.json](package.json)、[media/chat.js](media/chat.js)）

### 保持 CLI 最新

- **扩展升级时静默更新 Grok Build CLI。** Grok 不自动更新，安装新扩展版本的用户可能停在线格式与新扩展不匹配的旧 CLI。现扩展自身版本变更后首次会话启动时，主机在生成 CLI 前运行一次 `grok update` — 下次握手报告刚更新的版本。**仅在实际升级时** 触发，从不在全新安装（「非首次运行」规则 — 干净安装仅记录基线版本），每次激活至多一次，经 `execFile` 且无存活 grok 进程（避开 Windows 二进制锁），尽力而为（更新失败记录并继续当前二进制）。门控为纯、有单元测试的 `extensionWasUpgraded`。（[src/cli-locator.ts](src/cli-locator.ts)、[src/sidebar.ts](src/sidebar.ts)、[media/chat.js](media/chat.js)）
- **欢迎状态行跟踪真实就绪。** 现跟随真实会话启动生命周期 — `Updating Grok Build CLI…`（静默更新中）→ `Starting…`（经隐藏 primer 回合，输入区转圈时）→ `Connected · v<version>`。此前在 ACP 握手时即翻为「connected」，*在* primer 发送并处理前，因此在 grok 仍被 priming 时声称就绪；现保持「Starting…」直到转圈真正清除。（[media/chat.js](media/chat.js)）

### 齿轮菜单与状态打磨

- **齿轮菜单获得「其它」组，含关于、配置与调试、退出登录。** 扁平配置 / 账户 / 调试折叠为两个子视图（镜像模型选择器）：**关于** 显示 *本扩展* + *Grok Build CLI* 版本，检查更新 CLI（`grok update --check`），并提供 **更新 Grok Build CLI** 操作；**配置与调试** 持有配置链接 + 扩展日志。按需更新拆卸会话、运行 `grok update`，然后在新二进制上 **恢复同一会话**（保留对话），显示 `Updating… → Starting… → Connected · v<new>` 生命周期。（[media/chat.js](media/chat.js)、[media/chat.css](media/chat.css)、[src/sidebar.ts](src/sidebar.ts)）
- **关于显示真实 CLI 版本，即使握手未标记的构建。** 原生 Windows 构建不在 ACP `initialize` 响应中报告版本，因此关于曾在自信的「CLI 已最新」旁显示裸「—」。现采用更新检查返回的版本（`grok update --check` 的 `currentVersion`），无事可做时操作折叠为灰显「CLI 已最新」（无按钮）。（[media/chat.js](media/chat.js)）
- **配置与调试 → MCP 服务器链接在 Windows 上可用。** 曾向终端输入带引号的 `"C:\…\grok.exe" mcp list`，PowerShell（Windows 默认 shell）将其解析为字符串字面量并以「Unexpected token」拒绝。现直接将 grok 作为终端自身进程启动（`shellPath`/`shellArgs` → `grok mcp list`），完全避开 shell 引号。（[src/sidebar.ts](src/sidebar.ts)）
- **瞬时状态文字有动画并大写。** 「Starting」「Updating Grok Build CLI」「Thinking」「Summarizing」现显示动画尾部省略号（CSS `::after` 以免布局偏移），欢迎行读作「Starting…」/「Connected · v…」（大写）。（[media/chat.css](media/chat.css)、[media/chat.js](media/chat.js)）

### 测试

- v1.4.0 新增不依赖 grok 的测试：`image_gen`/`image_to_video` 结果中路径-in-JSON 提取（`isMediaGenToolCall`/`extractGeneratedMediaPaths`，区分图/视频并覆盖折叠恢复形状）与 ACP 标准图片回退（`extractImageContent`/`collectToolImages` 跨行内 base64、资源 blob、文件/远程 `resource_link`）以及图 vs 文本块路由，以及驱动真实 `media/chat.js` 渲染路径的 happy-dom DOM 测试 — `addGeneratedMedia`（可点击内联 `<img>`、`<video controls>`、远程链接回退，以及图与视频的悬停 **复制路径** / **在 VS Code 中打开**）。加上静默更新门控（`extensionWasUpgraded` — 全新安装 vs 升级 vs 未变 vs 降级）与固定欢迎版本行生命周期的 happy-dom 套件（`Updating Grok Build CLI…` → 握手时 `Starting…` → 仅在 priming 转圈清除时 `Connected · v<version>`，后续忙碌切换不回退）。以及 0.2.33 回归修复：回显实时 `user_message_chunk` 的假 CLI 场景 + 断言单气泡（无重复）的 DOM 测试，以及齿轮菜单套件（其它组、关于面板版本 + `grokUpdateStatus` 驱动的更新按钮含从更新检查回退版本、配置与调试链接）。**共 401 个不依赖 grok 的测试。**

---

更早发布（1.4.0 之前）：见 [docs/CHANGELOG-ARCHIVE.md](docs/CHANGELOG-ARCHIVE.md)。
