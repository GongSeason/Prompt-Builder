# 精简提示词（Bug / Feature 通用）

## P1 · GPT-6 Luna · 只读分析
```text
【Luna｜只读分析】任务类型：Bug / Feature
需求：…
期望结果：…
场景/约束：…（无则写“待分析”）

按 AGENTS.md 只读分析，不改代码、不出最终方案。
输出：相关文件/函数、现有数据流、Bug 根因候选或 Feature 接入点、可复用逻辑、必须保护的逻辑、影响范围、待确认问题（标明事实/推测）。
结尾：ANALYSIS COMPLETE
```

## P2 · Opus 5.5 · 设计计划
```text
【Opus｜设计计划】基于 Luna 分析复核代码（不盲信），不改代码。
输出：
1. 目标与范围（含不做什么）；Bug 写明根因
2. 修改文件/函数、新增文件（尽量无）、禁止修改项
3. 实施步骤（每步含编译检查点）
4. 边界情况与风险
5. AC：Given/When/Then，可判定，覆盖正常/边界/异常/回归/数据完整性
6. 验证方案、停止与回滚条件
7. Developer Handoff
会改变行为的问题列为“需用户确认”，其余采用合理默认并注明。
结尾：PLAN APPROVED 或 NEED USER INPUT
```

## P2b · Opus 5.5 · 落代码前补充/调整需求
```text
【Opus｜需求补充】
1. …
2. …
只更新受影响部分，其余保持不变，不改代码。
输出：变更对照（旧→新）+ Updated Developer Handoff。
结尾：PLAN APPROVED
```

## P3 · Sonnet 5.5 · 实施前复核
```text
【Sonnet｜实施前复核】读取最新 Developer Handoff，先不改代码。
用实际代码核对：文件/函数/API 是否存在、调用关系、依赖、范围、AC 可测性。
- 无问题：简述步骤与 AC → PLAN STATUS: READY TO IMPLEMENT
- 有设计级问题：逐项给出 原计划 / 代码证据 / 冲突与影响 / 需 Opus 决定什么 → PLAN STATUS: REVIEW REQUIRED
不要自行修改方案。
```

## P4 · Opus 5.5 · 裁决（REVIEW REQUIRED 或 BLOCKED）
```text
【Opus｜裁决】审查 Sonnet 最新报告并复核代码，不改代码。
每项：ACCEPT / REJECT / PARTIAL + 证据 + 对计划的影响。
若为 BLOCKED：说明已改代码 KEEP / ROLLBACK。
只改受影响部分。输出 PLAN DECISION: ORIGINAL PLAN CONFIRMED 或 PLAN UPDATED + Updated Developer Handoff。
```
裁决后切回 Sonnet，再发 P3。

## P5 · Sonnet 5.5 · 实施
```text
【Sonnet｜实施】确认。按最新 Developer Handoff 逐步实施，每步编译。
遇设计级冲突立即停止 → IMPLEMENTATION STATUS: BLOCKED（当前步骤 / 代码证据 / 已改内容 / 需决定事项）。
完成后输出：
- IMPLEMENTATION STATUS: COMPLETED / FAILED
- 改动文件与函数
- 每条 AC：PASS / FAIL / NOT TESTED + 证据
- 构建命令与 warnings（对比基线）
- 范围检查（越权文件 / 重构 / 接口或格式变化）
- 未验证 AC 的手动测试步骤、遗留问题
```


# AGENTS.md 三模型协作规则（一次性写入项目）

```markdown
## 三模型协作规则
- 角色：Luna 只读分析；Opus 设计/计划/AC/裁决，不改代码；Sonnet 复核计划后实施。
- 同一 Session 用 /model 切换，不 /new；以最新 Developer Handoff 为准，不恢复被否决的旧方案。
- 权限：编码细节（命名、局部写法、风格）由 Sonnet 决定；范围、架构、业务逻辑、接口、数据/配置格式、AC、PLC/设备安全由 Opus 决定。Sonnet 可用代码证据质疑，不得自行改方案。
- 修改：最小改动；只改授权文件；不做无关重构、不升级依赖；Feature 扩展复用不重写，Bug 修根因不打补丁。
- Git：实施前 git status，不覆盖已有改动；未授权不 commit/push/建删分支。
- 验证：按步骤编译；warnings 与基线对比；未实际执行的 AC 只能标 NOT TESTED；无法自动验证的 AC 给出手动测试步骤。
- 状态词：ANALYSIS COMPLETE / PLAN APPROVED / NEED USER INPUT / PLAN STATUS: READY TO IMPLEMENT / PLAN STATUS: REVIEW REQUIRED / PLAN DECISION: PLAN UPDATED / PLAN DECISION: ORIGINAL PLAN CONFIRMED / IMPLEMENTATION STATUS: COMPLETED / FAILED / BLOCKED
```
