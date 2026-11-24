# 实施计划与版本记录

## 当前有效方案

### 目标与范围

网页基于 `doc/Duo 三模型精简提示词.md（含 AGENTS.md 规则）.md` 生成和复制提示词；支持模型名设置与本地记忆、补充上下文、手动选择状态后的下一步推荐，以及经用户选择、预览和确认的 AGENTS.md 规则节回写。

本地记录方案另将项目上下文保存到 `docs/`。本文件记录方案，最新的执行清单以 `handoff/HANDOFF_latest.md` 为准。

### 当前默认值和关键规则

- 模型显示名：`Luna` / `Opus` / `Sonnet`；用户可更改并记忆。
- 角色占位符对应三个可编辑模型名；模板其他正文不做全局替换。V1.2 为 15 处；V1.5 起 P1/P2/AGENTS/P6 按 Handoff 定稿，共 20 处（Luna 4 / Opus 9 / Sonnet 7）。
- 职责（V1.5）：P1 Luna 只整理代码事实，不判根因；P2 Opus 判定根因/接入点；实施后问题由 Opus 在 P6 直接处理，不回到 P1。
- 下一步状态由用户手动选择。
- 回写仅针对唯一的 `## 三模型协作规则` 章节；标题重复或格式无法安全处理时拒绝写入。
- 本地项目记录位于 `PRJ_00_AgentPrompt/docs/`，本轮只新增计划清单内文件，不修改 `app/`、`doc/`。

### 实施状态

- 网页实现：已完成；第一轮记录详见 `handoff/2026-11-23_implementation-report.md`。
- 本地记录文件：按 V1.3 新增。
- 当前待办：在 Edge、Chrome 手动验证网页交互；AC17 需在独立新会话验证上下文恢复。

## 版本变化摘要

> 本节按时间记录方案演进。标有“已作废”的内容不是当前有效值。

### V1 — 首轮网页方案

提出使用本地静态网页，按步骤生成提示词，支持预览、复制、模型名设置、状态推荐、上下文输入和 AGENTS.md 回写。初始验收和实现范围后来由 Sonnet 复核、计划模型裁决调整。

### V1.1 — Sonnet Plan Review 后的计划修订

- 接受状态推荐必须明确取得模型输出状态；后续确定采用用户手动选择。
- 加入浏览器能力检测、回写失败保护及独立模板基准。
- 收紧回写章节定位规则。
- **已作废：** 当时给出的默认模型值 `Luna / Opus 5.5 / Sonnet 5.5` 与源模板正文中的简称不一致；不得作为当前默认值。

### V1.2 — 模型占位符与逐字验收修正

- 当前默认值改为 `Luna / Opus / Sonnet`。
- 明确只替换源提示词代码块中的 15 处角色名；步骤标题继续作为静态参考。
- AC02 使用源 Markdown 代码块作为独立比对基准。
- 这是网页实现时采用的最新有效设计。

### V1.3 — 本地上下文记录

- 用户要求把结构化需求、计划、验收和交接保存在项目本地。
- 新增 `docs/` 及 8 个记录文件；保持网页代码和 `doc/` 源资料不变。
- 采用 `docs/README.md` 的恢复步骤和维护规则。

### V1.4 — 提示词文档落盘规范

- 用户要求生成的提示词指明各阶段文档的项目相对路径和写入内容。
- 增加可开关的文档落盘规范、可配置根目录、日期路径及 AGENTS 规则追加行。
- **已作废：** V1.4 增量稿中 AC21 未明确列出 P2b，且 AC22 对 `a\b\` 的期望与斜杠规范化不一致。不得按该稿实施。

### V1.4.1 — 完整执行基准

- 规范文件按要求原位更新，带日期归档同名时加 `_2`、`_3`。
- P2b/P4 在 AC 变化时同步更新 `ACCEPTANCE.md`。
- AC21 明确覆盖 P1、P2、P2b、P3、P4、P5。
- `docsRoot` 只允许安全相对路径；`a\b\` 规范化为 `a/b`。
- 完整规则、验收标准和实施步骤以 `handoff/HANDOFF_latest.md` 为唯一执行基准。

### V1.4.2 — AC25 措辞修正

- AC25 明确为「AC02 按本 Handoff 修订；AC01、AC03–AC20 定义不变」，不改变 AC 判定内容。
- 明确 AGENTS 规则追加行与源规则块之间只用单个换行；第 1 条源模板到 DOC_RULES 的双换行不适用于 AGENTS。
- V1.4.1 已授权代码改动保留；本版本只修正文档措辞和当前进度。
- 裁决依据：`review/2026-11-24_decision.md`。

### V1.4.3 — P1 任务类型状态回填一致性

- 用户报告：P1 任务类型未切换时，生成结果与页面默认/显示值不一致；切换后才一致。
- 根因：P1 状态对象字段为 `taskType`，而下拉框 DOM id 为 `task-type`；`setField` 初始化回填时直接以 state key 查 DOM id，无法设置该下拉框。页面用保存的 state 生成预览，但下拉框仍保留 HTML 首选项，造成显示与结果不一致。
- 最小修复：回填 P1 字段时将 `taskType` 映射到 `task-type`；保持默认 Bug、Feature 选项、保存格式和生成模板不变。
- 新增 AC26 验证初始化及恢复保存状态时控件与预览一致。具体修改和测试计划见 `handoff/HANDOFF_latest.md` V1.4.3。

### V1.4.4 — P1 任务类型修复的可验证性补正

用户复报同一 Bug。重新对照代码确认 V1.4.3 根因成立（`app.js` L228–233 `setField` 按 key 查 DOM id；L248 传入 `state.forms.P1`；L403–411 输入事件才做 `task-type`→`taskType` 映射）。

变更对照（旧 → 新）：

| 项目 | V1.4.3（旧） | V1.4.4（新） |
|---|---|---|
| 修复方式 | 在回填时把 `taskType` 映射到 `task-type`（位置未定） | 新增纯函数 `getP1FieldValues(form)`，返回 `{ "task-type", requirement, expected, constraints }`；`renderFields` 改用其结果调用 `setField`；追加导出到 `PromptApp`（只增不改现有成员） |
| 自测可行性 | selftest 新增 AC26 断言（实际无法访问 `init()` 内闭包，**不可行**） | selftest 断言 `getP1FieldValues` 的映射与回退；DOM 恢复部分改为 Edge/Chrome 手动验证 |
| 非法保存值 | 未定义 | `mergeState` 中 `forms.P1.taskType` 不属于 `Bug`/`Feature` 时回退 `Bug`；schema 不变 |
| AC26 | 单条，Given/When/Then 仅含 DOM 场景 | 拆为 AC26a（selftest 逻辑）与 AC26b（手动 DOM），增加非法值场景 |
| 其他 | — | 默认值、选项、模板、输入事件映射、原 50 条断言不变 |

### V1.4.5 — P3 复核意见裁决

依据 `review/2026-11-24_plan-review_2.md`（REVIEW REQUIRED），裁决见 `review/2026-11-24_decision_2.md`，两项均 ACCEPT：

| 项目 | V1.4.4（旧） | V1.4.5（新） |
|---|---|---|
| AC26b 前置条件 | 只规定 `forms.P1.taskType` | 同时规定 `currentStep: "P1"`；页面恢复上次步骤是 AC08 既有行为，不修改 |
| 代码范围 | Files to Modify 列出 templates/index/style 等 V1.4.1 文件 | 仅 `app/app.js`（第 7 条）+ `app/selftest.html`（AC26a）；V1.4.1 文件作为既有基线，只做回归 |
| P5 文档 | 更新 README、PLAN、ACCEPTANCE、REQUIREMENTS | 仅 `ACCEPTANCE.md` 结果表 + 带日期实施报告 |
| 过时步骤 | P3 开始时写入 2026-11-23 三份裁决 | 删除（文件已存在） |

V1.4.5 已由 P5 实施（`handoff/2026-11-24_implementation-report_2.md`）：Edge selftest 52/52；Chrome 和 AC26b 手动验收未执行。

### V1.5 — P1 职责收窄 + 新增 P6 实施后修正

用户需求见 `REQUIREMENTS.md` V1.5。

变更对照（旧 → 新）：

| 项目 | 旧（V1.4.5） | 新（V1.5） |
|---|---|---|
| P1 标题/职责 | “只读分析”；输出含“Bug 根因候选或 Feature 接入点” | “代码上下文整理”；只整理事实，明确“不判断根因、不提方案，供 Opus 分析” |
| P2 首句 | 基于 Luna 分析复核代码 | 基于 Luna 整理的代码上下文复核代码，由 Opus 判定根因/接入点；其余正文不变 |
| 实施后仍有 Bug / 追加 Feature | 无专门环节；只能回 P1 重来，或 P5 FAILED 后仅提示停止 | 新增 P6（Opus｜实施后修正）：基于 Handoff、实施报告和当前代码直接定位，输出 Updated Handoff → P3 |
| 状态推荐 | P5 COMPLETED/FAILED 为终止，无下一步 | 仍为终止状态，但提供“前往 P6”按钮；P6：PLAN APPROVED → P3，NEED USER INPUT → P2b |
| AGENTS 规则块 | 角色行按旧职责 | 角色行改为新职责；新增一行 P6 规则 |
| 角色占位符 | 15 处 | 20 处（Luna 4 / Opus 9 / Sonnet 7） |
| 模板基准（AC02） | P1/P2/AGENTS 对照 `doc/` 源文 | P1/P2/AGENTS/P6 对照 Handoff V1.5 定稿；P2b/P3/P4/P5 仍对照 `doc/`；`doc/` 不改 |
| 文档落盘 | 6 步 | 增加 P6 写入行；其余步骤不变 |
| 不变 | — | P2b/P3/P4/P5 正文、默认模型名、P1 表单与 V1.4.5 回填修复、localStorage 已有字段、回写安全规则 |

设计默认值（可由用户否决）：P5 FAILED 也提供前往 P6（原“不生成下一步”）；P6 表单为“类型（实施后 Bug / 追加 Feature）+ 问题/新需求（必填）+ 期望结果（可选，空为‘待确认’）”。

### V1.5.1 — P5 BLOCKED 裁决（AC20 适用范围 + 文档范围）

依据 `handoff/2026-11-24_implementation-report_3.md`，裁决见 `review/2026-11-24_decision_3.md`：

| 项目 | 旧（V1.5） | 新（V1.5.1） |
|---|---|---|
| AC20 | 要求整个 `app/`、`doc/` 哈希不变 | 只修改文档的轮次沿用原定义；有代码变更的轮次只核验 Handoff 未授权修改的文件（V1.5：`doc/**`、`app/index.html`、`app/style.css`） |
| `PROJECT_CONTEXT.md`、`README.md` 更新 | V1.5 完成条件 | 移为遗留项，待用户授权；不阻塞 COMPLETED |
| 代码 | — | KEEP |

### V1.5.2 — 规范文件同步

依据 `review/2026-11-24_decision_4.md`：decision_3 判定 PLAN UPDATED，但没有同步 PLAN 与 Handoff；ACCEPTANCE 摘要中 AC20 与结果表矛盾。本版本只同步文档，代码和 AC 定义不变。新增非阻塞遗留：selftest 断言名“P5 FAILED 是结束提示，不生成下一步”已过时（判定仍正确）。

### V1.5.3 — P3 回顾性复核裁决

依据 `review/2026-11-24_plan-review_5.md`（REVIEW REQUIRED），裁决见 `review/2026-11-24_decision_5.md`，两项均 ACCEPT：

| 项目 | 旧（V1.5.2） | 新（V1.5.3） |
|---|---|---|
| Handoff 中 PROJECT_CONTEXT/README | Scope、Files to Modify、步骤 6 仍列为 P5 待改，与补充节矛盾 | 三处标注“已完成，不属于后续待实施范围” |
| 已完成 Handoff 再跑 P3 | 未定义；按模板会输出 READY TO IMPLEMENT | 不输出 READY；V1.5 实施周期关闭；新代码工作须经 P6 或 P2b 生成新 Handoff |
| 代码 / AC | — | 不变（KEEP；ACCEPTANCE 不改） |

## 当前实施步骤

V1.5 代码已实施并保留（KEEP），记为 COMPLETED（含手动验收遗留）；V1.5.3 起实施周期关闭，不再走 P3/P5。2026-11-24 复跑 Edge、Chrome selftest 均为 65/65；未授权修改文件的哈希与基线一致。

下一步：
1. 用户在 Edge/Chrome 手动验收 AC10、AC28(c)、AC29，以及遗留的 AC01、AC03–AC09、AC11–AC13、AC22、AC24、AC26b。
2. ~~用户授权后更新 `docs/PROJECT_CONTEXT.md`、`docs/README.md` 的受影响行~~：已于 2026-11-24 经用户授权完成（角色、流程、P6、模板基准、验证状态、恢复步骤）。
3. AC17 在独立新会话验证。
4. 遗留：selftest 过时断言名，等下次授权改动 selftest 时只改名称。


## 停止条件

- 需要修改 `app/`、`doc/` 或清单以外文件时停止并请求确认。
- 会话证据不足或信息冲突时写“待确认”，不得补造历史。
- 任何未实际执行的验收项目不得报告 PASS。
