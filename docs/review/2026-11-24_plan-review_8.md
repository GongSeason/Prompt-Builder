# 2026-11-24 P3 实施前复核记录（V1.6.1）

## PLAN STATUS: READY TO IMPLEMENT

本次只读复核；未改代码、未修改方案。上一阶段没有待落盘文件。

## 实际代码核对

- **HTML 结构与 JS 调用：** `index.html` 中模型设置和文档设置是两个独立父节点；`app.js` 通过固定 id（`model-analyst/planner/implementer`、`reset-models`、`doc-rules-toggle`、`docs-root` 等）取元素并绑定事件，没有依赖这些控件必须处于 `.page-header` 或 `.doc-settings` 的特定父节点。只移动/包装现有节点不会改变业务调用。当前 32 个 id 与 AC32 基线一致。
- **布局选择器：** `style.css` 的 `.page-header`、`.model-settings`、`.doc-settings`、`.workspace`、`.output-panel`、`.preview`、`.role-hint` 等可通过新 wrapper 和响应式 CSS 实现 Handoff 要求；无需改 JS、自测、提示词、存储格式或引入依赖。≥1200px 粘性预览、951–1199px 双列、≤950px 单列的断点安排没有互相冲突。
- **范围：** 仅 `app/index.html` 和 `app/style.css`；保留现有 32 个 id、元素类型、关键属性及 script/link 顺序是可执行的结构约束。当前 `git status --short app` 无代码改动。
- **selftest：** Edge、Chrome headless 实际运行 `app/selftest.html`，均为 **65 项通过、0 项失败**。AC31–AC34 是布局截图/结构属性/手动回归/用户主观确认；Handoff 给出了浏览器尺寸、截图、id 比对和手动步骤，能区分客观 PASS 与需用户确认的 AC34。
- **静态页面验证：** 项目无打包或编译工具链；按 Handoff 做浏览器测试和截图即可，不应虚报构建结果。

## AC31(f) 对比度可测性核对

Handoff/AC31(f) 当前定义为对最终 CSS 中每组实际文字前景/背景组合计算 WCAG 2.x 对比度，并在报告列表；这是可判定的量化标准。decision_6 的 16 组记录覆盖主要颜色组合。我补核了此前列表未单列的 `.diff-box`：`style.css` 的文字继承 `#182230`，背景为 `#f8fafc`，对比度 **15.32:1**。AC31(f) 的“每组实际组合”要求已覆盖此组合，故无需修改 AC 或 Handoff；实施时仍须把它纳入最终组合清单，并一并核验所有未在基线表列出的实际组合。

## 实施步骤与 AC

1. 修改 `index.html`：仅包装/移动模型与文档设置节点，将编辑区 eyebrow 改为 `INPUT`；立即验证 id 集合 32 个、每个 id 元素类型、相关属性、script/link 顺序不变（AC32）。
2. 修改 `style.css`：设置卡片/模型按钮对齐、预览换行、≥1200px sticky 与视口高度、角色提示、统一视觉和响应式断点；不改功能代码。
3. Edge、Chrome 运行 selftest，均须 65/65（AC14/AC25）；生成四个要求尺寸截图并检查布局、首屏、横向溢出（AC31）。
4. 计算最终所有实际文字/背景颜色组合（含 `.diff-box`、新增/改动组合），每组 ≥4.5:1，报告中列出数值（AC31(f)）；手动做 AC09/AC33；AC34 等用户确认。
5. 复核未授权文件哈希（AC20），只更新 AC 结果表和新增实施报告。

**状态：** 未发现设计级冲突；可输出 `PLAN STATUS: READY TO IMPLEMENT`。AC34 的美观度是后续用户验收，并非进入实施的前置阻塞。
