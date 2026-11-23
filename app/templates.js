(function (global) {
  "use strict";

  const DEFAULT_MODELS = Object.freeze({
    analyst: "Luna",
    planner: "Opus",
    implementer: "Sonnet"
  });

  const STEPS = Object.freeze({
    P1: { title: "P1 · GPT-6 Luna · 只读分析", role: "分析模型", when: "Bug 或 Feature 开始时：只读分析，不修改代码。" },
    P2: { title: "P2 · Opus 5.5 · 设计计划", role: "计划模型", when: "分析完成后：设计范围、实施步骤和验收标准。" },
    P2b: { title: "P2b · Opus 5.5 · 需求补充", role: "计划模型", when: "计划需要补充或调整需求时使用。" },
    P3: { title: "P3 · Sonnet 5.5 · 实施前复核", role: "实施模型", when: "计划已批准后：先核对方案，不立即改代码。" },
    P4: { title: "P4 · Opus 5.5 · 分歧裁决", role: "计划模型", when: "P3 需要复核或实施中遇到阻塞时使用。" },
    P5: { title: "P5 · Sonnet 5.5 · 实施", role: "实施模型", when: "P3 输出 READY TO IMPLEMENT 后使用。" },
    AGENTS: { title: "AGENTS.md · 三模型协作规则", role: "规则内容", when: "复制规则，或写入用户选择的 AGENTS.md。" }
  });

  const PROMPTS = Object.freeze({
    P1: "【{{analyst}}｜只读分析】任务类型：{{taskType}}\n需求：{{requirement}}\n期望结果：{{expected}}\n场景/约束：{{constraints}}\n\n按 AGENTS.md 只读分析，不改代码、不出最终方案。\n输出：相关文件/函数、现有数据流、Bug 根因候选或 Feature 接入点、可复用逻辑、必须保护的逻辑、影响范围、待确认问题（标明事实/推测）。\n结尾：ANALYSIS COMPLETE",
    P2: "【{{planner}}｜设计计划】基于 {{analyst}} 分析复核代码（不盲信），不改代码。\n输出：\n1. 目标与范围（含不做什么）；Bug 写明根因\n2. 修改文件/函数、新增文件（尽量无）、禁止修改项\n3. 实施步骤（每步含编译检查点）\n4. 边界情况与风险\n5. AC：Given/When/Then，可判定，覆盖正常/边界/异常/回归/数据完整性\n6. 验证方案、停止与回滚条件\n7. Developer Handoff\n会改变行为的问题列为“需用户确认”，其余采用合理默认并注明。\n结尾：PLAN APPROVED 或 NEED USER INPUT",
    P2b: "【{{planner}}｜需求补充】\n{{items}}\n只更新受影响部分，其余保持不变，不改代码。\n输出：变更对照（旧→新）+ Updated Developer Handoff。\n结尾：PLAN APPROVED",
    P3: "【{{implementer}}｜实施前复核】读取最新 Developer Handoff，先不改代码。\n用实际代码核对：文件/函数/API 是否存在、调用关系、依赖、范围、AC 可测性。\n- 无问题：简述步骤与 AC → PLAN STATUS: READY TO IMPLEMENT\n- 有设计级问题：逐项给出 原计划 / 代码证据 / 冲突与影响 / 需 {{planner}} 决定什么 → PLAN STATUS: REVIEW REQUIRED\n不要自行修改方案。",
    P4: "【{{planner}}｜裁决】审查 {{implementer}} 最新报告并复核代码，不改代码。\n每项：ACCEPT / REJECT / PARTIAL + 证据 + 对计划的影响。\n若为 BLOCKED：说明已改代码 KEEP / ROLLBACK。\n只改受影响部分。输出 PLAN DECISION: ORIGINAL PLAN CONFIRMED 或 PLAN UPDATED + Updated Developer Handoff。",
    P5: "【{{implementer}}｜实施】确认。按最新 Developer Handoff 逐步实施，每步编译。\n遇设计级冲突立即停止 → IMPLEMENTATION STATUS: BLOCKED（当前步骤 / 代码证据 / 已改内容 / 需决定事项）。\n完成后输出：\n- IMPLEMENTATION STATUS: COMPLETED / FAILED\n- 改动文件与函数\n- 每条 AC：PASS / FAIL / NOT TESTED + 证据\n- 构建命令与 warnings（对比基线）\n- 范围检查（越权文件 / 重构 / 接口或格式变化）\n- 未验证 AC 的手动测试步骤、遗留问题"
  });

  const AGENTS_RULES = "## 三模型协作规则\n- 角色：{{analyst}} 只读分析；{{planner}} 设计/计划/AC/裁决，不改代码；{{implementer}} 复核计划后实施。\n- 同一 Session 用 /model 切换，不 /new；以最新 Developer Handoff 为准，不恢复被否决的旧方案。\n- 权限：编码细节（命名、局部写法、风格）由 {{implementer}} 决定；范围、架构、业务逻辑、接口、数据/配置格式、AC、PLC/设备安全由 {{planner}} 决定。{{implementer}} 可用代码证据质疑，不得自行改方案。\n- 修改：最小改动；只改授权文件；不做无关重构、不升级依赖；Feature 扩展复用不重写，Bug 修根因不打补丁。\n- Git：实施前 git status，不覆盖已有改动；未授权不 commit/push/建删分支。\n- 验证：按步骤编译；warnings 与基线对比；未实际执行的 AC 只能标 NOT TESTED；无法自动验证的 AC 给出手动测试步骤。\n- 状态词：ANALYSIS COMPLETE / PLAN APPROVED / NEED USER INPUT / PLAN STATUS: READY TO IMPLEMENT / PLAN STATUS: REVIEW REQUIRED / PLAN DECISION: PLAN UPDATED / PLAN DECISION: ORIGINAL PLAN CONFIRMED / IMPLEMENTATION STATUS: COMPLETED / FAILED / BLOCKED";

  const DOC_RULES = Object.freeze({
    common: "文档落盘（项目根目录下 {{docsRoot}}/）：\n- 写入：{{stepLine}}\n- 只写上列文档，不改其他文件；PLAN.md、ACCEPTANCE.md、REQUIREMENTS.md、handoff/HANDOFF_latest.md 为规范文件，按要求原位更新；带日期的文件已存在时追加 _2、_3，不覆盖；不确定内容标“待确认”。",
    readOnlyFallback: "- 若当前为只读/Plan 模式无法写文件：在输出末尾列出“待落盘文件”（路径 + 完整内容），由 {{implementer}} 在 P3 开始时写入。",
    steps: Object.freeze({
      P1: "{{docsRoot}}/analysis/{{date}}_analysis.md（分析全文）",
      P2: "{{docsRoot}}/PLAN.md（目标/范围/步骤/风险）、{{docsRoot}}/ACCEPTANCE.md（AC 与验证方案）、{{docsRoot}}/handoff/HANDOFF_latest.md（Developer Handoff）",
      P2b: "{{docsRoot}}/REQUIREMENTS.md（追加本次需求）、{{docsRoot}}/PLAN.md（追加变更对照与版本摘要）、{{docsRoot}}/handoff/HANDOFF_latest.md（整份替换为最新版）；AC 受影响时同步更新 {{docsRoot}}/ACCEPTANCE.md",
      P3: "先将上一阶段“待落盘文件”写入对应路径；复核结论写入 {{docsRoot}}/review/{{date}}_plan-review.md（写文档不算改代码）",
      P4: "{{docsRoot}}/review/{{date}}_decision.md；若为 PLAN UPDATED，同步更新 {{docsRoot}}/PLAN.md 与 {{docsRoot}}/handoff/HANDOFF_latest.md；AC 受影响时同步更新 {{docsRoot}}/ACCEPTANCE.md",
      P5: "{{docsRoot}}/handoff/{{date}}_implementation-report.md；更新 {{docsRoot}}/ACCEPTANCE.md 结果表（仅有证据的项可记 PASS）"
    }),
    agentsLine: "- 文档：阶段产物写入 {{docsRoot}}/（各提示词已注明路径）；只读模式输出“待落盘文件”，由 {{implementer}} 写入；以 handoff/HANDOFF_latest.md 为最新基准。"
  });

  const STATUS_OPTIONS = Object.freeze({
    P1: [{ value: "ANALYSIS COMPLETE", next: "P2", model: "planner" }],
    P2: [
      { value: "PLAN APPROVED", next: "P3", model: "implementer" },
      { value: "NEED USER INPUT", next: "P2b", model: "planner" }
    ],
    P2b: [{ value: "PLAN APPROVED", next: "P3", model: "implementer" }],
    P3: [
      { value: "PLAN STATUS: READY TO IMPLEMENT", next: "P5", model: "implementer" },
      { value: "PLAN STATUS: REVIEW REQUIRED", next: "P4", model: "planner" }
    ],
    P4: [
      { value: "PLAN DECISION: ORIGINAL PLAN CONFIRMED", next: "P3", model: "implementer" },
      { value: "PLAN DECISION: PLAN UPDATED", next: "P3", model: "implementer" }
    ],
    P5: [
      { value: "IMPLEMENTATION STATUS: COMPLETED", terminal: "completed" },
      { value: "IMPLEMENTATION STATUS: FAILED", terminal: "failed" },
      { value: "IMPLEMENTATION STATUS: BLOCKED", next: "P4", model: "planner" }
    ]
  });

  global.PromptTemplates = Object.freeze({ DEFAULT_MODELS, STEPS, PROMPTS, AGENTS_RULES, DOC_RULES, STATUS_OPTIONS });
})(window);
