# GitLab Duo CLI 分歧处理流程与完整提示词

> 适用场景：GPT-6 Luna 完成代码分析、Claude Opus 5.5 完成设计和计划后，Claude Sonnet 5.5 在复述或实施阶段对计划产生疑问。
>
> 核心原则：**Sonnet 有权使用实际代码证据质疑计划，但无权擅自改变计划。Coding Choice 由 Sonnet 决定，Design Choice 必须交回 Opus 裁决。**

---

## 1. 标准分歧处理流程

```text
GPT-6 Luna
代码分析
    ↓
Claude Opus 5.5
设计 + Implementation Plan + Acceptance Criteria
    ↓
Claude Sonnet 5.5
方案复述 + Implementation Feasibility Check
    ↓
是否存在设计级疑问？
    ├─ No  → READY TO IMPLEMENT → 开始实施
    └─ Yes → REVIEW REQUIRED
                   ↓
             切回 Opus 5.5
             审查代码证据并裁决
                   ↓
             ORIGINAL PLAN CONFIRMED
             或 PLAN UPDATED
                   ↓
             切回 Sonnet 5.5
             复述最终方案
                   ↓
             READY TO IMPLEMENT
                   ↓
                  实施
                   ↓
          是否发现新的实施阻塞？
             ├─ No  → 测试和验收
             └─ Yes → IMPLEMENTATION STATUS: BLOCKED
                              ↓
                         切回 Opus 裁决
                              ↓
                         Sonnet 恢复实施
```

### Session 规则

- 尽量在同一个 GitLab Duo CLI Session 中操作。
- 使用 `/model` 切换模型。
- 分歧处理过程中不要使用 `/new`。
- 每次切换后，先要求当前模型读取最新的分析、裁决和 Handoff。
- 如果上下文过长，应把最新方案保存为 Markdown，并明确以最新版本为准。

---

# Prompt 1：Sonnet 5.5 实施前 Plan Review

切换到 Claude Sonnet 5.5：

```text
/model
```

选择 Claude Sonnet 5.5，然后复制以下提示词：

```text
你现在是本任务的 Implementation Engineer。

请读取当前 Session 中：

1. GPT-6 Luna 的代码分析
2. Claude Opus 5.5 的最终设计方案
3. Modification Scope
4. Implementation Plan
5. Acceptance Criteria
6. Developer Handoff
7. AGENTS.md 和其他项目规则文件

当前阶段是：

PLAN REVIEW / IMPLEMENTATION FEASIBILITY CHECK

暂时不要修改任何代码。

--------------------------------------------------
A. 首先复述你理解的最终方案
--------------------------------------------------

请总结：

1. Objective / Root Cause
2. Feature Scope 或 Bug Scope
3. 需要修改的文件
4. 需要修改的类和函数
5. 需要新增的文件、类或函数（如有）
6. 必须复用的现有业务逻辑
7. Must NOT Change 的代码、接口、数据结构和业务规则
8. Implementation Steps
9. Regression Risks
10. Acceptance Criteria
11. Verification Plan

--------------------------------------------------
B. Implementation Feasibility Check
--------------------------------------------------

然后根据实际代码逐项验证：

1. Opus 指定的文件是否真实存在
2. 指定的类和函数是否真实存在
3. 调用关系是否与实际代码一致
4. 输入、输出和数据结构是否与计划一致
5. 接口和数据流是否与计划一致
6. 是否遗漏必要依赖或调用方
7. 是否遗漏必须同步修改的位置
8. 是否会破坏现有业务逻辑
9. 是否存在无法按照计划执行的步骤
10. Acceptance Criteria 是否可以按照当前设计验证
11. 是否存在已经可以复用、但 Plan 却准备重新实现的逻辑
12. 是否存在不必要的重构
13. 是否存在超出当前任务范围的修改

--------------------------------------------------
C. Decision
--------------------------------------------------

如果没有发现会影响正确实施的问题：

输出：

PLAN STATUS: READY TO IMPLEMENT

然后：

1. 简要复述最终实施步骤
2. 等待我的实施指令
3. 不要立即修改代码

如果发现问题：

输出：

PLAN STATUS: REVIEW REQUIRED

不要修改任何代码。

针对每一个问题生成：

## Issue 1

Original Plan:
Opus 原计划是什么。

Actual Code Evidence:
- File:
- Class:
- Function:
- Relevant code behavior:

Conflict:
实际代码与原计划冲突在哪里。

Impact:
如果继续执行原计划会产生什么影响。

Issue Type:
从下面选择：
- Modification Scope
- Architecture
- Business Logic
- Interface
- Data Structure
- Acceptance Criteria
- Regression Risk
- Missing Dependency
- Other

Question for Opus:
需要架构模型明确决定什么。

Suggested Direction:
如果你认为存在合理方向，可以提出建议，
但这只是建议，不是新的 Implementation Plan。

Confidence:
High / Medium / Low

如果存在多个问题，继续输出 Issue 2、Issue 3……

--------------------------------------------------
D. Decision Authority Rules
--------------------------------------------------

你可以自行决定 implementation-level coding details，例如：

- 局部变量命名
- private helper 的合理位置
- 与当前项目一致的 coding style
- 明确且不涉及架构变化的局部实现细节

但是以下情况禁止自行决定，必须输出 REVIEW REQUIRED：

1. 需要增加 Opus 未授权修改的文件
2. 需要改变架构
3. 需要改变业务逻辑
4. 需要改变 public interface
5. 需要改变数据结构或数据格式
6. 需要改变已有 API
7. 需要改变数据库、CSV、JSON 或配置格式
8. 需要改变设备或 PLC 交互逻辑
9. 需要改变现有功能行为
10. Acceptance Criteria 无法按照原方案满足
11. 需要进行计划外重构
12. 实际代码证据证明 Opus 的核心假设错误

原则：

Coding Choice → 你可以决定
Design Choice → 必须交回 Opus

你可以质疑 Opus，
但不能自行修改 Opus 的设计决策。

发现设计级冲突时必须停止。
```

---

# Prompt 2：Sonnet 发现问题后切回 Opus 裁决

当 Sonnet 输出：

```text
PLAN STATUS: REVIEW REQUIRED
```

不要让 Sonnet 继续写代码。使用 `/model` 切换到 Claude Opus 5.5，然后复制：

```text
Sonnet 5.5 在 Implementation Feasibility Check 中发现了当前 Implementation Plan 可能存在问题。

请读取当前 Session 中 Sonnet 最新输出的：

PLAN STATUS: REVIEW REQUIRED

以及全部：

Plan Review Report / Issue Reports

你现在重新作为 Technical Architect 对这些问题进行裁决。

当前阶段：

PLAN REVIEW DECISION

不要修改任何代码。

--------------------------------------------------
A. Review Sonnet Evidence
--------------------------------------------------

针对 Sonnet 提出的每一个 Issue：

1. 检查 Sonnet 提供的代码证据
2. 重新检查相关源代码
3. 检查原 Implementation Plan
4. 判断 Sonnet 的理解是否正确
5. 判断原 Plan 是否确实存在遗漏或错误

不要因为 Sonnet 提出质疑就自动接受它的建议。

必须以实际代码证据为依据。

--------------------------------------------------
B. Decision
--------------------------------------------------

针对每一个 Issue 输出：

## Issue X Decision

Decision:

只能选择：

- ACCEPT SONNET FINDING
- REJECT SONNET FINDING
- PARTIALLY ACCEPT

Evidence:
实际代码依据。

Reason:
为什么接受、拒绝或部分接受。

Impact on Original Plan:
该发现是否影响原计划，以及影响哪些具体 Steps。

--------------------------------------------------
C. Update Plan Only If Necessary
--------------------------------------------------

如果所有 Issue 都不需要改变原计划：

输出：

PLAN DECISION: ORIGINAL PLAN CONFIRMED

然后明确：

- 原 Implementation Plan 是否保持不变
- Sonnet 应该如何正确理解原计划
- 是否需要补充说明

如果一个或多个 Issue 确实要求修改计划：

输出：

PLAN DECISION: PLAN UPDATED

然后生成：

## Updated Modification Scope

只修改受到新证据影响的范围。

## Updated Implementation Steps

明确指出：

Original Step:
...

Updated Step:
...

## Updated Must NOT Change

如果保护范围发生变化，明确更新。

## Updated Risks

只增加或修改受到影响的风险。

## Updated Acceptance Criteria

只有在新证据导致原 AC 不准确或不可执行时才修改。

未受影响的 AC 必须继续保持。

## Updated Verification Plan

如果验证方法需要变化，则明确更新。

--------------------------------------------------
D. Minimal Plan Change Rule
--------------------------------------------------

不要因为一个局部问题重新设计整个 Feature 或 Bug Fix。

遵循：

Plan V1
→ New Code Evidence
→ Minimal Correction
→ Plan V1.1

而不是：

Plan V1
→ Local Issue
→ Full Redesign

已经确认且未受到新证据影响的部分保持不变。

--------------------------------------------------
E. Updated Developer Handoff
--------------------------------------------------

最后重新生成：

## Updated Developer Handoff

包含：

- Final Objective / Root Cause
- Final Modification Scope
- Files to Modify
- Files to Create
- Functions to Modify
- Required Changes
- Must NOT Change
- Final Implementation Steps
- Acceptance Criteria
- Verification Steps
- Stop Conditions

这个 Handoff 是下一步 Sonnet 5.5 的最新执行基准。

如果新 Handoff 与旧 Handoff 冲突：

以最新版本为准。

重要约束：

- 不修改任何代码
- 不扩大原任务范围
- 不进行无关重构
- 保留所有未受影响的原计划
- 只根据实际代码证据修改计划
```

---

# Prompt 3：切回 Sonnet 确认 Opus 裁决

使用 `/model` 切回 Claude Sonnet 5.5，然后复制：

```text
请读取当前 Session 中 Opus 5.5 最新的：

1. Issue Decisions
2. PLAN DECISION
3. Updated Modification Scope（如有）
4. Updated Implementation Steps（如有）
5. Updated Acceptance Criteria（如有）
6. Updated Developer Handoff

暂时不要修改代码。

--------------------------------------------------
A. Review Opus Decision
--------------------------------------------------

请逐项确认你之前提出的问题：

Issue 1:
- Opus Decision:
- ACCEPT / REJECT / PARTIALLY ACCEPT
- 是否已经解决：YES / NO

Issue 2:
...

--------------------------------------------------
B. Confirm Final Plan
--------------------------------------------------

然后复述目前最终有效版本：

1. Final Objective / Root Cause
2. Final Modification Scope
3. Files to Modify
4. Files to Create
5. Functions to Modify
6. Required Changes
7. Must NOT Change
8. Final Implementation Steps
9. Final Acceptance Criteria
10. Final Verification Plan

注意：

如果 Opus 更新了计划，
以最新 Updated Developer Handoff 为准。

不要继续使用已经被 Opus 修改、替代或否决的旧方案。

--------------------------------------------------
C. Final Status
--------------------------------------------------

如果之前所有影响实施的问题都已经得到解决：

输出：

PLAN STATUS: READY TO IMPLEMENT

然后等待实施命令。

不要立即修改代码。

如果仍然存在会阻止正确实施的技术冲突：

输出：

PLAN STATUS: REVIEW REQUIRED

然后只列出：

1. 尚未解决的问题
2. 新发现的代码证据
3. 为什么问题会阻止实施
4. 需要 Opus 决定什么

不要重复已经解决的问题。

不要因为意见不同而反复挑战已经有代码证据支持的 Opus 决定。

只有存在新的实际代码证据，
或者仍然存在无法执行的技术冲突时，
才能再次要求 REVIEW。

不要修改代码。
不要自行重新设计方案。
```

---

# Prompt 4：READY 后正式开始编码

只有当 Sonnet 输出：

```text
PLAN STATUS: READY TO IMPLEMENT
```

才复制下面的实施提示词：

```text
确认。

现在开始实施。

请严格按照 Opus 5.5 最新确认的：

- Implementation Plan
- Modification Scope
- Acceptance Criteria
- Verification Plan
- Updated Developer Handoff

执行。

如果最新 Plan 与旧 Plan 存在差异：

以 Opus 最新确认版本为准。

不得恢复已经被 Opus 否决、修改或替代的旧方案。

--------------------------------------------------
IMPLEMENTATION RULES
--------------------------------------------------

1. 严格控制修改范围。
2. 只修改最终 Plan 授权的文件和函数。
3. 只创建最终 Plan 授权的新文件。
4. 不修改无关代码。
5. 不进行无关重构。
6. 不扩大 Feature / Bug 范围。
7. 保留已经正常工作的现有业务逻辑。
8. 优先复用现有实现。
9. Feature 优先采用扩展，而不是重写。
10. Bug 优先采用最小修复。
11. 不自行改变接口、数据结构或数据格式。
12. 不自行改变 Acceptance Criteria。
13. 不为了让测试通过而删除现有校验或保护逻辑。

按照 Implementation Plan 的 Step 顺序执行。

--------------------------------------------------
IF A NEW CONFLICT IS FOUND
--------------------------------------------------

如果实施过程中发现新的代码证据，导致当前 Plan 无法安全或正确继续执行：

立即停止进一步修改。

不要自行重新设计。

输出：

IMPLEMENTATION STATUS: BLOCKED

## Current Step

当前执行到哪个 Implementation Step。

## New Finding

发现了什么。

## Code Evidence

- File:
- Class:
- Function:
- Actual behavior:

## Conflict With Plan

实际代码与 Opus 的方案冲突在哪里。

## Impact

如果继续实施可能造成什么问题。

## Changes Already Made

列出已经修改的内容。

## Rollback Assessment

说明：

- 当前修改是否需要回滚
- 是否可以安全保留
- 原因

不要自行执行超出 Plan 的额外修改。

## Decision Required From Opus

明确说明需要 Opus 决定什么。

然后停止实施并等待 Architecture Review。

--------------------------------------------------
IF IMPLEMENTATION COMPLETES
--------------------------------------------------

如果没有出现 blocker，则完成代码修改并执行 Verification Plan。

最后输出：

## IMPLEMENTATION STATUS

COMPLETED
或
FAILED

## Implementation Summary

- Created files
- Modified files
- Modified functions
- Reused existing logic
- New logic added
- Protected logic left unchanged

## Acceptance Criteria

逐项：

AC01: PASS / FAIL / NOT TESTED
Evidence:

AC02: PASS / FAIL / NOT TESTED
Evidence:

AC03: PASS / FAIL / NOT TESTED
Evidence:

禁止把未实际验证的 AC 标记为 PASS。

## Test Results

- Build:
- Unit Tests:
- Integration Tests:
- Functional Tests:
- Regression Tests:
- Manual Verification:

给出实际执行的命令和结果摘要。

## Scope Check

- Unauthorized files modified: YES / NO
- Unplanned refactoring: YES / NO
- Existing interface changed: YES / NO
- Existing data format changed: YES / NO
- Existing business logic unintentionally changed: YES / NO

## Remaining Issues

如果没有：

None
```

---

# Prompt 5：实施中 BLOCKED 后切回 Opus

如果 Sonnet 输出：

```text
IMPLEMENTATION STATUS: BLOCKED
```

立即停止 Sonnet，使用 `/model` 切换到 Claude Opus 5.5，然后复制：

```text
Sonnet 5.5 在按照已批准的 Implementation Plan 实施过程中发现了新的代码证据，并已停止实施。

请读取最新：

IMPLEMENTATION STATUS: BLOCKED

以及：

- Current Step
- New Finding
- Code Evidence
- Conflict With Plan
- Impact
- Changes Already Made
- Rollback Assessment
- Decision Required From Opus

你现在作为 Technical Architect 进行 Implementation Blocker Review。

不要修改代码。

请判断：

1. Sonnet 的新发现是否正确。
2. 是否确实与当前 Plan 冲突。
3. 当前已经完成的代码修改能否保留。
4. 是否需要局部回滚。
5. 是否需要修改 Implementation Plan。
6. 是否需要修改 Acceptance Criteria。
7. 是否出现了超出原任务范围的问题。

输出：

## BLOCKER DECISION

选择：

- RESUME WITH ORIGINAL PLAN
- RESUME WITH UPDATED PLAN
- ROLLBACK PARTIAL CHANGES
- STOP AND REPLAN

## Evidence

说明代码依据。

## Current Changes Decision

针对 Sonnet 已经修改的内容分别说明：

KEEP:
...

ROLLBACK:
...

## Updated Plan

如果需要调整，只修改受新证据影响的 Step。

不要重新设计不受影响的部分。

## Acceptance Criteria Impact

明确：

UNCHANGED

或列出需要修改的 AC 及原因。

## Updated Developer Handoff

生成 Sonnet 恢复实施所需要的最新 Handoff。

重要：

- 采用最小修改原则
- 不扩大任务范围
- 不进行无关重构
- 已确认且未受影响的设计继续保持
- 不修改业务代码
```

Opus 完成 Blocker Review 后，切回 Sonnet，重新执行：

1. Prompt 3：确认 Opus 最新裁决
2. 等待 `PLAN STATUS: READY TO IMPLEMENT`
3. Prompt 4：恢复实施

---

# 2. 哪些问题由 Sonnet 自己决定

以下通常属于 implementation-level coding choices，只要不影响架构、范围或功能行为，Sonnet 可以依据现有项目风格直接处理：

- 局部变量命名
- private helper 的位置
- 明确的格式和 coding style
- 不改变接口的局部代码组织
- 使用项目中已经存在的相同 coding pattern
- 明确且不改变行为的小型空值保护

原则：

```text
Coding Choice → Sonnet 决定
Design Choice → Opus 决定
```

---

# 3. 哪些问题必须切回 Opus

## 3.1 修改范围变化

例如 Opus 只授权修改 `A.cs`，但 Sonnet 发现必须同时修改 `B.cs`。

## 3.2 架构变化

例如 Opus 认为调用关系是：

```text
UI → Service
```

但 Sonnet 从代码确认实际为：

```text
UI → Controller → Service
```

## 3.3 业务逻辑变化

例如修复计算逻辑会同时改变 PLC 写入时机、设备互锁条件或操作员确认流程。

## 3.4 接口或数据结构变化

包括：

- 增加或删除公共字段
- 修改 API
- 修改 CSV 列
- 修改 JSON 格式
- 修改数据库结构
- 修改配置格式

## 3.5 Acceptance Criteria 无法满足

例如 AC 要求原有功能保持不变，但按照现有方案实施必然改变原有功能行为。

## 3.6 计划外重构

如果必须重构多个模块才能继续，不应由 Sonnet 自行扩大范围。

---

# 4. 状态机速查表

| 状态 | 含义 | 下一步 |
|---|---|---|
| `PLAN STATUS: READY TO IMPLEMENT` | 方案与实际代码一致，可以实施 | 向 Sonnet 发送正式实施 Prompt |
| `PLAN STATUS: REVIEW REQUIRED` | 实施前发现设计级冲突 | 切换到 Opus 进行 Plan Review Decision |
| `PLAN DECISION: ORIGINAL PLAN CONFIRMED` | Opus 确认原计划正确 | 切回 Sonnet 复述并等待 READY |
| `PLAN DECISION: PLAN UPDATED` | Opus 根据证据局部修订计划 | 切回 Sonnet 复述最新方案 |
| `IMPLEMENTATION STATUS: BLOCKED` | 实施途中遇到新的计划冲突 | 停止编码并切换到 Opus |
| `RESUME WITH ORIGINAL PLAN` | 按原计划恢复实施 | 切回 Sonnet 确认后继续 |
| `RESUME WITH UPDATED PLAN` | 按更新后的计划恢复 | 切回 Sonnet 复述最新方案后继续 |
| `ROLLBACK PARTIAL CHANGES` | 已实施部分需要局部回滚 | Sonnet 按 Opus 指定范围回滚 |
| `STOP AND REPLAN` | 原计划已无法安全使用 | Opus 重新规划，Sonnet 不得继续 |

---

# 5. 建议加入 AGENTS.md 的全局规则

```text
## Decision Authority and Plan Escalation

Implementation-level coding choices may be decided by the implementation model when they do not change architecture, approved scope, business behavior, interfaces, data structures, acceptance criteria, or validated existing behavior.

Design-level decisions that affect architecture, modification scope, business logic, public interfaces, data structures, data formats, acceptance criteria, equipment interaction, production behavior, or existing validated functionality must be escalated to the planning model.

The implementation model may challenge an approved plan using concrete code evidence, but it must not silently redesign, expand, or replace the approved plan.

Before implementation, the implementation model must perform an Implementation Feasibility Check.

If a design-level conflict is found before coding, it must output:

PLAN STATUS: REVIEW REQUIRED

If a new design-level conflict is found during implementation, it must stop further changes and output:

IMPLEMENTATION STATUS: BLOCKED

The implementation model must not continue until the planning model has reviewed the evidence and issued a confirmed or updated Developer Handoff.

When a plan is updated, the latest approved Developer Handoff takes precedence over all earlier versions.

Plan corrections must follow the minimum-change principle. Unaffected and previously approved parts of the plan must remain unchanged.
```

---

# 6. 最简操作口诀

```text
Sonnet 没疑问：
READY → 实施

Sonnet 有疑问：
REVIEW REQUIRED → 切 Opus 裁决

Opus 裁决完成：
切回 Sonnet → 复述最新计划 → READY → 实施

实施中遇到新冲突：
BLOCKED → 停止 → 切 Opus 裁决 → Sonnet 恢复
```

> **Sonnet 可以依据代码提出异议，但不能静默改变设计；Opus 可以修订方案，但只能修改被新证据影响的部分。**
