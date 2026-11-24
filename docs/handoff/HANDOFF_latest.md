# Updated Developer Handoff — V1.4.5（完整版本，唯一执行依据）

## Final Objective / Root Cause

在现有提示词生成器中加入可开关的“文档落盘规范”，并修复 P1 恢复已保存任务类型时页面选择与生成预览不一致的 Bug。

P1 Bug 根因：`state.forms.P1` 使用字段名 `taskType`，任务类型 `<select>` 的 DOM id 是 `task-type`；`setField` 按字段名直接查 DOM id，回填失败。页面预览使用已保存的 state，而控件保留 HTML 默认选项，因此两者可能不一致；用户切换后，输入事件映射 `task-type` 到 `taskType`，才重新同步。

代码证据（V1.4.4 复核，事实）：`app/app.js` L228–233 `setField` 用 `document.getElementById(id)` 按 values 的 key 查找；L248 传入 `state.forms.P1`（key 为 `taskType`）；L403–411 输入事件中 `task-type` → `taskType` 映射。`requirement`/`expected`/`constraints` 的 key 与 id 相同，不受影响。`setField`、`renderFields` 是 `init()` 内闭包，`selftest.html` 无法直接调用。

## Final Modification Scope

**代码修改（V1.4.5 收窄）**：仅 `app/app.js`、`app/selftest.html`。  
**文档修改**：仅 `docs/ACCEPTANCE.md` 结果表和 Files to Create 中的实施报告。  
不修改 `doc/**`、其他 `app/` 文件或仓库其他无关文件。裁决依据：`review/2026-11-24_decision_2.md`。

## Files to Modify

| 文件 | 修改内容 |
|---|---|
| `app/app.js` | 仅 Required Changes 第 7 条：新增纯函数 `getP1FieldValues(form)` 并追加到 `PromptApp` 导出；`renderFields` 的 P1 分支改为 `setField(markup, getP1FieldValues(state.forms.P1))`；`mergeState` 对非法 `taskType` 回退 `Bug`。V1.4.1 落盘逻辑保持不变。 |
| `app/selftest.html` | 保留现有 50 条断言（含原 31 条和 AC21–AC24）；新增 AC26a 对 `getP1FieldValues` 的断言。 |
| `docs/ACCEPTANCE.md` | 仅按实测结果更新结果表（AC14、AC25、AC26a、AC26b 等有证据项）。 |

## 既有基线（V1.4.1 已实现，本轮不修改，只做回归验证）

- `app/templates.js`（`DOC_RULES` L31–42、导出 L67）、`app/index.html`（`doc-rules-toggle`、`docs-root`）、`app/style.css`。
- `app/app.js` 中 `normalizeDocsRoot`、`getLocalDate`、`buildDocRules`、设置控件持久化。
- `docs/README.md`（L39–40 落盘规则）、`docs/PLAN.md`、`docs/REQUIREMENTS.md`。

## Files to Create

- `docs/handoff/<本地日期>_implementation-report.md`：P5 实施报告；同名已存在时按下方规则添加 `_2`、`_3` 后缀（`2026-11-24_implementation-report.md` 已存在）。

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

> 第 1–6 条为 V1.4.1 已实现基线，本轮只做回归验证、不再修改；本轮实施仅第 7 条。

1. 提示词拼接顺序：源模板 → `\n\n` → DOC_RULES → `\n\n` → 补充上下文。`docRules` 关闭或未传 `options` 时不追加任何 DOC_RULES，行为与 V1.2 完全一致。
2. AGENTS 规则块开启时只追加指定的一行（与源规则块以单个 `\n` 连接，第 1 条的 `\n\n` 不适用于 AGENTS）；关闭时保持源文逐字一致。回写时预览和写入内容一致，原有唯一章节、确认、权限失败保护和降级规则不变。
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
7. 修复 P1 字段回填（V1.4.4）：
   1. 新增 `getP1FieldValues(form)`，返回 `{ "task-type": form.taskType, requirement: form.requirement, expected: form.expected, constraints: form.constraints }`；把它追加到 `PromptApp` 的 `Object.freeze` 导出，现有导出成员不改。
   2. `renderFields` P1 分支仅把 `setField` 的第二个参数改为 `getP1FieldValues(state.forms.P1)`；`setField` 本身不改。
   3. `mergeState`：合并后若 `forms.P1.taskType` 不是 `Bug` 或 `Feature`，设为 `Bug`（不改变 schema 和 STORAGE_KEY）。
   4. 输入事件映射（L403–411）、`buildPrompt` 中的 `form.taskType || "Bug"`、默认 `Bug`、`Bug/Feature` 选项和模板不变。

## Must NOT Change

- `doc/**` 源模板。
- 现有源提示词正文和 15 处角色占位规则。
- 状态推荐映射及 AGENTS 回写安全规则。
- 开关关闭或未传 `options` 时的全部输出。
- P1 默认任务类型 `Bug`、选项 `Bug/Feature` 和现有 localStorage schema。
- `setField` 函数体、P1 输入事件映射、`PromptApp` 现有导出成员。
- 现有 50 条自测断言（含原 31 条）。
- 不 commit、不 push。

## Final Implementation Steps

1. P3 只依据本地 `handoff/HANDOFF_latest.md` 复核（无待落盘裁决记录需补写）。
2. 复核通过、收到实施指令后，记录 `git status` 与 `doc/`、`app/templates.js`、`app/index.html`、`app/style.css` 的 SHA-256 基线。
3. 修改 `app/app.js`（Required Changes 第 7 条的三处修改），再修改 `app/selftest.html`（AC26a 断言）；不改其他文件。
4. 仅更新 `docs/ACCEPTANCE.md` 结果表；README、PLAN、REQUIREMENTS 不改。
5. 在 Edge、Chrome headless 分别运行自测（预期 50 + AC26a 新增条数全部 PASS）；手动测试 AC22 刷新记忆、AC24 临时 AGENTS 文件回写和 AC26b 三种存储场景。
6. 复核第 2 步基线文件哈希不变；新增带日期实施报告并如实记录每项 AC。未执行的标 `NOT TESTED`。

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

原有 31 条断言保持不变；Edge 和 Chrome 自测页中原有及新增断言全部 PASS。AC02 按本 Handoff 修订；AC01、AC03–AC20 定义不变。

### AC26a：回填映射逻辑（selftest）

- **Given**：`PromptApp.getP1FieldValues`。
- **When**：传入 `taskType` 为 `Feature` 和 `Bug` 的表单。
- **Then**：返回键为 `task-type`、`requirement`、`expected`、`constraints`，`task-type` 等于输入 `taskType`，无 `taskType` 键；同一输入的 `buildPrompt("P1", …)` 中 `任务类型：` 与之相同。现有 50 条断言全部 PASS。

### AC26b：页面恢复（Edge、Chrome 手动）

- **Given**：localStorage `duo-prompt-builder-v1` 对象中 `currentStep` 为 `"P1"`，且 `forms.P1.taskType` 为 `Feature` / 不存在 / 非法值（`""`、`Other`）。（V1.4.5：必须含 `currentStep: "P1"`，因为页面会恢复上次步骤，这是 AC08 既有行为，不得修改。）
- **When**：刷新 `app/index.html`，不操作任务类型控件和步骤选择。
- **Then**：`Feature` → 下拉框与预览均为 `Feature`；不存在或非法 → 均为 `Bug`。切换后仍同步，刷新后保留。

## Verification Plan

- Edge、Chrome headless 分别运行 selftest，覆盖 AC21–AC25 及 AC26a 逻辑。
- 手动测试 AC22 刷新后的设置记忆、AC24 临时文件回写，以及 AC26b 三种存储场景（可在 DevTools Application → Local Storage 修改 `duo-prompt-builder-v1`，确保 `currentStep` 为 `"P1"` 后刷新）。
- SHA-256 验证 `doc/` 及既有基线文件未变化。
- 每条 AC 记录命令、浏览器、证据；未运行标 `NOT TESTED`。

## Stop Conditions

- 需要修改源模板正文或状态推荐映射。
- 开关关闭时输出与 V1.2 不一致。
- 原有 31 条自测出现失败。
- 对 AC 文字存在疑问时，先引用本地 Handoff 行号复核；旧版本或聊天中的增量稿不构成新的冲突依据。
- 需要修改本 Handoff 未授权的文件。

触发停止条件时停止并报告，不自行扩大范围。

## 当前进度（V1.4.5）

- V1.4.5 裁决（`review/2026-11-24_decision_2.md`）：接受 Sonnet 复核两项意见——AC26b 的 Given 加入 `currentStep: "P1"`；本轮代码范围收窄为 `app/app.js` + `app/selftest.html`，V1.4.1 文件作为既有基线不改。代码修改尚未执行。
- 下一步：P3 复核本 V1.4.5 Handoff；READY 后 P5 实施 Required Changes 第 7 条及 AC26a 断言，运行 Edge/Chrome 自测并手动验证 AC26b。

### V1.4.4 历史记录

- V1.4.1 落盘规范代码已实现；Edge、Chrome 上次自测各 50/50。AC22 刷新记忆和 AC24 临时文件实际回写仍需人工验收。
- P1 任务类型 Bug 根因经代码复核确认（见 Root Cause 代码证据）。
- V1.4.4 修正 V1.4.3 的不可行点：原计划的 selftest AC26 断言无法访问 `init()` 闭包，改为导出纯函数 `getP1FieldValues` 并拆分 AC26a/AC26b；新增非法保存值回退 `Bug`。代码修改尚未执行。
- 下一步：P3 复核本 V1.4.4 Handoff；READY 后 P5 实施 Required Changes 第 7 条，运行自测和手动验收。
