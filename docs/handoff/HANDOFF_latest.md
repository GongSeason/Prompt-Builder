# Updated Developer Handoff — V1.4.1（完整版本，唯一执行依据）

## Final Objective / Root Cause

在现有提示词生成器中加入可开关的“文档落盘规范”，使生成的各阶段提示词明确说明应在目标项目的什么路径生成、更新或归档哪些文档，并为只读/Plan 模式提供待落盘文件兜底。这是新增功能，没有 Bug 根因。

## Final Modification Scope

**代码修改**：仅 `PRJ_00_AgentPrompt/app/` 下已授权文件。  
**文档修改**：仅本 Handoff 的 Docs to Update、Files to Create 和本地已批准裁决清单中的 `docs/` 文件。  
不修改 `doc/**` 或仓库其他无关文件。

## Files to Modify

| 文件 | 修改内容 |
|---|---|
| `app/templates.js` | 新增 `DOC_RULES`，按本 Handoff 的定稿文本构造公共落盘部分、步骤写入行及 AGENTS 附加行。 |
| `app/app.js` | `buildPrompt(step, formData, models, context, options)` 增加可选参数；保存开关和根目录设置；生成本地日期并规范化路径；将控件接入预览和 AGENTS 回写。 |
| `app/index.html` | 新增“附加文档落盘规范”开关和“文档根目录”输入框。 |
| `app/selftest.html` | 新增 AC21–AC24 逻辑断言；原有 31 条断言一条不删。 |
| `app/style.css` | 仅在布局确实需要时调整。 |
| `docs/README.md` | 更新提示词文档落盘和只读兜底维护规则。 |
| `docs/PLAN.md` | 追加 V1.4、V1.4.1 版本摘要；将 V1.4 原 AC21、AC22 标记为“已作废”。 |
| `docs/ACCEPTANCE.md` | 修订 AC02 前提；添加 AC21–AC25 和当前结果。 |
| `docs/REQUIREMENTS.md` | 追加“生成提示词指明文档路径和内容”的需求。 |
| `docs/handoff/HANDOFF_latest.md` | 保持为完整、最新的执行依据。 |

## Files to Create

- `docs/handoff/<本地日期>_implementation-report.md`：P5 实施报告；归档同名时按下方规则添加后缀。
- P3 开始时先写入 `docs/review/2026-11-23_decision.md`、`decision_2.md`、`decision_3.md` 三份既定裁决记录；这些文件已在本地决策清单中批准。

## File Naming and Update Rules

- 规范文件 `PLAN.md`、`ACCEPTANCE.md`、`REQUIREMENTS.md`、`handoff/HANDOFF_latest.md` 按各步骤要求原位更新。
- 带日期的归档文件若同名，改用 `_2`、`_3` 等后缀，保留旧归档。
- 每个阶段只写本阶段列出的文件，不改其他文件。
- 不确定的信息标记“待确认”，不编造内容。

## DOC_RULES 定稿文本

公共部分各行以 `\n` 连接；正文不加 Markdown 反引号。将 `{{docsRoot}}` 替换为规范化根目录、`{{date}}` 替换为日期、`{{implementer}}` 替换为当前实施模型名、`{{stepLine}}` 替换为步骤写入行。

```text
文档落盘（项目根目录下 {{docsRoot}}/）：
- 写入：{{stepLine}}
- 只写上列文档，不改其他文件；PLAN.md、ACCEPTANCE.md、REQUIREMENTS.md、handoff/HANDOFF_latest.md 为规范文件，按要求原位更新；带日期的文件已存在时追加 _2、_3，不覆盖；不确定内容标“待确认”。
- 若当前为只读/Plan 模式无法写文件：在输出末尾列出“待落盘文件”（路径 + 完整内容），由 {{implementer}} 在 P3 开始时写入。
```

P3、P5 不输出公共部分的最后一行只读兜底。

| 步骤 | `{{stepLine}}` |
|---|---|
| P1 | `{{docsRoot}}/analysis/{{date}}_analysis.md`（分析全文） |
| P2 | `{{docsRoot}}/PLAN.md`（目标/范围/步骤/风险）、`{{docsRoot}}/ACCEPTANCE.md`（AC 与验证方案）、`{{docsRoot}}/handoff/HANDOFF_latest.md`（Developer Handoff） |
| P2b | `{{docsRoot}}/REQUIREMENTS.md`（追加本次需求）、`{{docsRoot}}/PLAN.md`（追加变更对照与版本摘要）、`{{docsRoot}}/handoff/HANDOFF_latest.md`（整份替换为最新版）；AC 受影响时同步更新 `{{docsRoot}}/ACCEPTANCE.md` |
| P3 | 先将上一阶段“待落盘文件”写入对应路径；复核结论写入 `{{docsRoot}}/review/{{date}}_plan-review.md`（写文档不算改代码） |
| P4 | `{{docsRoot}}/review/{{date}}_decision.md`；若为 PLAN UPDATED，同步更新 `{{docsRoot}}/PLAN.md` 与 `{{docsRoot}}/handoff/HANDOFF_latest.md`；AC 受影响时同步更新 `{{docsRoot}}/ACCEPTANCE.md` |
| P5 | `{{docsRoot}}/handoff/{{date}}_implementation-report.md`；更新 `{{docsRoot}}/ACCEPTANCE.md` 结果表（仅有证据的项可记 PASS） |
| AGENTS | 只在规则块最后一行后追加此行：`- 文档：阶段产物写入 {{docsRoot}}/（各提示词已注明路径）；只读模式输出“待落盘文件”，由 {{implementer}} 写入；以 handoff/HANDOFF_latest.md 为最新基准。` |

## Required Changes

1. 提示词拼接顺序：源模板 → `\n\n` → DOC_RULES → `\n\n` → 补充上下文。`docRules` 关闭或未传 `options` 时不追加任何 DOC_RULES，行为与 V1.2 完全一致。
2. AGENTS 规则块开启时只追加指定的一行；关闭时保持源文逐字一致。回写时预览和写入内容一致，原有唯一章节、确认、权限失败保护和降级规则不变。
3. 页面状态新增 `docRules`（默认 `true`）和 `docsRoot`（默认 `docs`），沿用原 STORAGE_KEY；旧存储缺字段时使用默认值。两个控件和用户原始输入都保存。
4. `normalizeDocsRoot` 顺序：
   1. 去首尾空格；
   2. 将所有 `\` 换为 `/`；
   3. 反复去掉开头 `./`；
   4. 去掉末尾所有 `/`；
   5. 结果为空或为 `.` 时回退 `docs` 并提示；
   6. 以 `/` 或 `~` 开头、匹配 `^[A-Za-z]:`，或任一路径段为 `..` 时回退 `docs` 并提示。
   页面持久化原输入值，提示文本只使用规范化结果。
5. 日期采用浏览器本地年、月、日拼接为 `YYYY-MM-DD`；不得使用 `toISOString()`。传入 `options.date` 时直接使用，供测试确定性复现。
6. 模型名占位符保持与页面现有模型名设置联动。

## Must NOT Change

- `doc/**` 源模板。
- 现有源提示词正文和 15 处角色占位规则。
- 状态推荐映射及 AGENTS 回写安全规则。
- 开关关闭或未传 `options` 时的全部输出。
- 原有 31 条自测断言。
- 不 commit、不 push。

## Final Implementation Steps

1. P3 开始时先写入 Files to Create 中已批准的待落盘裁决记录，然后完整替换本文件；P3 只依据本地 `handoff/HANDOFF_latest.md` 做复核。
2. 复核通过、收到实施指令后，记录 `git status` 与 `doc/` SHA-256 基线。
3. 按序修改 `templates.js`、`app.js`、`index.html`、`selftest.html`；只有布局确实需要时修改 `style.css`。
4. 更新 README、PLAN、ACCEPTANCE、REQUIREMENTS；AC21–AC25 按本 Handoff 写入。
5. 在 Edge、Chrome headless 分别运行自测；手动测试 AC22 刷新记忆及 AC24 临时 AGENTS 文件回写。
6. 复核 `doc/` 哈希不变；新增带日期实施报告并如实记录每项 AC。未执行的标 `NOT TESTED`。

## Acceptance Criteria

### AC02（修订）

开关关闭或未传 `options` 时，V1.2 原有逐字一致要求全部不变。

### AC21：落盘段拼接

- **Given**：开关开启、`docsRoot = "docs"`、`date = "2026-01-01"`、模型名默认。
- **When**：依次生成 P1、P2、P2b、P3、P4、P5。
- **Then**：每步输出等于源模板 + `\n\n` + 公共文本（`{{stepLine}}` 替换为该步行），与本 Handoff 定稿逐字一致；P3/P5 无只读兜底行；补充上下文排最后。

### AC22：根目录规范化

| 输入 | 路径值 | 提示 |
|---|---|---|
| `my-docs/` | `my-docs` | 否 |
| 空白 | `docs` | 是 |
| `a\b\` | `a/b` | 否 |
| `./x` | `x` | 否 |
| `C:\docs` | `docs` | 是 |
| `/abs` | `docs` | 是 |
| `../up` | `docs` | 是 |
| `a/../b` | `docs` | 是 |

刷新后输入框保留原始输入。

### AC23：日期

不传日期时使用浏览器本地日期并格式化为 `YYYY-MM-DD`；注入 `options.date` 时可确定性复现。

### AC24：AGENTS 规则块与回写

开关开启时只在源规则块末尾增加指定一行；关闭时与源文逐字一致；对临时文件的回写内容与预览一致。

### AC25：回归

原有 31 条断言保持不变；Edge 和 Chrome 自测页中原有及新增断言全部 PASS。AC01–AC20 定义不变。

## Verification Plan

- Edge、Chrome headless 分别运行 selftest，覆盖 AC21–AC25 逻辑。
- 手动测试 AC22 刷新后的设置记忆和 AC24 临时文件写回。
- SHA-256 验证 `doc/` 未变化。
- 每条 AC 记录命令、浏览器、证据；未运行标 `NOT TESTED`。

## Stop Conditions

- 需要修改源模板正文或状态推荐映射。
- 开关关闭时输出与 V1.2 不一致。
- 原有 31 条自测出现失败。
- 对 AC 文字存在疑问时，先引用本地 Handoff 行号复核；旧版本或聊天中的增量稿不构成新的冲突依据。
- 需要修改本 Handoff 未授权的文件。

触发停止条件时停止并报告，不自行扩大范围。
