# 2026-11-24 P3 实施前复核记录（V1.4.5）

## PLAN STATUS: READY TO IMPLEMENT

## 复核范围

读取最新 `docs/handoff/HANDOFF_latest.md` V1.4.5、裁决 `docs/review/2026-11-24_decision_2.md`、`app/app.js`、`app/selftest.html`、`app/index.html` 和 AC21–AC26 的验收定义。上一阶段没有待落盘文件。本轮只读核对，未修改代码。

## 代码与计划核对

- **根因仍与代码一致：** `app/app.js` 中 `setField(markup, values)` 用对象 key 调用 `document.getElementById(id)`；P1 当前传 `state.forms.P1`，字段为 `taskType`，但下拉框 id 为 `task-type`。P1 输入事件现有 `task-type` → `taskType` 映射；其余三个字段的 key/id 相同。
- **计划函数及调用点定位合理：** `mergeState` 位于 IIFE 内、`init` 外；可在合并后验证 `state.forms.P1.taskType` 并回退到 `Bug`。拟新增 `getP1FieldValues(form)` 可放在同一 IIFE 的外层，并追加到 `Object.freeze` 的 API 对象中；`renderFields` 位于 `init` 内，能将该纯函数返回值传给 `setField`。不需要修改 `setField`、输入事件或 localStorage schema。
- **selftest API 可达：** `app/selftest.html` 以 defer 顺序加载 `templates.js`、`app.js`，然后在 DOMContentLoaded 回调中调用 `PromptApp`。因此将纯映射函数追加为 API 后，AC26a 可在现有测试页直接断言；AC26b 的 `mergeState` 效果不能由纯函数断言替代，按 Handoff 做真实页面手动检查是合理的。
- **依赖与范围：** 本次修改仅 `app/app.js` 和 `app/selftest.html`；V1.4.1 落盘逻辑在 `app.js` 内需保留，`templates.js`、`index.html`、`style.css`、`doc/**` 及其他文件均为不改基线。Handoff 与 `2026-11-24_decision_2.md` 的收窄范围一致。
- **AC26b 前置条件已修正：** Given 明确将存储对象 `currentStep` 设为 `P1`；代码会恢复保存步骤，P1 才会呈现任务类型控件和 P1 预览。该测试设置不改变 AC08 所保护的恢复上次步骤行为。
- **AC 可测性：** AC26a 覆盖 Feature/Bug 的映射和纯函数导出，可在 selftest 验证；AC26b 覆盖 Feature、缺值、非法值的页面恢复，以及切换/刷新后同步，需在 Edge、Chrome 手动执行。AC21–AC25 的既有逻辑可用现有自测回归，AC22/AC24 的 UI/文件选择器部分仍按 `NOT TESTED`，除非实际执行。
- **报告命名：** `2026-11-24_implementation-report.md` 与 `_2` 均已存在，P5 报告应使用 `_3`，不覆盖旧档。

## 实施步骤与 AC

1. P5 开始先记录工作区状态及 Handoff 指定基线文件的 SHA-256。
2. 仅在 `app/app.js` 新增并导出 `getP1FieldValues`、将其用于 P1 回填、在 `mergeState` 对非法 taskType 回退 `Bug`；只在 `app/selftest.html` 增加 AC26a 断言。保留默认 Bug、Bug/Feature 选项、现有输入事件、模板和数据 schema。
3. 在 Edge、Chrome 运行 selftest，核对现有 50 项与新增 AC26a 断言全部通过（AC14、AC25、AC26a）。
4. 按 AC26b 将 localStorage 设为 `currentStep: "P1"`，分别验证 Feature、taskType 缺失、非法值；检查控件、预览、切换及刷新同步。
5. 只依据实际证据更新 `docs/ACCEPTANCE.md` 和新增带日期实施报告；未执行的 AC 保持 `NOT TESTED`。检查基线文件哈希未变。

本轮未运行测试：本任务为不改代码的实施前复核；selftest 与 AC26b 应由 P5 实施/验收阶段实际运行，不能在本报告中预先记为 PASS。
