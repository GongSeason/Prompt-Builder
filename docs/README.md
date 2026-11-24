# Agent Prompt Generator 项目记录

## 目录说明

- `doc/`：原始提示词、工作流及规则资料，只读，不在本轮修改。
- `app/`：本地提示词生成网页（5 个文件）。只在 Handoff 授权时修改；V1.5 修改了 `templates.js`、`app.js`、`selftest.html`。
- `docs/`：项目需求、方案、验收结果和交接记录；后续以这里的最新有效文档为准。

## 当前阶段

当前方案为 V1.5（P1 只整理代码事实；新增 P6 实施后修正），最新裁决为 V1.5.2。代码已实施，结果为 COMPLETED（含手动验收遗留）。自动自测在 Edge、Chrome 均为 65/65；仍等待手动验收。详细结果见 `ACCEPTANCE.md`、`handoff/2026-11-24_implementation-report_3.md` 和 `review/2026-11-24_decision_4.md`。

## 下一步

在 Edge 和 Chrome 中手动检查：

- AC01：从项目目录打开 `PRJ_00_AgentPrompt/app/index.html`（本文件所在目录下为 `../app/index.html`），检查页面显示和开发者工具 Console。
- AC10、AC29：P5 选择 COMPLETED/FAILED，核对提示文字和“前往 P6”按钮，点击后切到 P6。
- AC28(c)：localStorage 设 `currentStep: "P6"` 和非法 `forms.P6.issueType`，刷新后控件与预览回退“实施后 Bug”。
- AC26b、AC22：按 `ACCEPTANCE.md` 测刷新恢复。
- AC03–AC09、AC11–AC13、AC24：按 `ACCEPTANCE.md` 的 Given/When/Then 操作输入、复制、记忆及回写流程。回写只能使用临时 AGENTS.md。
- AC15：核对本轮文件范围。注意实施前工作区已有删除项和未跟踪目录，不能把它们误认为本轮产生。

完成后更新 `ACCEPTANCE.md` 的结果和证据；不得把未实际测试的项目写成 PASS。

## 待验收项

当前为 `NOT TESTED`：AC01、AC03–AC13、AC15、AC17、AC22、AC24、AC26b、AC28、AC29。其余 AC 的 PASS 证据见 `ACCEPTANCE.md`。AC17 的“仅提供两个文件即可恢复上下文”尚未通过独立新会话验证。

## 恢复步骤

上下文丢失时按以下顺序恢复：

1. 先读本文件，确认当前阶段、未测项和下一步。
2. 再读 `handoff/HANDOFF_latest.md`，它是最新执行基准。
3. 核对模板时：P2b、P3、P4、P5 只读 `../doc/Duo 三模型精简提示词.md（含 AGENTS.md 规则）.md`；P1、P2、AGENTS 规则块、P6 以 `handoff/HANDOFF_latest.md` 定稿为准。不得把旧方案恢复为当前方案。
4. 继续实施前先用 P3 对照实际代码复核。若发现计划级冲突或阻塞，停止并用 P4 请计划模型裁决；不要直接跳过复核。
5. 实施后仍有 Bug 或需追加 Feature：用 P6 由计划模型基于最新 Handoff 和代码直接定位，然后走 P3 → P5；不回到 P1。
6. 若只需了解之前裁决或改动结果，查看 `review/` 和 `handoff/` 中最新日期、最大序号的文件（当前为 `review/2026-11-24_decision_4.md`、`handoff/2026-11-24_implementation-report_3.md`）。

## 维护规则

- 生成提示词默认附带文档落盘规范。规范文件按阶段要求原位更新；带日期的归档遇同名时追加 `_2`、`_3`，不覆盖旧归档。
- 只读/Plan 模式不能写文件时，模型在回复末尾输出“待落盘文件”（路径 + 完整内容）；实施模型按 `handoff/HANDOFF_latest.md` 写入。
- P2 计划批准、P2b 需求调整或 P4 裁决后：计划模型只更新受影响部分，并同步更新 `PLAN.md` 与 `handoff/HANDOFF_latest.md`；若 AC 受影响，也更新 `ACCEPTANCE.md`。保留未受影响的内容和版本记录。
- P5 实施结束后：实施模型新增一份带日期的实施报告，并更新 `ACCEPTANCE.md` 结果表。只有实际执行并有证据的项目可记为 PASS。
- 发生版本变更时：在 `PLAN.md` 追加变化摘要；过时方案须明确标注“已作废”，不能混入当前有效规则。
- 不改 `doc/` 或 `app/`，除非后续计划明确授权。

## 本地运行

在 Edge 或 Chrome 中打开 `../app/index.html`（相对于本文件）。页面不调用在线 AI 服务。提示词输入保存在当前浏览器本地；首次使用和回写前请先查看页面提示，并使用临时文件验证回写。
