# 2026-11-24 P3 实施前复核记录（V1.5）

## PLAN STATUS: READY TO IMPLEMENT

## 复核范围

读取 `docs/handoff/HANDOFF_latest.md` V1.5、`app/templates.js`、`app/app.js`、`app/selftest.html`、`docs/PROJECT_CONTEXT.md`、`docs/README.md`、`docs/ACCEPTANCE.md`。上一阶段没有待落盘文件。本轮只读核对，未修改代码。

## 实际代码核对

- **P1/P2 现有模板：** `app/templates.js` 的 `PROMPTS.P1` 目前要求输出“Bug 根因候选或 Feature 接入点”；`PROMPTS.P2` 当前首行要求“基于 Luna 分析复核代码”。V1.5 修改目标准确对应这两处，且 Handoff 明确 P2 首行以外正文不变。
- **P6 插入点和调用链：** `STEPS` 由 `app.js` 的 `renderStepOptions()` 遍历并生成步骤选择项；`PROMPTS` 由 `buildPrompt()` 读取；`DOC_RULES.steps` 经 `buildDocRules()` 生成落盘文本；`STATUS_OPTIONS` 由 `renderStatusOptions()` 填充并由 `getRecommendation()` 查找。新增 P6 可沿现有机制接入，无需改 `index.html`。
- **表单状态和 DOM：** `DEFAULT_STATE.forms` 目前有 P1、P2b；`mergeState()` 逐项合并；`renderFields()`、`currentForm()`、`stepFields` 的 input 事件、清空按钮各有对应分支。Handoff 第 3 条逐一指定 P6 的默认表单、非法值回退、映射、渲染、取值、输入更新和清空行为；P6 的 `issue-expected` id 避免与 P1 的 `expected` 字段冲突。
- **提示词和校验：** `buildPrompt()` 已有 P1/P2b 专用分支，其余步骤读 `T.PROMPTS[step]`；P6 有专门动态字段与 `待确认` 回退，所以新增分支是必要且明确的。`validateStep()` 当前只覆盖 P1/P2b，P6 必填校验目标明确。
- **状态按钮：** 当前 `showRecommendation()` 在 COMPLETED/FAILED 分支只显示终止提示，不显示 `recommendation.next` 按钮；Handoff 明确要求保留两种 terminal 值、补充 P6 next/model，并仅在相应提示分支显示手动前往按钮。`goNext` 点击处理使用 `getRecommendation()` 的 `next` 值，能复用至 P6。P5 FAILED → P6 是用户已批准 V1.5 中明确列出的设计默认值。
- **AGENTS 和占位符：** 当前 AGENTS 角色规则是单个模板常量；定稿要求改角色行并插入 P6 行，其余规则不动。按 Handoff 所列 P1/P2/P2b/P3/P4/P5/P6/AGENTS 文本，20 个角色占位符计数 4/9/7 与计划一致。
- **AC 可测性：** AC27 可用独立 P1 基准字符串断言；AC28 可测 P6 文本、字段映射、`待确认` 和 validateStep，并要求对非法保存类型手动验收；AC29 可测 P5/P6 推荐映射并手动验收按钮；AC30 可测 AGENTS 开关与 P6 DOC_RULES。AC02、AC21、AC25 已明确更新基准/步骤/计数约束，且要求保留其他断言。AC26a/AC26b 仍保留。
- **文档影响范围：** `PROJECT_CONTEXT.md` 明确记载旧职责及旧流程，应按 Handoff 更新；`README.md` 恢复步骤要求继续走 P3/P4，适合只补受影响的 P6 流程行。其余受影响 AC 与基准变化已列入 `ACCEPTANCE.md`。
- **范围：** Handoff 将代码限定在 `templates.js`、`app.js`、`selftest.html`；明确不改 `index.html`、`doc/**`，其他既有 DOC_RULES/回写逻辑保留。除布局实际需要外不改 CSS。执行步骤要求首次编辑前记哈希，可避免 V1.4.5 的基线遗漏。

## 实施步骤与 AC

1. 首次编辑前记录 `git status` 与 Handoff 指定的 `doc/`、`index.html`、`style.css` SHA-256 基线。
2. 修改 `templates.js` 定稿（P1/P2、P6、AGENTS、STEPS、DOC_RULES、状态选项），先运行 Edge selftest 检查预期基准差异且不得有脚本错误。
3. 按 Handoff 修改 `app.js` 接入 P6 状态、构建、校验、UI、输入、清空和推荐；再更新 selftest 的独立基准、角色计数及 AC27–AC30 断言。
4. 在 Edge/Chrome 运行完整 selftest；Chrome 若仍不可用，AC25 如实标 `NOT TESTED`。
5. 手动验收 AC28 非法类型回退、AC29 按钮、AC10 修订后的提示；按可用性补验 AC26b、AC22、AC24。
6. 只更新 PROJECT_CONTEXT/README 的受影响说明、ACCEPTANCE 结果和实施报告；核对哈希与范围。

无需更改 Handoff 方案；新增函数/状态路径在当前代码中尚不存在是本轮待实施内容，不属于计划与代码冲突。

本轮未运行测试，因为本阶段为不改代码的 P3 复核；selftest 和手动 AC 应在 P5 实际执行。
