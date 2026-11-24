# Updated Developer Handoff — V1.5（完整版本，唯一执行依据）

## Final Objective

1. **P1 职责收窄**：Luna 只读整理项目与相关代码的事实，不判断根因、不提方案；根因或接入点由 Opus 在 P2 判定，避免先入为主误导 Opus。
2. **新增 P6「实施后修正」**：P5 完成或失败后仍有 Bug、或需追加 Feature 时，由 Opus 基于最新 Handoff、实施报告和当前代码直接定位，输出 Updated Handoff → P3 → P5；不回到 P1 重来。

需求来源：`REQUIREMENTS.md` V1.5。版本对照：`PLAN.md` V1.5。

## 基线（已实施，保持）

- V1.4.1 文档落盘规范（DOC_RULES、`normalizeDocsRoot`、`getLocalDate`、开关与根目录控件）。
- V1.4.5 P1 任务类型回填修复：`getP1FieldValues`、`mergeState` 的 `taskType` 回退（`handoff/2026-11-24_implementation-report_2.md`，Edge selftest 52/52）。
- 待补验收（非本轮新增）：Chrome selftest（AC25）、AC22、AC24、AC26b 手动验收。

## Final Modification Scope

**代码**：仅 `app/templates.js`、`app/app.js`、`app/selftest.html`。不改 `app/index.html`（P6 字段由 JS 渲染）、`app/style.css`（除非布局确实需要）、`doc/**`。  
**文档（P5）**：`docs/ACCEPTANCE.md` 结果表、带日期实施报告。（`docs/PROJECT_CONTEXT.md`、`docs/README.md` 已于 2026-11-24 经用户授权完成，不属于后续待实施范围；V1.5.3。）

## Files to Modify

| 文件 | 修改内容 |
|---|---|
| `app/templates.js` | `STEPS.P1` 标题与说明；`STEPS` 在 P5 后、AGENTS 前新增 P6；`PROMPTS.P1`、`PROMPTS.P2` 首行按定稿；新增 `PROMPTS.P6`；`AGENTS_RULES` 角色行改写并新增 P6 行；`DOC_RULES.steps.P6`；`STATUS_OPTIONS.P5` 的 COMPLETED/FAILED 增加 `next: "P6", model: "planner"`（保留 `terminal`）；新增 `STATUS_OPTIONS.P6`。 |
| `app/app.js` | 见 Required Changes 第 3 条。 |
| `app/selftest.html` | 见 Required Changes 第 4 条。 |
| `docs/PROJECT_CONTEXT.md` | **已完成（2026-11-24，用户授权），不属于后续待实施范围。** 原内容：角色表与主要流程补 P6。 |
| `docs/README.md` | **已完成（2026-11-24，用户授权），不属于后续待实施范围。** 原内容：流程/恢复说明补 P6。 |
| `docs/ACCEPTANCE.md` | 按实测结果更新结果表。 |

## Files to Create

- `docs/handoff/<本地日期>_implementation-report.md`；同名已存在时依次加 `_2`、`_3`（以实际目录为准）。

## 模板定稿（逐字基准）

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

## Required Changes

1. **templates.js**：按上方定稿逐字修改；只替换指定内容，其余字符串不动。
2. **既有基线**：DOC_RULES 公共文本、`normalizeDocsRoot`、`getLocalDate`、AGENTS 回写安全逻辑、P1 回填修复（V1.4.5）全部保持。
3. **app.js**：
   1. `DEFAULT_STATE.forms.P6 = { issueType: "实施后 Bug", issue: "", expected: "" }`；`mergeState` 合并 `forms.P6`，`issueType` 不是两个合法值时回退 `实施后 Bug`。不改 STORAGE_KEY；旧存储缺 P6 时用默认值。
   2. 新增纯函数 `getP6FieldValues(form)` → `{ "issue-type": form.issueType, issue: form.issue, "issue-expected": form.expected }`，追加到 `PromptApp` 导出（只增不改）。DOM id 使用 `issue-type`、`issue`、`issue-expected`，避免与 P1 的 `expected` 冲突。
   3. `buildPrompt`：新增 P6 分支，按定稿替换并调用 `substituteRoles`；随后沿用现有 DOC_RULES/补充上下文拼接。
   4. `validateStep`：P6 的 `issue` 去空白为空时返回 `问题/新需求`。
   5. `init()` 内：P6 的 role 为 `planner`（`renderFields` 角色提示与 `roleForStep` 两处）；`renderFields` 新增 P6 分支（`issue-type` 下拉：实施后 Bug / 追加 Feature；`issue` 必填文本域；`issue-expected` 可选文本域），用 `setField(markup, getP6FieldValues(state.forms.P6))`；`currentForm` 返回 P6 表单；`stepFields` 输入事件处理 P6 三个 id → state key 映射；“清空当前步骤”支持 P6。
   6. `showRecommendation`：`terminal === "completed"` 时提示 `流程完成。按验收标准检查结果和证据；若仍有 Bug 或需追加 Feature，可前往 P6。`；`terminal === "failed"` 时提示 `实施失败。停止重复尝试，不要直接重试 P5，也不要回到 P1；可前往 P6 由 {计划模型名} 定位。`。两种情况在 `recommendation.next` 存在时显示 `前往 P6 · {计划模型名}` 按钮；不自动跳转。
4. **selftest.html**（不删除断言、不放宽判定）：
   1. 更新基准常量 `filledP1`、`sourceP2`、`sourceAgents` 为 V1.5 定稿，独立写出，不引用 `PromptTemplates`。
   2. 角色替换断言的步骤列表加入 P6（给出合法 P6 表单），计数改为 4/9/7。
   3. AC21 的 `docSteps` 加入 P6（含兜底行）。
   4. 新增 AC27（P1 定稿、无“根因候选/接入点”）、AC28（P6 定稿与 `待确认`、`validateStep` 缺项、`getP6FieldValues` 映射）、AC29（P5 COMPLETED/FAILED 的 `terminal`+`next`、P6 两条路由）、AC30（AGENTS 开关关/开、P6 落盘行）断言。
   5. P2b、P3、P4、P5 的源文基准及其余断言保持不变。

## Must NOT Change

- `doc/**` 源文件（保留为 V1.2 历史参考）。
- P2b、P3、P4、P5 正文；P2 第 2 行起正文。
- DOC_RULES 公共文本、P1–P5 写入行、AGENTS 文档附加行。
- P5 BLOCKED 及其他既有路由；P5 COMPLETED/FAILED 的 `terminal` 值。
- 默认模型名；P1 表单字段、默认 `Bug`、`Bug/Feature` 选项及 V1.4.5 回填修复；localStorage 已有字段与 STORAGE_KEY。
- AGENTS 回写的唯一章节、确认、权限失败和降级规则。
- `setField` 函数体；`PromptApp` 现有导出成员。
- 不 commit、不 push。

## Final Implementation Steps

1. P3 依据本文件和实际代码复核；无待落盘文件需补写。
2. 实施前记录 `git status`，以及 `doc/`、`app/index.html`、`app/style.css` 的 SHA-256 基线（**必须在首次编辑前完成**；上轮遗漏导致 AC20 无法验证）。
3. 改 `templates.js` → Edge 运行 selftest，确认只有预期的基准断言失败（P1/P2/AGENTS/计数），无脚本错误。
4. 改 `app.js` → 改 `selftest.html` → Edge、Chrome 运行 selftest，全部 PASS。
5. 手动验收 AC28(c)、AC29 按钮、AC10 修订提示文字；补做此前遗留的 AC26b、AC22、AC24（若执行）。
6. 更新 `ACCEPTANCE.md` 结果表；写实施报告；复核第 2 步哈希。（`PROJECT_CONTEXT.md`、`README.md` 已完成，V1.5.3。）

> 以上步骤 1–6 已执行完毕（见当前进度）；不再重复执行。

## Acceptance Criteria

已修订：AC02、AC10、AC21、AC25（定义见 `ACCEPTANCE.md` 各条“V1.5 修订”）。新增：AC27–AC30（定义见 `ACCEPTANCE.md`）。其余 AC 定义不变；AC26a/AC26b 继续有效。

要点：
- **AC02**：P2b/P3/P4/P5 对照 `doc/` 源文；P1/P2/AGENTS/P6 对照本 Handoff 定稿；基准独立写在 selftest。
- **AC10/AC29**：P5 COMPLETED/FAILED 仍终止，提供“前往 P6”按钮；P6 → P3 或 P2b。
- **AC21/AC30**：落盘段覆盖 P6；P6 含兜底行。
- **AC25**：仅允许更新指定基准与计数；Edge、Chrome 全部 PASS。
- **AC27**：P1 不含根因候选/接入点要求。
- **AC28**：P6 定稿、`待确认` 回退、必填校验、非法类型回退。

## Verification Plan

- Edge、Chrome 运行 `app/selftest.html`，记录通过/失败数。本机此前未找到 Chrome；若仍不可用，AC25 标 `NOT TESTED`，并说明可通过 `.gitlab/duo/agent-config.yml` 提供。
- 手动：P5 COMPLETED/FAILED 的提示与按钮 → 切到 P6；P6 表单缺项提示；localStorage 写入非法 `forms.P6.issueType`（且 `currentStep: "P6"`）后刷新。
- SHA-256 复核 `doc/`、`index.html`、`style.css` 未变。
- 未执行的项标 `NOT TESTED`。

## Stop Conditions

- 需要修改 P2b/P3/P4/P5 正文、`doc/**` 或 BLOCKED 等既有路由。
- 改动后除预期基准外，原有断言失败。
- 需要修改 `index.html` 才能渲染 P6（应由 JS 渲染；若不可行，停止并报告）。
- 需改本 Handoff 未授权的文件。

## 设计默认值与待确认

- **P5 FAILED 也提供前往 P6**（原 AC10：“不生成下一步”）。理由：失败后应由 Opus 定位，而不是 Sonnet 重试或回到 P1。若用户希望 FAILED 仍只提示停止，删除 FAILED 的 `next`/`model` 即可，其余不变。
- **P6 表单**：类型 + 问题/新需求（必填）+ 期望结果（可选）。
- STEPS 标题中的“GPT-6 Luna / Opus 5.5 / Sonnet 5.5”为既有静态文本，本轮不改（与可编辑模型名不联动，属历史设计）。

## V1.5.1 / V1.5.2 裁决补充

- 依据：`review/2026-11-24_decision_3.md`（V1.5.1）、`review/2026-11-24_decision_4.md`（V1.5.2）。
- **AC20**：有代码变更的轮次只核验本 Handoff 未授权修改的文件（`doc/**`、`app/index.html`、`app/style.css`）；定义见 `ACCEPTANCE.md` AC20“V1.5.1 修订”。
- **`docs/PROJECT_CONTEXT.md`、`docs/README.md`**：从 Files to Modify 与步骤 6 移出；2026-11-24 经用户授权，已只改受影响行（已完成）。
- **非阻塞遗留**：`app/selftest.html` 断言名“P5 FAILED 是结束提示，不生成下一步”已过时；下次授权改动 selftest 时只改名称，不改判定。

## V1.5.3 裁决补充

- 依据：`review/2026-11-24_plan-review_5.md`（P3 REVIEW REQUIRED）、`review/2026-11-24_decision_5.md`。
- 文档范围冲突已消除：上文 Scope、Files to Modify、步骤 6 已标注 PROJECT_CONTEXT/README 已完成。
- **V1.5 实施周期已关闭。** 对本 Handoff 再运行 P3 时，不输出 `PLAN STATUS: READY TO IMPLEMENT`；应说明已完成并指向手动验收。新的代码工作须先经 P6（实施后 Bug / 追加 Feature）或 P2b 生成新 Handoff。
- 是否把上述规则固化到 P3 模板：待确认（属新 Feature，如需走 P6）。

## 当前进度（V1.5.3）

- V1.5 代码已实施（`app/templates.js`、`app/app.js`、`app/selftest.html`），裁决 KEEP；结果为 COMPLETED（含手动验收遗留）。无待实施代码范围。
- 证据：`handoff/2026-11-24_implementation-report_3.md`；2026-11-24 decision_4、decision_5 两次复跑 Edge、Chrome selftest 均为 65/65；`doc/`、`index.html`、`style.css` 哈希与基线一致。
- 下一步：不需要再走 P3/P5。用户手动验收 AC10、AC28(c)、AC29 及遗留的 AC01、AC03–AC09、AC11–AC13、AC22、AC24、AC26b；AC17 待独立新会话验证（PROJECT_CONTEXT/README 已同步）。
