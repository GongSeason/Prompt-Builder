# 2026-11-24 P3 实施前复核记录（V1.4.4）

## PLAN STATUS: REVIEW REQUIRED

## 复核范围

读取 `docs/handoff/HANDOFF_latest.md` V1.4.4，并对照 `app/app.js`、`app/selftest.html`、`app/index.html`。本轮未修改代码，也未修改规范文件。上一阶段没有输出“待落盘文件”；V1.4.4 文档已存在于 `PRJ_00_AgentPrompt/docs/`。

## 设计级问题

### Issue 1：AC26b 前置条件未确保 P1 页面实际显示

**原计划：** AC26b 只要求 localStorage 中 `forms.P1.taskType` 为 Feature / 不存在 / 非法值，随后刷新 `app/index.html` 并检查 P1 下拉框和预览。

**代码证据：** `app/app.js` 的 `DEFAULT_STATE.currentStep` 为 `P1`，但 `mergeState` 会优先恢复 `saved.currentStep`；`renderFields()` 按 `state.currentStep` 选择界面。`stepSelect` 的 change 事件也会持久化当前步骤。因此已有存储若 `currentStep` 是 P2/P3 等，刷新后不会显示 P1 字段或 P1 预览。

**冲突与影响：** AC26b 的 Given 未约束 `currentStep`。按当前产品行为，照字面执行测试时可能无法检查要求中的 P1 控件和预览，结果不确定，AC 不完全可复现。

**需 Claude Opus5.5 决定什么：** AC26b 应否要求测试数据包含 `currentStep: "P1"`，或在 When 中先切换到 P1 再刷新/检查？请确定符合验收意图的唯一测试前置条件。

### Issue 2：文件清单及实施步骤超出本次 P1 Bug 的最小变更范围

**原计划：** Handoff 的 Files to Modify 列出 `app/templates.js`、`app/index.html`、`app/style.css`、`docs/README.md`、`docs/PLAN.md`、`docs/REQUIREMENTS.md` 等 V1.4.1 落盘功能文件；Final Implementation Steps 第 3、4 步又要求按序修改模板、页面、README、PLAN、ACCEPTANCE、REQUIREMENTS。与此同时，V1.4.4 当前进度明确 V1.4.1 落盘代码已实现，且 Required Changes 第 7 条把 P1 修复限定为 `app.js` 的三处变更及 `selftest.html` 测试。

**代码证据：** `app/templates.js` 已有 DOC_RULES；`app/index.html` 已有落盘开关及根目录输入；`app/app.js` 已有 V1.4.1 的 `buildDocRules`、`normalizeDocsRoot`、设置控件及持久化逻辑。当前 P1 Bug 的实际链路是 `setField` 以 state key 查 DOM id、P1 分支传入 `state.forms.P1`，而输入事件才把 `task-type` 映射成 `taskType`。拟修复的 `getP1FieldValues`、`mergeState` 回退均尚未存在。

**冲突与影响：** 对 V1.4.1 已实现部分再次实施或更新不相关 README/模板/页面，会扩大本次只修复 P1 回填问题的变更范围，也与“只更新受影响部分”不一致。Handoff 未明确这些条目是已完成基线、仅作保留核对，还是本次仍必须重做/更新，实施者可能产生额外改动。

**需 Claude Opus5.5 决定什么：** 本轮 P5 是否将实际代码改动收窄为 `app/app.js` 与 `app/selftest.html` 的 V1.4.4 P1 修复，并只更新受影响的 AC/报告文档；其余 V1.4.1 文件作为既有基线保持不变？若有未完成的 V1.4.1 交付确需本轮处理，请明确具体文件、要求和授权范围。

## 其余核对结果

- 根因与当前代码相符：`app/app.js` 中 `setField(markup, values)` 依 `values` key 调用 `getElementById(id)`；P1 传 `state.forms.P1`，其键为 `taskType`，控件 id 为 `task-type`。P1 输入事件存在对应映射。需求、期望、约束键与控件 id 相符。
- `setField`、`renderFields`、`mergeState` 均位于 IIFE 内；其中 `setField`/`renderFields`/`mergeState` 在 `init()` 闭包范围内，selftest 不能直接调用它们。新增外层纯函数并追加到 `PromptApp` 导出后，可由 selftest 访问，方案技术上可行。
- `buildPrompt("P1", ...)` 会依据表单 state 生成预览；因此把同一 state 通过映射回填 DOM，能覆盖本次控件/预览字段名称不一致的根因。对 `taskType` 仅允许 `Bug`/`Feature` 的回退也可在 `mergeState` 中实现，不需改变 localStorage schema。
- AC26a 的纯函数映射测试可在现有 selftest 脚本中调用新增导出；AC26b 需真实页面和 localStorage，按 Edge、Chrome 手动验证是适当的独立验收方式，但应先解决 Issue 1 的前置条件歧义。
- 当前工作区在复核开始前已有 `index.js`、`package.json` 删除，以及未跟踪项目目录；未触碰这些既有状态。

## 下一步

暂停实施，不改代码。请 Claude Opus5.5 对 Issue 1 的 AC26b 前置条件和 Issue 2 的文件/范围边界作出裁决，并按裁决更新完整 Handoff；随后再进行实施前复核。
