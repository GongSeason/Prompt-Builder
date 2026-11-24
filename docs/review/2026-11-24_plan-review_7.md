# 2026-11-24 P3 实施前复核记录（V1.6）

## PLAN STATUS: REVIEW REQUIRED

按用户要求复核最新 Handoff；本轮只读，未改代码、未自行修改方案。上一阶段没有待落盘文件。

## 复核范围与验证

读取 `docs/handoff/HANDOFF_latest.md` V1.6、`docs/REQUIREMENTS.md` V1.6、`docs/PLAN.md`、`docs/ACCEPTANCE.md` AC31–AC34，以及 `app/index.html`、`app/style.css`、`app/app.js`、`app/templates.js`、`app/selftest.html`。

- Edge、Chrome headless 实际运行 `app/selftest.html`：均 **65 项通过、0 项失败**。
- 实际提取 `app/index.html` 的 id：32 个，与 Handoff AC32 所列集合一致。
- `git status --short` 中当前只有之前的 `docs/ACCEPTANCE.md`、`docs/PLAN.md`、`docs/REQUIREMENTS.md`、`docs/handoff/HANDOFF_latest.md` 修改；本轮不改这些文件。本轮仅新增此复核记录。

## 已核对且无冲突的实现条件

- `.model-settings`、`.doc-settings` 目前是分开的 HTML 区块；只移动/包装结构并在 CSS 调整父子布局，可合并成全局设置卡片，不依赖 `app.js`。`app.js` 通过固定 id 取得模型输入、文档开关和根目录控件，移动父级不破坏查询；遵守 32 个 id 和属性不变即可守住接口。
- `style.css` 当前明确包含 Handoff 所列问题：模型区三列但含 3 个 label + reset 按钮，文档区独立且 `margin: -4px`，`.preview` 使用 `white-space: pre`、`min-height: 500px`，角色提示为普通小字。CSS/结构可承载所要求的调整，不需改 JS 或引入依赖。
- 1440×900、1024×768、768×1024、375×812 可按 headless 截图与浏览器视口滚动宽度检查；AC32 可用已有 id 提取方式比对；AC33 明确为手动功能回归；AC34 留给用户确认。V1.5 selftest 是现有逻辑基线，本次两浏览器实测通过。
- 计划范围仅 `app/index.html`、`app/style.css`；不改提示词、localStorage、交互逻辑、`app.js`、`templates.js`、`selftest.html`、`doc/**`。当前工作区这些 app 文件均无未提交修改。

## 设计级问题（需 Opus 决定）

### AC31 未覆盖 Handoff 明确的文字对比度要求

- **原计划：** Handoff V1.6 Required Changes 第 6 条要求正文与说明文字对白底对比度至少 `4.5:1`，且主色、聚焦样式和对比度不得降低。
- **代码/AC 证据：** `app/style.css` 当前颜色通过 `--muted`、`--blue`、`--blue-dark` 等变量控制；Handoff 第 6 条提出定量阈值。但 `ACCEPTANCE.md` AC31(a)–(e) 只验收设置布局、按钮对齐、预览换行、首屏可见、响应式及 eyebrow；没有对文字/背景颜色指定对比度测试或采样对象。AC34 是用户主观确认美观度，不等价于 4.5:1 可访问性检查。
- **冲突与影响：** 实施模型即使按截图完成 AC31，也无法据 AC 判定 Handoff 的 4.5:1 强制要求是否满足；若结果表把 AC31 记 PASS，可能漏验该约束。此处是 AC 可测性缺口，不代表现有颜色已被证明不合格。
- **需 Claude Opus5.5 决定什么：** 是否在 AC31 增加明确可复现的对比度检查（列出需要检查的文本类别、各自背景和判定值 `≥4.5:1`），或将 Handoff 的该定量要求移出本轮/改为适当标准。P3 不自行改 Handoff 或 AC。

## 其余实施概要（供裁决后使用）

1. 编辑 `index.html`，仅包装现有设置区并将编辑 eyebrow 改为 `INPUT`；随即比对 32 个 id、元素类型、关键属性及脚本/样式引用。
2. 编辑 `style.css` 完成全局设置卡片、按钮对齐、预览换行、≥1200px sticky、角色提示和响应式布局；不改 JS。
3. Edge/Chrome selftest 仍须 65/65；按 4 个视口截图检查 AC31，手动做 AC09/AC33；AC34 等待用户确认。
4. 复核未授权文件哈希并仅按实测更新报告/AC。

因 AC31 覆盖不完整，现阶段不能输出 READY TO IMPLEMENT；待 Opus 决定后继续 P3。
