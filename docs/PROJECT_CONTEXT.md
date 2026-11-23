# 项目上下文

## 项目目标

维护一个依据指定精简提示词文档生成提示词的本地静态网页，并把需求、方案、验收和实施交接保存于 `docs/`，帮助后续会话恢复上下文。

## 当前技术方案

- 页面：原生 HTML、CSS、JavaScript，位于 `app/`。
- 运行：在 Edge 或 Chrome 本地打开 `app/index.html`；当前实现不调用在线 AI 服务。
- 模板来源：`doc/Duo 三模型精简提示词.md（含 AGENTS.md 规则）.md`。
- 浏览器本地存储：保存模型名、步骤输入、补充上下文和当前步骤。
- 文件回写：由用户选择 AGENTS.md，检查唯一目标章节，预览并确认后写入；无法安全写入时不改原文件并提供降级。
- 自动自测：`app/selftest.html`。

## 模型角色

| 角色 | 当前默认显示名 | 用途 |
|---|---|---|
| 分析模型 | `Luna` | P1 只读分析 |
| 计划模型 | `Opus` | P2 设计、P2b 补充、P4 裁决 |
| 实施模型 | `Sonnet` | P3 实施前复核、P5 实施 |

三个名称可编辑并保存于当前浏览器。模板步骤说明的源文档标题保持静态；代码块正文里的 15 处角色名使用对应设置。

## 主要流程

- P1 分析 → `ANALYSIS COMPLETE` → P2。
- P2 → `PLAN APPROVED` 到 P3；`NEED USER INPUT` 到 P2b。
- P2b → `PLAN APPROVED` 到 P3。
- P3 → `READY TO IMPLEMENT` 到 P5；`REVIEW REQUIRED` 到 P4。
- P4 的两种裁决结果都回到 P3 复核最新计划。
- P5 → `BLOCKED` 到 P4；`COMPLETED` 结束；`FAILED` 显示停止/复核提示。
- 状态由用户手动选择，页面不替用户猜测。

## 目录约定

```text
PRJ_00_AgentPrompt/
├── doc/       # 原始资料，只读
├── app/       # 本地网页，本轮文档工作不修改
└── docs/      # 本地需求、计划、验收和交接
```

本地记录完整清单见 `README.md`。

## 当前验证状态

自动自测在 Edge、Chrome 各 31 项通过。第一轮报告只将 AC02、AC14 记录为 PASS；页面交互、浏览器持久化流程和实际文件写入等项目仍按报告标为 NOT TESTED。详细证据见 `ACCEPTANCE.md` 与实施报告。
