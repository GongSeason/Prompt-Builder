# 验收标准与结果

## 当前结果摘要

第一轮网页实施报告只将 AC02、AC14 记录为 PASS；其余 AC01、AC03–AC13、AC15 按原报告均为 `NOT TESTED`。文档验收 AC16、AC18–AC20 按已有检查记录；AC17 独立新会话验证未执行。V1.4.5 自测曾在 Edge 通过 52 项；本次 V1.5 selftest 在 Edge、Chrome 均实测 65 项通过、0 项失败。AC02、AC14、AC21、AC23、AC25–AC27、AC30 有本次自动测试证据；AC20 按 V1.5.1 修订定义为 PASS（未授权文件哈希一致，见 `review/2026-11-24_decision_3.md`）。2026-11-24 P4 裁决复跑 Edge、Chrome selftest 仍为 65/65，哈希仍一致（`review/2026-11-24_decision_4.md`）。AC10、AC28、AC29 有自动逻辑断言，但仍需页面手动验收，故整体保持 `NOT TESTED`。AC22 刷新记忆、AC24 临时文件实际回写、AC26b 刷新恢复也仍为 `NOT TESTED`。2026-11-24 后续 P5 调用在编码前因 V1.5.3 Handoff 明确“无待实施代码范围/不需要再走 P3/P5”而 BLOCKED；本轮未执行测试、未改代码，既有 AC 结果仅沿用原证据（详见 `handoff/2026-11-24_implementation-report_4.md`）。

| AC | 当前结果 | 证据/说明 |
|---|---|---|
| AC01 | NOT TESTED | Edge/Chrome headless 页面已加载；未手动检查窗口和开发者工具 Console。 |
| AC02 | PASS | Edge、Chrome headless 均运行 V1.5 selftest；P1、P2、AGENTS 独立定稿基准及其余 AC02 基准断言全部通过。 |
| AC03 | NOT TESTED | 未手动填写 P1 并检查页面预览。 |
| AC04 | NOT TESTED | 校验函数有自测；未在页面点击复制验证缺项提示。 |
| AC05 | NOT TESTED | 列表生成逻辑有自测；未手动操作 P2b 列表 UI。 |
| AC06 | NOT TESTED | 上下文生成逻辑有自测；未手动操作页面。 |
| AC07 | NOT TESTED | 角色替换逻辑有自测；未手动验证刷新、记忆和恢复默认流程。 |
| AC08 | NOT TESTED | 浏览器 `localStorage` 可写；未验证应用数据重新打开后恢复。 |
| AC09 | NOT TESTED | 未执行真实复制及外部粘贴。 |
| AC10 | NOT TESTED | P5 路由数据断言通过；未手动验证 COMPLETED/FAILED 提示文字与“前往 P6”按钮。 |
| AC11 | NOT TESTED | 追加函数有自测；未通过文件选择器写入临时文件。 |
| AC12 | NOT TESTED | 替换函数有自测；未通过文件选择器写入临时文件。 |
| AC13 | NOT TESTED | 纯逻辑保护有部分自测；未手动验证取消、权限失败及 API 降级。 |
| AC14 | PASS | Edge、Chrome headless 实际加载 `app/selftest.html`，各 65 项通过、0 项失败（既有证据；本轮 P5 调用在编码前 BLOCKED，未复跑，见 `handoff/2026-11-24_implementation-report_4.md`）。 |
| AC15 | NOT TESTED | 工作区开始时已有删除项和未跟踪目录，不能满足“整个工作区仅有 app 变更”的字面条件；本轮变更限于授权范围。 |
| AC16 | PASS | 目录完整与编码验收沿用已有记录，本轮未修改目录清单文件。 |
| AC17 | NOT TESTED | 尚未在独立新会话只提供 README 和最新 Handoff 做恢复验证。 |
| AC18 | PASS | 当前默认模型名仍为 `Luna / Opus / Sonnet`；V1.5 定稿和版本状态已检查。 |
| AC19 | PASS | 第一轮历史结果保留；未覆盖既有验收证据。 |
| AC20 | PASS | 按 V1.5.1 修订定义（见 `review/2026-11-24_decision_3.md`）：`doc/` 全部 5 个文件、`app/index.html`、`app/style.css` 的 SHA-256 与 P5 实施前基线一致；P4 裁决时复算仍一致。 |
| AC21 | PASS | Edge、Chrome headless selftest 的 P1–P6 文档落盘拼接及上下文顺序断言通过。 |
| AC22 | NOT TESTED | 规范化逻辑断言在 Edge、Chrome selftest 通过；尚未手动刷新页面验证原始输入值记忆。 |
| AC23 | PASS | Edge、Chrome selftest 的固定日期和本地日期断言通过。 |
| AC24 | NOT TESTED | Edge、Chrome selftest 验证 AGENTS 开关输出；尚未用临时 AGENTS.md 手动完成文件选择器回写。 |
| AC25 | PASS | Edge、Chrome headless selftest 各 65 项通过、0 项失败；原有断言保留，仅更新 Handoff 授权的基准和计数（既有证据；本轮 P5 调用在编码前 BLOCKED，未复跑，见 `handoff/2026-11-24_implementation-report_4.md`）。 |
| AC26a | PASS | Edge、Chrome selftest 中 Feature、Bug 回填映射与预览类型一致断言通过。 |
| AC26b | NOT TESTED | 尚未手动设置 `currentStep: "P1"` 后测试 Feature、缺失值及非法值的刷新恢复。 |
| AC27 | PASS | Edge、Chrome selftest 中 P1 V1.5 定稿逐字比对与无根因候选/接入点断言通过。 |
| AC28 | NOT TESTED | P6 定稿、待确认、字段映射、必填校验及非法类型生成回退的自动断言通过；未手动验证存储非法 issueType 后页面控件/预览回退。 |
| AC29 | NOT TESTED | P5/P6 状态映射断言通过；未手动点击 P5 COMPLETED/FAILED 的“前往 P6”按钮验证界面跳转。 |
| AC30 | PASS | Edge、Chrome selftest 中 AGENTS 开关定稿与 P6 DOC_RULES 写入行/只读兜底断言通过。 |

## 网页验收标准（AC01–AC15）

### AC01：本地打开

**Given**：Edge 或 Chrome，无网络服务。  
**When**：双击 `app/index.html`。  
**Then**：网页正常显示，开发者工具 Console 无页面错误。

### AC02：模板逐字一致

**Given**：文档落盘规范开关关闭，或调用生成逻辑时不传 `options`；模型名为 `Luna / Opus / Sonnet`，补充上下文为空。  
**When**：生成 P2、P3、P4、P5 和 AGENTS 规则块；并使用测试输入生成 P1、P2b。  
**Then**：固定模板与源 Markdown 对应代码块一致；P1/P2b 仅有计划定义的用户输入替换。比对基准必须来自源文档，而不是运行模板自身。

**V1.5 修订**：P2b、P3、P4、P5 仍以源 Markdown 为基准逐字一致。P1、P2、AGENTS 规则块和新增 P6 改以 `handoff/HANDOFF_latest.md` V1.5「模板定稿」为基准逐字一致；该基准须在 selftest 中独立写出，不得引用 `PromptTemplates` 自身。`doc/` 不修改。

### AC03：P1 字段生成

**Given**：任务类型为 Bug，需求为“A”，期望结果为“B”，场景/约束为空。  
**When**：查看生成结果。  
**Then**：包含 `任务类型：Bug`、`需求：A`、`期望结果：B`、`场景/约束：待分析`，其他模板内容不变。

### AC04：必填校验

**Given**：P1 的需求或期望结果为空。  
**When**：点击复制。  
**Then**：显示明确缺项提示，并指出字段名称；不把空字段内容当作已验收输出。

### AC05：P2b 连续编号

**Given**：输入 3 行，其中第 2 行为空。  
**When**：生成提示词。  
**Then**：空行被过滤，仅输出两条，编号连续为 `1.`、`2.`。

### AC06：补充上下文

**Given**：任一步骤。  
**When**：补充上下文为空或非空。  
**Then**：为空时不追加；非空时在生成文本末尾原样追加。

### AC07：模型名设置

**Given**：计划模型改为 `Opus 4.8`。  
**When**：查看相关提示词和推荐，刷新页面，再恢复默认。  
**Then**：相应占位符均使用自定义名；刷新后保留；恢复后回到 `Luna / Opus / Sonnet`，默认输出仍满足 AC02。

### AC08：本地记忆

**Given**：已填 P1 并切换到 P3。  
**When**：关闭并重新打开页面。  
**Then**：恢复 P1 内容和最后步骤 P3；存储不可用时须明确提示，不能声称已保存。

### AC09：复制

**Given**：步骤有生成结果。  
**When**：点击复制并粘贴到外部文本应用。  
**Then**：粘贴内容与预览完全一致，包括换行；页面提示复制成功。

### AC10：状态推荐

**Given**：选择当前步骤对应的模型输出状态。  
**When**：查看下一步推荐。  
**Then**：目标步骤及模型与状态映射一致；未知/不匹配状态不做猜测；P5 `FAILED` 只显示停止/复核提示，不生成下一步提示词。

**V1.5 修订**：P5 `COMPLETED`、`FAILED` 仍为终止状态（`terminal` 值不变），不自动跳转、不重试 P5、不回到 P1；页面在提示文字中增加“若仍有 Bug 或需追加 Feature，可前往 P6（计划模型）”，并显示“前往 P6”按钮，由用户手动点击。其余映射见 AC29。

### AC11：回写追加

**Given**：临时 UTF-8 AGENTS.md 不含目标规则节。  
**When**：预览并确认回写。  
**Then**：目标规则节只追加一次，原有内容不变，编码及换行格式保留。

### AC12：回写替换

**Given**：临时 AGENTS.md 中唯一存在目标规则节，后面还有其他同级标题。  
**When**：调整模型名、预览并确认回写。  
**Then**：仅目标节被替换，前后章节内容不变。

### AC13：回写取消或失败

**Given**：用户取消、权限失败、重复标题、格式不安全或 API 不可用。  
**When**：执行回写。  
**Then**：原文件不被写入，页面说明原因并提供复制/下载降级。

### AC14：自测

**Given**：在 Edge 或 Chrome 打开 `app/selftest.html`。  
**When**：页面加载。  
**Then**：所有逻辑断言通过；记录实际通过数和失败数。

### AC15：范围

**Given**：实施前工作区状态已记录。  
**When**：与实施后状态比较。  
**Then**：本轮新增内容只在 `PRJ_00_AgentPrompt/app/`。若基线本来有其他改动，必须区分基线和本轮变更，不覆盖它们。

## 本地记录验收标准（AC16–AC26）

### AC16：目录完整与编码

**Given**：V1.3 文档整理完成。  
**When**：列出 `docs/` 并检查文件编码。  
**Then**：8 个计划文件齐全，UTF-8 可读且无乱码。

### AC17：仅凭两个文件恢复

**Given**：向一个独立新会话只提供 `README.md` 和 `handoff/HANDOFF_latest.md`。  
**When**：请求其复述当前状态和下一步。  
**Then**：README 有当前阶段、下一步、待验收项、恢复步骤、维护规则；每节明确文件名或提示词编号。

### AC18：当前方案为最新版

**Given**：`PLAN.md`、`HANDOFF_latest.md`、本文件。  
**When**：检索模型默认值和版本标记。  
**Then**：当前方案默认值为 `Luna / Opus / Sonnet`；过时值只在版本变化摘要中并标为已作废。

### AC19：结果无虚报

**Given**：验收结果表和第一轮实施报告。  
**When**：逐项对照。  
**Then**：第一轮只有 AC02、AC14 是 PASS；AC16–AC20 依本轮真实检查填写。

### AC20：代码和源文档未变

**Given**：实施前 `app/`、`doc/` 的 SHA-256 基线。  
**When**：文档创建后重新计算。  
**Then**：所有哈希相同；本轮新增文件仅在 `docs/`。

**V1.5.1 修订**：只修改文档的轮次，按上述原定义判定。有代码变更的轮次，Given 改为“实施前对本轮 Handoff **未授权修改**的文件记录 SHA-256 基线”（V1.5 为 `doc/**`、`app/index.html`、`app/style.css`），Then 改为“这些文件的哈希与基线一致”；授权修改的代码文件不在比对范围内。

## V1.4.1 提示词落盘验收标准（AC21–AC25）

### AC21：落盘段拼接

**Given**：开关开启，`docsRoot = "docs"`，日期为 `2026-01-01`，模型名为默认值。  
**When**：依次生成 P1、P2、P2b、P3、P4、P5。  
**Then**：每一步输出均为「源模板 + `\n\n` + 公共落盘文本（将 `{{stepLine}}` 替换为该步行）」；P3、P5 不含只读兜底行；补充上下文非空时排在最后。内容与 `handoff/HANDOFF_latest.md` 中 DOC_RULES 定稿逐字一致。

**V1.5 修订**：When 增加 P6；P6 含只读兜底行，写入行使用 Handoff V1.5 的 P6 定稿。P1、P2 的“源模板”部分改用 V1.5 定稿。

### AC22：文档根目录规范化

**Given**：依次输入以下根目录。  
**When**：生成 P1。  
**Then**：规范化路径与提示结果如下；刷新页面后输入框保留用户原始输入值。

| 输入 | 路径中的值 | 提示 |
|---|---|---|
| `my-docs/` | `my-docs` | 否 |
| 空白 | `docs` | 是 |
| `a\b\` | `a/b` | 否 |
| `./x` | `x` | 否 |
| `C:\docs` | `docs` | 是 |
| `/abs` | `docs` | 是 |
| `../up` | `docs` | 是 |
| `a/../b` | `docs` | 是 |

### AC23：本地日期

**Given**：不传 `options.date`。  
**When**：生成 P1。  
**Then**：路径中的日期为浏览器本地日期，格式 `YYYY-MM-DD`；传入固定 `options.date` 时可确定地复现。

### AC24：AGENTS 规则块与回写

**Given**：文档规范开关开启或关闭。  
**When**：生成规则块，并对临时 AGENTS.md 执行回写。  
**Then**：开启时只在源规则块末尾追加指定文档规则一行；关闭时与源文逐字一致；回写内容与预览一致。

### AC25：回归

**Given**：V1.4.1 实现。  
**When**：在 Edge 和 Chrome 运行 `selftest.html`。  
**Then**：原有 31 条断言及新增断言全部 PASS；AC02 按 Handoff 修订，AC01、AC03–AC20 定义保持不变。

**V1.5 修订**：允许且仅允许更新以下断言的期望值，使其对应 V1.5 已批准的定稿：`filledP1`、`sourceP2`、`sourceAgents` 基准字符串；角色替换断言的步骤列表加入 P6，计数由 15（3/6/6）改为 20（4/9/7）；AC21 步骤列表加入 P6。不得删除断言或放宽判定；其余断言不变。Edge 与 Chrome 均须全部 PASS。

### AC26：P1 任务类型恢复一致（V1.4.4 拆分）

#### AC26a：回填映射逻辑（selftest）

**Given**：`PromptApp.getP1FieldValues`。  
**When**：分别传入 `{ taskType: "Feature", requirement: "r", expected: "e", constraints: "c" }` 和 `{ taskType: "Bug", ... }`。  
**Then**：返回对象键为 `task-type`、`requirement`、`expected`、`constraints`，其中 `task-type` 等于传入的 `taskType`，且不含 `taskType` 键；对相同输入 `buildPrompt("P1", …)` 中的 `任务类型：` 与 `task-type` 值相同。原有 50 条断言不变且全部 PASS。

#### AC26b：页面恢复（Edge、Chrome 手动）

**Given**：localStorage `duo-prompt-builder-v1` 对象中 `currentStep` 为 `"P1"`，且 `forms.P1.taskType` 分别为 `Feature`、不存在、非法值（如 `""` 或 `Other`）。（V1.4.5：`currentStep` 必须为 P1，因页面会恢复上次步骤。）  
**When**：刷新 `app/index.html`，不操作任务类型控件和步骤选择。  
**Then**：`Feature` → 下拉框与预览均为 `Feature`；不存在或非法 → 两者均为 `Bug`。之后切换 `Bug`/`Feature`，两者仍同步，刷新后保留。

## V1.5 职责调整与 P6 验收标准（AC27–AC30）

### AC27：P1 只整理代码事实

**Given**：默认模型名，P1 表单 `{ taskType: "Bug", requirement: "需求示例", expected: "期望示例", constraints: "" }`，不传 `options`。  
**When**：生成 P1。  
**Then**：输出与 Handoff V1.5 P1 定稿逐字一致；包含“不判断根因、不提方案，供 Opus 分析”；不包含“根因候选”“接入点”字样。V1.4.5 的任务类型回填修复（AC26a）仍 PASS。

### AC28：P6 生成与校验

**Given**：默认模型名。  
**When**：(a) 生成 P6，表单为 `{ issueType: "实施后 Bug", issue: "现象示例", expected: "" }`；(b) `issue` 为空或仅空白时调用 `validateStep("P6", …)`；(c) 保存的 `issueType` 不是两个合法选项时加载页面。  
**Then**：(a) 输出与 Handoff V1.5 P6 定稿逐字一致，`期望结果：待确认`；(b) 返回包含“问题/新需求”的缺项；(c) 回退“实施后 Bug”，下拉框与预览一致（同 AC26 原则，手动验证）。

### AC29：流程路由

**Given**：状态推荐映射。  
**When**：分别查询 P5 `COMPLETED`、P5 `FAILED`、P6 `PLAN APPROVED`、P6 `NEED USER INPUT`；并在页面选择 P5 COMPLETED 后点击“前往 P6”。  
**Then**：P5 两项的 `terminal` 仍分别为 `completed`、`failed`，且 `next = "P6"`、`model = "planner"`；P6 `PLAN APPROVED` → P3 / implementer；P6 `NEED USER INPUT` → P2b / planner。原有其他映射不变（AC10 原 9 条路由断言仍 PASS）。按钮点击后页面切换到 P6（手动验证）。

### AC30：AGENTS 规则块与 P6 落盘

**Given**：默认模型名。  
**When**：生成 AGENTS 规则块（开关关/开），以及开关开启时生成 P6。  
**Then**：开关关闭时规则块与 Handoff V1.5 AGENTS 定稿逐字一致；开启时只在末尾追加既有文档行（AC24 规则不变）；P6 落盘写入行与 Handoff V1.5 P6 定稿一致且含只读兜底行。

## 手动验收记录模板

每项记录日期、浏览器/版本、操作步骤、实际结果和证据。尚未运行则保持 `NOT TESTED`；回写测试只使用临时文件。
