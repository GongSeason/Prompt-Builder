# 计划复核与裁决记录

- 日期：2026-11-23
- 范围：网页 V1.2 实施计划的 Sonnet Plan Review、计划模型裁决及 V1.3 本地记录计划复核。
- 结论：网页计划最终 `PLAN STATUS: READY TO IMPLEMENT`；V1.3 文档计划的 P3 复核也为 `READY TO IMPLEMENT`。

## Sonnet Issue 1：状态推荐没有状态输入

**Sonnet 发现：** 方案说要根据模型输出状态推荐下一步，但没有说明网页怎样取得该状态。

**Opus 决策：** ACCEPT SONNET FINDING。

**裁决：** 用户在网页中手动选择模型实际返回的状态；未选、未知或不匹配时不猜测推荐。不自动解析整段回复。

**影响：** 更新状态选择控件、状态映射和 AC10。

## Sonnet Issue 2：本地来源下浏览器 API 可行性

**Sonnet 发现：** `file://` 下存储、剪贴板和文件写入能力没有实现证据。

**Opus 决策：** PARTIALLY ACCEPT。

**裁决：** 通过能力检测并在目标浏览器实际验证；生成、预览、复制不依赖回写；回写不可用时降级。若本地记忆不符合 AC08，则停止并重新评估。

**证据补充：** 第一轮在 Edge、Chrome 对本地自测页检测到安全上下文、localStorage、Clipboard API 和文件选择 API；实际记忆交互、复制粘贴与文件写入仍未测试。

## Sonnet Issue 3：AGENTS.md 回写范围和定位

**Sonnet 发现：** 回写目标标题、重复标题和文件格式的处理不明确。

**Opus 决策：** PARTIALLY ACCEPT。

**裁决：** 仅操作用户选择的文件；目标 `## 三模型协作规则` 唯一时替换，不存在时追加，重复时拒绝。写入前预览并要求确认；只写规则代码块内部内容。编码或换行无法安全处理时不写入，提供降级。

## Sonnet Issue 4：模型默认名和替换范围冲突

**Sonnet 发现：** 前版默认值与源提示词正文简称不一致，可能导致固定模板的逐字比对失败。

**Opus 决策：** ACCEPT SONNET FINDING，并修订为 V1.2。

**裁决：** 默认值采用 `Luna / Opus / Sonnet`；只替换源代码块中的 15 处角色称呼。步骤说明标题是静态参考。模型改名后，模板角色引用和推荐标签同步。

## Sonnet Issue 5：AC02 缺少独立模板基准

**Sonnet 发现：** 若预期输出和生成模板都来自 `templates.js`，比对会自我引用。

**Opus 决策：** ACCEPT SONNET FINDING。

**裁决：** 使用源 Markdown 代码块作为独立比对基准；允许替换范围明确限定为用户字段和角色占位符。

## 版本纠正

- **V1.1 已作废：** 曾把默认值设为 `Luna / Opus 5.5 / Sonnet 5.5`，且未明确角色替换位置。
- **V1.2 当前网页设计：** 默认值 `Luna / Opus / Sonnet`，精确替换 15 个角色称呼，AC02 有独立基准。
- 后续实施应使用最新的 `docs/handoff/HANDOFF_latest.md`，不恢复已作废方案。

## V1.3 本地记录方案 P3 复核

检查时 `PRJ_00_AgentPrompt/docs/` 尚不存在；`app/` 已有 5 个网页文件，`doc/` 源资料存在。V1.3 仅新增计划清单内 8 个 Markdown 文件，文件哈希保护范围可执行。项目工作区此前已有删除项和未跟踪目录，实施需保留其基线。

复核结果：`PLAN STATUS: READY TO IMPLEMENT`。本次复核本身不修改代码或文档。
