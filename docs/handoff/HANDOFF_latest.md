# Updated Developer Handoff — V1.6（完整版本，唯一执行依据）

## Final Objective

优化网页界面布局与视觉，让页面更整洁、层次更清楚（用户反馈“界面布局不太美观”）。**只改布局和样式，不改功能、提示词文本、存储格式和交互逻辑。**

需求来源：`REQUIREMENTS.md` V1.6。版本对照：`PLAN.md` V1.6。

## 基线（已实施，保持）

- V1.5 已完成（P1 职责收窄 + P6），代码 KEEP；Edge、Chrome selftest 65/65（`handoff/2026-11-24_implementation-report_3.md`，`review/2026-11-24_decision_5.md`）。V1.5 实施周期已关闭（V1.5.3）。
- V1.4.1 文档落盘规范、V1.4.5 P1 回填修复、V1.5 P6 全部保持。
- 附录 A 的 V1.5 模板定稿仍是 AC02/AC21/AC27/AC30 的基准，本轮不变。
- 2026-11-24 `app/index.html` 中共有 32 个元素 id（见 AC32），是本轮回归基线。

## 现状问题（依据 `app/index.html`、`app/style.css` 代码核对）

1. **顶部模型设置**：`.model-settings` 为 3 列 grid，“恢复默认模型名”按钮落到第 4 格，单独换行、左对齐，与输入框不对齐。
2. **设置区割裂**：`.doc-settings` 是标题区与工作区之间的独立条带，用 `margin: -4px 0 22px` 硬调位置；模型设置与文档设置分处两处，层次不清。
3. **标题重复**：编辑面板 eyebrow 为 `PROMPT BUILDER`，与页面 `h1` 重复。
4. **预览不换行**：`.preview` 为 `white-space: pre`，中文长行横向滚动，难以阅读。
5. **首屏信息不完整**：预览 `min-height: 500px`，加上头部和设置区，1440×900 首屏通常看不到“推荐下一步”；左右面板高度差大，右侧面板没有固定，滚动编辑区时预览和复制按钮会离开视线。
6. **角色提示不醒目**：`#role-hint` 为普通小字，与步骤说明区分不明显。

## Final Modification Scope

**代码**：仅 `app/style.css`、`app/index.html`。  
**不改**：`app/app.js`、`app/templates.js`、`app/selftest.html`、`doc/**`。  
**文档（P5）**：`docs/ACCEPTANCE.md` 结果表、带日期实施报告。

## Files to Modify

| 文件 | 修改内容 |
|---|---|
| `app/index.html` | 只做结构包装和静态文案：把模型设置与文档落盘设置放进同一个“全局设置”卡片；编辑面板 eyebrow 改为不与 h1 重复的文案；可增加仅用于布局的包装元素和 class。 |
| `app/style.css` | 按 Required Changes 调整布局、间距、预览换行、粘性预览、角色提示样式、响应式断点。 |
| `docs/ACCEPTANCE.md` | 按实测结果更新结果表。 |

## Files to Create

- `docs/handoff/<本地日期>_implementation-report.md`；同名已存在时依次加 `_2`、`_3`…（以实际目录为准，当前已有到 `_4`）。

## Required Changes

具体 CSS 数值、class 命名和局部写法由实施模型决定；以下为必须达成的结果。

1. **全局设置卡片**（index.html + css）：
   - 页面头部只保留标题区（eyebrow、h1、subtitle）。
   - 头部下方一个卡片同时包含：模型名称一行（3 个输入 + “恢复默认模型名”按钮，按钮与输入框底边对齐，位于同一行末尾）；文档落盘设置一行（开关 + 根目录输入 + 提示）。
   - 删除 `margin: -4px` 之类的负边距修补。
   - 保留原 `aria-label="模型名称设置"`、`aria-label="文档落盘规范设置"` 两个分组语义。
2. **去重标题**：编辑面板 eyebrow 不再使用 `PROMPT BUILDER`，默认改为 `INPUT`（待确认：是否统一改为中文）。
3. **预览换行**：`.preview` 自动换行（如 `pre-wrap` + `overflow-wrap`），不出现横向滚动条；`textarea.value` 不变，复制内容仍与生成文本逐字一致（AC09 不变）。
4. **首屏与粘性预览**：
   - 宽度 ≥ 1200px：右侧输出面板 `position: sticky`（贴顶留边距）；预览高度随视口自适应，保证 1440×900 首屏内同时可见“复制提示词”按钮、预览区和“选择模型回复中的状态”下拉框。
   - 宽度 951–1199px：保持两列，不强制 sticky。
5. **角色提示**：`#role-hint` 做成醒目的标签/徽章样式，与步骤说明区分；文字内容仍由 JS 写入，不改。
6. **统一视觉**：圆角、边框、间距统一为少量固定值；主色、聚焦样式和文字对比度不降低。**对比度（V1.6.1）**：最终 CSS 中实际使用的每组文字前景/背景对比度 ≥ 4.5:1；检查对象、方法和当前基线（16 组，最低 5.02）见 `review/2026-11-24_decision_6.md` 与 AC31(f)。placeholder、禁用控件文字和聚焦轮廓不在本项范围内。
7. **响应式**：保留 ≤950px 单列、≤560px 紧凑布局；375、768、1024、1440 宽度下页面无横向滚动条，设置卡片在窄屏下纵向堆叠。
8. **回写对话框**（`#write-dialog`）：样式可随整体统一，但结构和按钮不改。

## Must NOT Change

- `app/app.js`、`app/templates.js`、`app/selftest.html`、`doc/**`。
- `index.html` 中现有 32 个元素 id（名称、数量）及其元素类型；`hidden`、`role`、`aria-*`、`for`、`readonly`、`maxlength`、`autocomplete`、`spellcheck` 等属性；`<script>` 与 `<link>` 的引用和顺序。
- 所有按钮、标签、占位符、页脚等用户可见文案，**除** Required Changes 第 2 条的 eyebrow。
- 提示词内容、默认模型名、localStorage 结构与 STORAGE_KEY、状态推荐与回写逻辑。
- 不引入外部字体、CSS 框架、图片或网络资源（页面须离线可用）。
- 不 commit、不 push。

## Final Implementation Steps

1. P3 依据本文件和实际代码复核。
2. 首次编辑前记录 `git status`、`doc/**`、`app/app.js`、`app/templates.js`、`app/selftest.html` 的 SHA-256 基线，以及 `index.html` 的 id 列表（AC32）。
3. 改 `index.html` 结构 → 立即复核 id 列表与基线一致。
4. 改 `style.css`。
5. Edge、Chrome 运行 `selftest.html`，须仍为 65/65。
6. 用 Edge/Chrome headless `--screenshot --window-size=W,H` 生成 1440×900、1024×768、768×1024、375×812 截图（保存在仓库外的临时目录，不提交），检查 AC31；手动检查 AC09、AC33。
7. 复核第 2 步哈希；更新 `ACCEPTANCE.md` 结果表；写实施报告。

## Acceptance Criteria

已修订：AC20（V1.6 未授权文件清单）。新增：AC31–AC34（定义见 `ACCEPTANCE.md`）。其余 AC 定义和结果不变。

- **AC20**：V1.6 核验 `doc/**`、`app/app.js`、`app/templates.js`、`app/selftest.html` 的哈希不变。
- **AC31**：布局结果（设置卡片、按钮对齐、预览换行、首屏可见、无横向滚动）；(f) 文字对比度 ≥ 4.5:1（V1.6.1）。
- **AC32**：id 与关键属性不变。
- **AC33**：功能回归（步骤切换、复制、状态推荐、前往 P6、回写入口、刷新恢复）。
- **AC34**：用户确认美观度（主观项，仅用户确认后可记 PASS）。

## Verification Plan

- Edge、Chrome selftest：65/65（回归，AC14/AC25）。
- id 列表比对（AC32），可用 PowerShell 正则提取 `id="…"` 后与基线比较。
- 4 个尺寸截图（AC31），由实施模型说明截图路径与观察结果；无法查看图像时如实标 `NOT TESTED`，交给用户查看。
- 对比度（AC31(f)）：按 WCAG 2.x 公式对最终 CSS 颜色组合静态计算，在实施报告中列表；脚本不进仓库。
- 手动：AC09、AC33。
- SHA-256 复核（AC20）。
- 未执行的项标 `NOT TESTED`。

## Stop Conditions

- 需要改 `app.js`、`templates.js`、`selftest.html` 或任何 id 才能实现布局。
- 需要改提示词、交互逻辑或用户可见文案（第 2 条除外）。
- selftest 出现任何失败。
- 需要引入外部资源。

## 设计默认值与待确认

- 保留现有蓝色主题与浅灰背景（待确认：是否需要换配色或深色模式——本轮不做）。
- eyebrow 文案默认 `INPUT`；是否全站英文 eyebrow 改中文：待确认。
- 步骤选择仍为下拉框。改为步骤条/标签页需要改 `app.js`（`renderStepOptions`），不在本轮；如需要，后续用 P6 追加 Feature。
- 遗留（不在本轮）：`selftest.html` 断言名“P5 FAILED 是结束提示，不生成下一步”已过时，本轮不授权改 selftest。

## 当前进度（V1.6.1）

- V1.6 方案已批准，代码未修改。V1.6.1（`review/2026-11-24_decision_6.md`）为 AC31 补充对比度检查 (f)，范围不变。
- 下一步：P3 复核本 Handoff；READY 后进入 P5。
- V1.5 遗留手动验收（AC10、AC28(c)、AC29、AC01、AC03–AC09、AC11–AC13、AC22、AC24、AC26b、AC17）仍待执行，可与 V1.6 的 AC33 一并做。

## 附录 A：V1.5 模板定稿（逐字基准，本轮不变）

下列文本中的换行即 `\n`。`{{…}}` 为占位符。

### P1（替换原 P1）

```text
【{{analyst}}｜代码上下文整理】任务类型：{{taskType}}
需求：{{requirement}}
期望结果：{{expected}}
场景/约束：{{constraints}}

按 AGENTS.md 只读，不改代码；只整理事实，不判断根因、不提方案，供 {{planner}} 分析。
输出：项目用途与整体结构、与需求相关的文件/函数/调用链、现有数据流与配置、相关测试、可能受影响的模块；每项注明文件路径（尽量含行号），区分已核实事实与未读/不确定处。
结尾：ANALYSIS COMPLETE
```

### P2（仅第 1 行变化，其余与源文一致）

```text
【{{planner}}｜设计计划】基于 {{analyst}} 整理的代码上下文复核代码（不盲信），由你判定 Bug 根因或 Feature 接入点，不改代码。
```

### P6（新增）

```text
【{{planner}}｜实施后修正】类型：{{issueType}}
问题/新需求：{{issue}}
期望结果：{{expected}}

基于最新 Developer Handoff、实施报告和当前代码（含 {{implementer}} 本轮改动）直接定位，不回到 {{analyst}} 重做分析，不改代码。
输出：
1. Bug：根因（文件/函数/行号证据），是否由本轮改动引入；Feature：接入点及对现有方案的影响
2. 变更对照（旧→新），新增或修订的 AC（含回归）
3. Updated Developer Handoff（只改受影响部分）
缺少上下文时列出需查看的具体文件，不猜测。
结尾：PLAN APPROVED 或 NEED USER INPUT
```

- `{{issueType}}`：`实施后 Bug`（默认）或 `追加 Feature`；空或非法时用 `实施后 Bug`。
- `{{issue}}`：原样；必填。
- `{{expected}}`：去空白后为空时输出 `待确认`。

### AGENTS 规则块（替换第 2 行，并在其后插入 1 行；其余行不变）

```text
## 三模型协作规则
- 角色：{{analyst}} 只读整理代码上下文，不判断根因；{{planner}} 根因分析/设计/计划/AC/裁决，不改代码；{{implementer}} 复核计划后实施。
- 实施后仍有 Bug 或需追加 Feature：由 {{planner}} 用 P6 基于最新 Handoff 和代码直接处理，不回到 P1。
- 同一 Session 用 /model 切换，不 /new；以最新 Developer Handoff 为准，不恢复被否决的旧方案。
- 权限：编码细节（命名、局部写法、风格）由 {{implementer}} 决定；范围、架构、业务逻辑、接口、数据/配置格式、AC、PLC/设备安全由 {{planner}} 决定。{{implementer}} 可用代码证据质疑，不得自行改方案。
- 修改：最小改动；只改授权文件；不做无关重构、不升级依赖；Feature 扩展复用不重写，Bug 修根因不打补丁。
- Git：实施前 git status，不覆盖已有改动；未授权不 commit/push/建删分支。
- 验证：按步骤编译；warnings 与基线对比；未实际执行的 AC 只能标 NOT TESTED；无法自动验证的 AC 给出手动测试步骤。
- 状态词：ANALYSIS COMPLETE / PLAN APPROVED / NEED USER INPUT / PLAN STATUS: READY TO IMPLEMENT / PLAN STATUS: REVIEW REQUIRED / PLAN DECISION: PLAN UPDATED / PLAN DECISION: ORIGINAL PLAN CONFIRMED / IMPLEMENTATION STATUS: COMPLETED / FAILED / BLOCKED
```

### 角色占位符计数（P1、P2、P2b、P3、P4、P5、P6、AGENTS 合计，不含 DOC_RULES）

`analyst` 4、`planner` 9、`implementer` 7，共 20。

### STEPS

| key | title | role | when |
|---|---|---|---|
| P1 | `P1 · GPT-6 Luna · 代码上下文整理` | 分析模型 | `Bug 或 Feature 开始时：只读整理项目与相关代码事实，不判断根因、不修改代码。` |
| P6 | `P6 · Opus 5.5 · 实施后修正` | 计划模型 | `P5 完成或失败后仍有 Bug、或需追加 Feature 时：由计划模型基于现有 Handoff 和代码直接定位，不回到 P1。` |

其余 STEPS 不变。P6 插在 P5 之后、AGENTS 之前。

### DOC_RULES.steps.P6

```text
{{docsRoot}}/review/{{date}}_post-impl.md（根因/接入点定位）、{{docsRoot}}/REQUIREMENTS.md（追加本次问题/需求）、{{docsRoot}}/PLAN.md（追加变更对照与版本摘要）、{{docsRoot}}/handoff/HANDOFF_latest.md（整份替换为最新版）；AC 受影响时同步更新 {{docsRoot}}/ACCEPTANCE.md
```

P6 包含只读兜底行（与 P1/P2/P2b/P4 相同）；P3、P5 仍不含。AGENTS 文档附加行不变。

### STATUS_OPTIONS

```text
P5: COMPLETED → { terminal: "completed", next: "P6", model: "planner" }
    FAILED    → { terminal: "failed",    next: "P6", model: "planner" }
    BLOCKED   → P4 / planner（不变）
P6: PLAN APPROVED   → P3 / implementer
    NEED USER INPUT → P2b / planner
```

其余映射不变。

## 附录 B：此前裁决摘要（仍有效）

- **AC20 适用范围**（V1.5.1，`review/2026-11-24_decision_3.md`）：有代码变更的轮次只核验本 Handoff 未授权修改的文件。
- **PROJECT_CONTEXT/README**（V1.5.2–V1.5.3）：已于 2026-11-24 更新；本轮不改。
- **已完成 Handoff 不重复实施**（V1.5.3，`review/2026-11-24_decision_5.md`）：对已完成的 Handoff 再跑 P3/P5 时不实施；新代码工作须先经 P6 或 P2b 生成新 Handoff。V1.6 即为经 P2b 生成的新 Handoff。
- V1.5 完整 Required Changes 见 git 历史及 `handoff/2026-11-24_implementation-report_3.md`。
