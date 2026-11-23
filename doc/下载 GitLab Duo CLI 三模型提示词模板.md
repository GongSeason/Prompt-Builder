# GitLab Duo CLI 三模型协作提示词

> 适用场景：在同一个 GitLab Duo CLI Session 中，使用 **GPT-6 Luna** 阅读和分析代码，切换到 **Claude Opus 5.5** 制定实施计划与验收标准，再切换到 **Claude Sonnet 5.5** 实施代码。
>
> 工作原则：**Luna 看懂代码，Opus 制定方案和验收标准，Sonnet 严格实施。**

---

## 1. 通用使用规则

### 1.1 推荐流程

```text
任务输入
  ↓
GPT-6 Luna：只读分析代码
  ↓
Claude Opus 5.5：只做方案、风险和验收标准
  ↓
Claude Sonnet 5.5：先复述方案，再实施代码
  ↓
Build / Test / Acceptance Criteria
```

### 1.2 Session 与模型切换

- 尽量在同一个 Duo CLI Session 中完成任务。
- 使用 `/model` 切换模型。
- 不要在模型切换过程中使用 `/new`，避免丢失前序上下文。
- 每次切换模型后，先要求新模型确认它能读取前序分析和方案。
- 如果上下文过长或任务跨多个 Session，请把 Luna 分析和 Opus 计划保存为 Markdown 交接文件。

### 1.3 全局约束

- 遵守项目中的 `AGENTS.md`、`PROJECT_CONTEXT.md`、`BUSINESS_RULES.md` 等规则文件。
- 不修改与当前任务无关的代码。
- 不进行无关重构。
- 不改变已经验证的业务逻辑。
- 不擅自修改接口、数据格式、配置或依赖。
- 不擅自扩大任务范围。
- 优先采用最小修改。
- 如果实际代码与既定方案冲突，应停止实施并报告，不可自行重新设计。
- 不提交、推送、合并或删除 Git 分支，除非用户明确要求。

---

# Part A：Bug 修复提示词

## A1. GPT-6 Luna：Bug 代码分析

### 使用时机

Bug 出现后，先用 Luna 阅读相关代码、还原当前逻辑、确定可能的问题路径。该阶段不修改代码，也不制定最终解决方案。

### 提示词

```text
你现在负责本次 Bug 的代码理解和上下文分析。

Bug 描述：
【在这里填写 Bug 现象】

期望行为：
【填写正确的预期行为】

实际行为：
【填写当前错误行为】

复现条件或步骤：
【填写复现步骤；如果未知，写“待确认”】

请先完整理解当前代码库，以及与本 Bug 相关的代码、配置和项目文档。

你的任务：

1. 找出与本 Bug 相关的文件、类、函数、数据结构和调用关系。
2. 解释当前功能从输入到输出的完整执行流程。
3. 识别 Bug 可能发生在哪个代码路径和处理阶段。
4. 查明相关输入、输出、状态、配置、异常处理和边界条件。
5. 检查是否存在重复逻辑、状态不同步、空值、边界值、类型转换、顺序、异步、文件访问或数据映射问题。
6. 区分：
   - 已经从代码、日志或测试中确认的事实
   - 有证据支持但尚未确认的可能原因
   - 仍需进一步验证的假设
7. 找出已经正常工作且必须保持不变的业务逻辑。
8. 标识潜在影响范围和可能发生回归的功能。
9. 如果证据不足以确定根因，列出最小化的验证方法或需要补充的日志位置。

重要约束：

- 当前阶段只分析。
- 不修改任何源代码。
- 不直接实施修复。
- 不进行重构。
- 不因为发现其他问题而扩大任务范围。
- 不把推测描述成已确认事实。
- 遵守 AGENTS.md 和项目规则文件。

最后按以下结构输出：

## Bug Understanding

## Reproduction Path

## Relevant Files and Functions

## Current Logic and Data Flow

## Confirmed Facts

## Root-Cause Candidates

## Unknowns and Required Verification

## Existing Logic That Must Be Preserved

## Potential Regression Impact

## Handoff to Planning Model

这份分析将交给 Claude Opus 5.5 制定正式修复方案。
```

---

## A2. Claude Opus 5.5：Bug 修复计划与验收标准

### 使用时机

Luna 完成只读分析后，在同一 Session 中切换到 Opus。Opus负责验证分析、明确根因、确定最小修改范围并编写可执行的验收标准，但不修改代码。

### 提示词

```text
基于当前 Session 中 GPT-6 Luna 已经完成的 Bug 分析，你现在作为本任务的技术架构师和高级代码审查专家。

Bug 描述：
【填写 Bug 现象】

本阶段只负责根因确认、修复设计、风险分析和验收计划，不修改业务代码。

请重新检查 Luna 的分析和相关代码。不要无条件接受前一个模型的结论；如果发现错误、遗漏或证据不足，请明确指出。

请输出一份可以直接交给 Claude Sonnet 5.5 执行的修复计划。

## 1. Root Cause

请说明：

- Bug 的直接原因
- Bug 的根本原因
- 触发条件
- 为什么现有代码会产生当前错误行为
- 哪些结论是 confirmed fact
- 哪些仍然是 assumption

如果现有证据不足以确认唯一根因，不要猜测。请先设计最小验证步骤，并在计划中设置停止条件。

## 2. Expected Correct Behavior

明确修复后的正确行为，包括：

- 正常输入
- 边界输入
- 无效输入
- 异常情况
- 与现有功能交互时的行为

## 3. Modification Scope

明确列出：

### Files to Modify
- 文件路径
- 类 / 函数
- 当前职责
- 需要修改的内容

### Files That Must NOT Be Modified
列出不应修改的文件及原因。

### Existing Logic That Must Be Preserved
列出必须保持不变的业务规则、接口、数据格式和已验证行为。

## 4. Repair Design

说明：

- 修复策略
- 为什么选择该策略
- 为什么这是最小且安全的修改
- 如何避免只修复表面症状
- 如何避免影响其他调用方
- 是否需要新增测试、日志或保护性检查

## 5. Implementation Plan

按照实际开发顺序给出：

Step 1
Step 2
Step 3
...

每一步必须足够具体，使 Sonnet 不需要重新设计修复方案。

## 6. Risk Analysis

至少分析：

- Regression risk
- Data integrity risk
- Interface compatibility risk
- UI risk
- Performance risk
- Concurrency / state risk（如适用）
- Equipment / production risk（如适用）

对每项风险说明降低方法。

## 7. Acceptance Criteria

每一项必须明确、可测试、可判定 PASS / FAIL。

至少覆盖：

1. Bug 原始复现条件
2. 正常场景
3. 边界场景
4. 异常场景
5. 原有功能回归
6. 数据完整性

使用以下格式：

AC01
Given:
When:
Then:

AC02
Given:
When:
Then:

不要使用“功能正常”“问题已解决”“效果良好”之类的模糊描述。

## 8. Verification Plan

明确开发完成后需要执行：

- Build
- Unit tests
- Functional tests
- Regression tests
- Manual verification
- Log / output verification

如果某项不适用，请说明原因。

## 9. Rollback / Stop Conditions

说明：

- 哪些情况出现时必须停止实施
- 哪些情况说明原根因判断错误
- 如何撤销本次修改
- 哪些情况必须重新交给 Opus 评估

## 10. Developer Handoff

最后生成简洁但完整的 Developer Handoff：

- Confirmed root cause
- Expected behavior
- Files and functions to modify
- Required changes
- Must NOT change
- Ordered implementation steps
- Acceptance criteria
- Verification steps
- Stop conditions

重要约束：

- 不修改任何业务代码。
- 不进行无关重构。
- 优先采用最小修改。
- 保留现有已经验证的业务逻辑。
- 不扩大需求范围。
- 不为了让测试通过而降低或删除原有校验。
- 遵守 AGENTS.md 和项目规则文件。
```

---

## A3. Claude Sonnet 5.5：Bug 修复前的方案复述

### 使用时机

切换到 Sonnet 后，不要立刻让它修改代码。先要求它复述 Luna 分析和 Opus 方案，确认上下文没有丢失。

### 提示词

```text
你现在是本次 Bug 修复的实施开发工程师。

请读取当前 Session 中：

1. GPT-6 Luna 的 Bug 分析
2. Claude Opus 5.5 的 Root Cause 分析
3. Repair Design
4. Implementation Plan
5. Acceptance Criteria
6. Developer Handoff
7. AGENTS.md 和项目规则文件

暂时不要修改任何代码。

请先复述你理解的实施方案，包括：

1. Bug 的实际根因
2. Bug 的触发条件
3. 修复后的期望行为
4. 要修改的文件和函数
5. 每个位置具体需要修改什么
6. 哪些代码、接口、数据格式和业务逻辑绝对不能修改
7. 实施顺序
8. 主要 regression risks
9. 全部 Acceptance Criteria
10. 完成后需要执行的测试和验证
11. 哪些情况出现时必须停止

同时检查：

- Opus 的计划是否与当前实际代码一致
- 计划中的文件、类和函数是否真实存在
- 是否存在遗漏的调用方或依赖关系
- 是否包含无关重构或超出范围的修改

如果无法读取前面的完整计划，或者计划与当前代码存在明显冲突：

立即停止，不要修改代码，并报告：

- 缺失或冲突的内容
- 相关代码证据
- 需要 Opus 重新确认的问题

不要自行重新设计另一套方案。
```

---

## A4. Claude Sonnet 5.5：确认后实施 Bug 修复

### 使用方法

只有在 Sonnet 的复述与 Opus 计划一致后，才发送以下提示词。

```text
确认。现在严格按照 Claude Opus 5.5 已确认的 Repair Design 和 Implementation Plan 执行 Bug 修复。

执行规则：

1. 只修改计划中允许修改的文件和函数。
2. 严格按照已经确认的步骤实施。
3. 优先采用最小修改。
4. 保留所有现有业务逻辑、接口和数据格式。
5. 不进行无关重构。
6. 不修复本任务范围之外的问题。
7. 不自行增加功能。
8. 不为了简化实现而删除现有校验、异常处理或安全逻辑。
9. 每完成一个关键修改，就检查是否仍然符合 Acceptance Criteria。
10. 修改完成后执行计划中的 Build、Test 和 Verification。

如果实施过程中发现必须偏离 Opus 方案，立即停止并报告：

- 原计划是什么
- 实际代码中发现了什么
- 为什么无法继续按原计划实施
- 已经修改了哪些内容
- 建议 Opus 重新评估的问题

不要自行扩大修改范围。

完成后按以下结构报告：

## Implementation Summary

- Modified files
- Modified functions
- Actual changes
- Root cause addressed
- Protected logic left unchanged

## Acceptance Criteria Results

逐项报告：

AC01: PASS / FAIL / NOT TESTED
Evidence:

AC02: PASS / FAIL / NOT TESTED
Evidence:

不得在没有执行验证时将项目标记为 PASS。

## Test Results

- Build:
- Unit tests:
- Functional tests:
- Regression tests:
- Manual verification:

请提供执行的命令、结果摘要，以及失败项目的错误信息。

## Changed Scope Check

- 是否只修改了计划允许的文件：Yes / No
- 是否进行了计划外重构：Yes / No
- 是否改变了接口或数据格式：Yes / No
- 是否影响了现有业务逻辑：Yes / No

## Remaining Issues

如果没有，明确写：None
```

---

# Part B：新增 Feature 提示词

## B1. GPT-6 Luna：现有架构与接入点分析

### 使用时机

新增功能前，先让 Luna 理解现有架构，找出合理接入点和可复用代码。该阶段不设计最终方案，也不写代码。

### 提示词

```text
我要在当前项目中新增以下功能：

【在这里描述新增功能】

用户场景：
【填写谁在什么情况下使用该功能】

预期结果：
【填写用户完成操作后应得到什么结果】

已知约束：
【填写接口、数据格式、UI、设备、兼容性或时间约束；如无则写“待分析”】

请先只读分析当前项目，不要修改任何代码。

你的任务：

1. 找出与该功能最相关的现有文件、类、函数、接口和数据结构。
2. 解释当前相关功能和数据流是如何工作的。
3. 判断新增功能最合理的接入位置。
4. 找出可以复用的现有代码、组件、服务、接口、模型和数据结构。
5. 检查项目中是否已经存在相似功能或部分实现。
6. 明确哪些现有业务逻辑、接口和数据格式必须保持不变。
7. 分析新增功能可能影响哪些已有功能和调用方。
8. 识别可能涉及的 UI、数据持久化、配置、日志、异常处理和权限逻辑。
9. 找出实现该功能仍缺少哪些信息。
10. 区分：
    - 从现有代码确认的事实
    - 基于代码结构的合理推测
    - 需要 Opus 进一步设计或用户决定的问题

重要约束：

- 当前阶段只分析现状和接入点。
- 不设计最终实施方案。
- 不修改任何代码。
- 不重构现有代码。
- 不加入需求之外的功能。
- 避免建议复制已有业务逻辑。
- 遵守 AGENTS.md 和项目规则文件。

最后按以下结构输出：

## Feature Understanding

## Current Relevant Architecture

## Existing Data Flow

## Relevant Files and Functions

## Recommended Integration Points

## Reusable Components and Logic

## Similar Existing Implementations

## Existing Logic That Must Be Preserved

## Potential Impacts and Dependencies

## Open Questions

## Handoff to Planning Model

这份结果将交给 Claude Opus 5.5 进行正式技术设计。
```

---

## B2. Claude Opus 5.5：Feature 设计、计划与验收标准

### 使用时机

Luna 分析完成后切换到 Opus。Opus需要验证接入点，定义范围、架构、修改文件、边界情况和验收标准，但不修改代码。

### 提示词

```text
基于当前 Session 中 GPT-6 Luna 对现有项目和新增功能的分析，你现在作为本功能的技术架构师和高级代码审查专家。

需要新增的功能：
【填写新增功能】

用户场景：
【填写使用场景】

预期结果：
【填写期望结果】

请重新检查 Luna 的结论和相关代码。不要无条件接受前一个模型的分析；如果发现错误、遗漏或不合理的接入点，请明确指出。

本阶段只进行技术设计、实施规划、风险分析和验收标准设计，不修改业务代码。

## 1. Feature Objective

明确：

- 用户需要解决什么问题
- 新功能提供什么能力
- 本次范围包含什么
- 本次范围不包含什么
- 成功完成的可观察结果是什么

## 2. Existing Architecture Fit

说明：

- 新功能应接入现有流程的哪个位置
- 为什么该接入点最合理
- 使用哪些现有数据
- 复用哪些现有逻辑、组件、服务或模型
- 如何避免重复实现已有业务逻辑
- 如何保持与现有架构和编码模式一致

## 3. Feature Design

明确设计：

- 输入
- 输出
- 主要处理流程
- 数据流
- 状态变化
- UI 交互（如适用）
- 错误处理
- 日志与诊断信息
- 配置项（如适用）
- 权限和安全考虑（如适用）
- 向后兼容性

## 4. Modification Scope

### Existing Files to Modify

对每个文件列出：

- 文件路径
- 类 / 函数
- 当前职责
- 需要修改的内容
- 修改原因

### New Files to Create

对每个新文件列出：

- 文件路径
- 文件职责
- 主要类 / 函数
- 为什么必须新增，而不是修改或复用现有文件

### Files That Must NOT Be Modified

列出不应修改的文件和原因。

### Existing Logic That Must Be Preserved

明确不能改变的：

- 业务规则
- 公共接口
- 数据格式
- 配置格式
- 现有输出
- 已验证用户流程
- 设备或生产安全逻辑

## 5. Implementation Plan

按照实际开发顺序给出：

Step 1
Step 2
Step 3
...

每一步必须足够具体，使 Sonnet 不需要重新设计功能。

各步骤应包含：

- 修改或创建的文件
- 目标类 / 函数
- 具体变更
- 与前后步骤的关系
- 完成检查点

## 6. Edge Cases and Failure Handling

至少考虑：

- Empty input
- Invalid input
- Missing data
- Duplicate data
- Boundary values
- File or access errors
- Configuration missing or invalid
- Existing-feature interaction
- Partial operation failure
- Repeated user operation
- Concurrent operation（如适用）
- Equipment communication failure（如适用）

## 7. Risk Analysis

至少分析：

- Existing business logic regression
- UI regression
- Data integrity risk
- API / interface compatibility
- Output compatibility
- Performance impact
- Maintainability risk
- Equipment / production risk（如适用）

对每项风险说明降低方法。

## 8. Acceptance Criteria

为新功能建立明确、可执行、可判断 PASS / FAIL 的验收标准。

至少覆盖：

1. Primary normal case
2. Alternative normal case
3. Boundary case
4. Invalid-input case
5. Error-handling case
6. Existing-function regression
7. Data integrity
8. Backward compatibility
9. Equipment / operator safety（如适用）

使用以下格式：

AC01
Given:
When:
Then:

AC02
Given:
When:
Then:

不要使用“功能正常”“用户体验良好”“数据正确”之类无法直接判定的标准。

## 9. Verification Plan

明确：

- Build
- Unit tests
- Integration tests
- Functional tests
- Regression tests
- Manual tests
- Test data
- Expected results

如果某项不适用，请说明原因。

## 10. Rollback / Stop Conditions

说明：

- 哪些发现会导致计划失效
- 哪些情况必须停止实施并重新设计
- 如何撤销本功能修改
- 如何确保禁用新功能后原有功能仍可使用

## 11. Developer Handoff

最后生成一份可以直接交给 Claude Sonnet 5.5 的 Developer Handoff：

- Feature objective
- Scope and out-of-scope
- Existing architecture and integration point
- Existing files to modify
- New files to create
- Logic and components to reuse
- Required changes
- Must NOT change
- Ordered implementation steps
- Edge cases
- Acceptance criteria
- Verification steps
- Stop conditions

重要约束：

- 不修改任何业务代码。
- 不进行无关重构。
- 优先扩展现有架构，而不是重写现有逻辑。
- 优先复用现有代码，不复制已有业务逻辑。
- 不扩大需求范围。
- 保持向后兼容。
- 遵守 AGENTS.md 和项目规则文件。
```

---

## B3. Claude Sonnet 5.5：Feature 实施前的方案复述

### 使用时机

切换到 Sonnet 后，先要求它检查并复述 Opus 的方案。此时不能立即写代码。

### 提示词

```text
你现在负责实现本次新增功能。

请读取当前 Session 中：

1. GPT-6 Luna 的现有架构和接入点分析
2. Claude Opus 5.5 的 Feature Design
3. Modification Scope
4. Implementation Plan
5. Acceptance Criteria
6. Developer Handoff
7. AGENTS.md 和项目规则文件

暂时不要修改任何代码。

请先复述：

1. 新功能的用户目标和预期结果
2. 本次范围和明确排除的范围
3. 新功能在现有架构中的接入位置
4. 需要修改的现有文件、类和函数
5. 需要创建的新文件、类和函数
6. 必须复用的现有组件和业务逻辑
7. 哪些现有逻辑、接口、数据格式和功能绝对不能改变
8. 完整实施顺序
9. 主要边界情况和错误场景
10. 主要 regression risks
11. 全部 Acceptance Criteria
12. 完成后如何验证
13. 哪些情况出现时必须停止实施

特别检查：

- Opus 计划中的文件、类和函数是否真实存在
- 方案是否与当前项目结构一致
- 是否存在重复实现已有业务逻辑的情况
- 是否存在不必要的重构
- 是否存在超出本次需求范围的修改
- 是否存在接口或数据格式兼容性风险

如果无法获得 Opus 的完整方案，或者方案与当前实际代码明显冲突：

立即停止，不要修改代码，并报告：

- 缺失或冲突内容
- 相关代码证据
- 需要 Opus 重新确认的问题

不要自行重新设计另一套方案。
```

---

## B4. Claude Sonnet 5.5：确认后实施 Feature

### 使用方法

Sonnet 复述无误后，再发送以下提示词。

```text
确认。现在严格按照 Claude Opus 5.5 已确认的 Feature Design 和 Implementation Plan 实施新增功能。

执行规则：

1. 只实现本次定义范围内的功能。
2. 严格按照 Implementation Plan 的顺序执行。
3. 只修改计划允许修改的现有文件。
4. 只创建计划允许创建的新文件。
5. 优先复用现有代码、组件和数据结构。
6. 不复制已有业务逻辑。
7. 采用扩展方式实现，不重写已经正常工作的逻辑。
8. 不改变现有已经验证的功能。
9. 不进行无关重构。
10. 不自行增加需求、配置项或技术抽象。
11. 保持现有接口、数据格式和输出兼容。
12. 每完成一个关键步骤，检查是否仍符合 Acceptance Criteria。
13. 完成后执行计划中的 Build、Test 和 Verification。

如果实施过程中发现必须偏离 Opus 方案，立即停止并报告：

- 原计划是什么
- 实际代码中发现了什么
- 为什么无法继续按原计划实施
- 已经修改了哪些内容
- 建议 Opus 重新评估的问题

不要自行扩大修改范围或重新设计功能。

完成后按以下结构报告：

## Implementation Summary

- Created files
- Modified files
- Modified functions
- Reused existing components and logic
- New logic added
- Existing protected logic left unchanged

## Acceptance Criteria Results

逐项报告：

AC01: PASS / FAIL / NOT TESTED
Evidence:

AC02: PASS / FAIL / NOT TESTED
Evidence:

不得在没有执行验证时将验收项标记为 PASS。

## Test Results

- Build:
- Unit tests:
- Integration tests:
- Functional tests:
- Regression tests:
- Manual verification:

请提供执行的命令、结果摘要，以及失败项目的错误信息。

## Scope and Compatibility Check

- 是否只修改或创建了计划允许的文件：Yes / No
- 是否进行了计划外重构：Yes / No
- 是否复制了已有业务逻辑：Yes / No
- 是否改变了现有接口：Yes / No
- 是否改变了现有数据格式：Yes / No
- 是否影响了原有功能：Yes / No
- 是否保持向后兼容：Yes / No

## Remaining Issues

如果没有，明确写：None
```

---

# Part C：快速选择指南

| 任务阶段 | Bug 修复 | 新增 Feature |
|---|---|---|
| GPT-6 Luna | 找执行路径、证据和根因候选 | 找现有架构、接入点和可复用逻辑 |
| Claude Opus 5.5 | 确认根因、最小修复方案、AC | 设计集成方案、范围、边界、AC |
| Claude Sonnet 5.5 | 复述后按计划修复并验证 | 复述后按计划扩展并验证 |

## 简化决策

### 简单 Bug

```text
Luna 分析 → Sonnet 修复 → 测试
```

如果 Sonnet 连续两次无法解决，停止继续尝试，升级到 Opus：

```text
Luna → Sonnet → Retry → Stop → Opus 重新规划 → Sonnet 实施
```

### 高风险 Bug

涉及以下内容时，建议完整使用三模型：

- 核心业务逻辑
- PLC、设备通信或生产参数
- 数据映射或数据完整性
- 公共接口
- 多模块调用链
- 间歇性、状态性或并发问题

```text
Luna → Opus → Sonnet
```

### 简单 Feature

例如增加独立按钮、额外展示字段或不影响核心逻辑的导出选项，可以：

```text
Luna → Sonnet
```

### 复杂或高风险 Feature

涉及架构接入、核心数据流、设备参数、公共接口或多个模块时：

```text
Luna → Opus → Sonnet
```

---

# Part D：超短版模板

## Bug 修复

```text
Luna：读懂 Bug 的执行路径、证据、根因候选和影响范围，不改代码。

Opus：确认根因，定义最小修改范围、风险、验收标准和验证方案，不改代码。

Sonnet：先复述 Opus 计划；确认无误后严格实施，逐项报告 AC 的 PASS / FAIL 和证据。
```

## 新增 Feature

```text
Luna：读懂现有架构，找到合理接入点、可复用逻辑和必须保护的现有功能，不改代码。

Opus：设计集成方案、修改范围、新增文件、边界场景、风险、验收标准和验证方案，不改代码。

Sonnet：先复述 Opus 计划；确认无误后采用扩展而非重写的方式实施，逐项报告 AC 的 PASS / FAIL 和证据。
```

---

# Part E：核心口诀

```text
Bug：
Luna 找问题路径 → Opus 定根因与修复标准 → Sonnet 实施修复

Feature：
Luna 找接入点 → Opus 定设计与验收标准 → Sonnet 实施扩展
```

> **Luna 看懂，Opus 定方案和验收，Sonnet 落代码。**
