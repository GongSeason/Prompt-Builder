(function (global) {
  "use strict";

  const T = global.PromptTemplates;
  const STORAGE_KEY = "duo-prompt-builder-v1";
  const DEFAULT_STATE = {
    models: { ...T.DEFAULT_MODELS },
    docRules: true,
    docsRoot: "docs",
    currentStep: "P1",
    forms: {
      P1: { taskType: "Bug", requirement: "", expected: "", constraints: "" },
      P2b: { items: ["", ""] }
    },
    contexts: {},
    statuses: {}
  };

  function mergeState(saved) {
    const state = {
      ...DEFAULT_STATE,
      models: { ...T.DEFAULT_MODELS, ...(saved && saved.models || {}) },
      docRules: saved && typeof saved.docRules === "boolean" ? saved.docRules : DEFAULT_STATE.docRules,
      docsRoot: saved && typeof saved.docsRoot === "string" ? saved.docsRoot : DEFAULT_STATE.docsRoot,
      currentStep: saved && T.STEPS[saved.currentStep] ? saved.currentStep : "P1",
      forms: {
        P1: { ...DEFAULT_STATE.forms.P1, ...(saved && saved.forms && saved.forms.P1 || {}) },
        P2b: { ...DEFAULT_STATE.forms.P2b, ...(saved && saved.forms && saved.forms.P2b || {}) }
      },
      contexts: { ...(saved && saved.contexts || {}) },
      statuses: { ...(saved && saved.statuses || {}) }
    };
    if (!Array.isArray(state.forms.P2b.items)) state.forms.P2b.items = ["", ""];
    if (!["Bug", "Feature"].includes(state.forms.P1.taskType)) state.forms.P1.taskType = "Bug";
    return state;
  }

  function getP1FieldValues(form) {
    const values = form || {};
    return {
      "task-type": values.taskType,
      requirement: values.requirement,
      expected: values.expected,
      constraints: values.constraints
    };
  }

  function substituteRoles(text, models) {
    return text
      .replaceAll("{{analyst}}", String(models.analyst ?? ""))
      .replaceAll("{{planner}}", String(models.planner ?? ""))
      .replaceAll("{{implementer}}", String(models.implementer ?? ""));
  }

  function normalizeDocsRoot(input) {
    let value = String(input ?? "").trim().replace(/\\/g, "/");
    while (value.startsWith("./")) value = value.slice(2);
    value = value.replace(/\/+$/g, "");

    if (!value || value === ".") {
      return { value: "docs", notice: "文档根目录为空或为当前目录，已使用默认 docs。" };
    }
    if (value.startsWith("/") || value.startsWith("~") || /^[A-Za-z]:/.test(value) || value.split("/").includes("..")) {
      return { value: "docs", notice: "文档根目录必须是项目根目录内的相对路径，已使用默认 docs。" };
    }
    return { value, notice: "" };
  }

  function getLocalDate(date) {
    const value = date instanceof Date ? date : new Date();
    const year = String(value.getFullYear()).padStart(4, "0");
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function buildDocRules(step, models, options) {
    if (!options || options.docRules !== true) return "";
    const normalizedRoot = normalizeDocsRoot(options.docsRoot).value;
    if (step === "AGENTS") {
      return substituteRoles(T.DOC_RULES.agentsLine.replace("{{docsRoot}}", normalizedRoot), models);
    }
    const stepLine = T.DOC_RULES.steps[step];
    if (!stepLine) return "";
    const date = options.date === undefined || options.date === null ? getLocalDate() : String(options.date);
    let rules = T.DOC_RULES.common
      .replace("{{docsRoot}}", normalizedRoot)
      .replace("{{stepLine}}", stepLine.replaceAll("{{docsRoot}}", normalizedRoot).replaceAll("{{date}}", date));
    if (step !== "P3" && step !== "P5") rules += `\n${T.DOC_RULES.readOnlyFallback}`;
    return substituteRoles(rules.replaceAll("{{date}}", date).replaceAll("{{docsRoot}}", normalizedRoot), models);
  }

  function buildPrompt(step, formData, models, context, options) {
    let text;
    if (step === "AGENTS") {
      text = substituteRoles(T.AGENTS_RULES, models);
    } else if (step === "P1") {
      const form = formData || {};
      text = T.PROMPTS.P1
        .replace("{{taskType}}", form.taskType || "Bug")
        .replace("{{requirement}}", form.requirement || "")
        .replace("{{expected}}", form.expected || "")
        .replace("{{constraints}}", form.constraints && form.constraints.trim() ? form.constraints : "待分析");
      text = substituteRoles(text, models);
    } else if (step === "P2b") {
      const items = formData && Array.isArray(formData.items) ? formData.items : [];
      const list = items.filter((item) => String(item).trim()).map((item, index) => `${index + 1}. ${item}`).join("\n");
      text = substituteRoles(T.PROMPTS.P2b.replace("{{items}}", list), models);
    } else {
      text = substituteRoles(T.PROMPTS[step] || "", models);
    }
    const docRules = buildDocRules(step, models, options);
    if (docRules) text += step === "AGENTS" ? `\n${docRules}` : `\n\n${docRules}`;
    const extra = String(context || "");
    return extra.length ? `${text}\n\n${extra}` : text;
  }

  function validateStep(step, formData) {
    const errors = [];
    if (step === "P1") {
      const form = formData || {};
      if (!String(form.requirement || "").trim()) errors.push("需求");
      if (!String(form.expected || "").trim()) errors.push("期望结果");
    }
    if (step === "P2b") {
      const items = formData && Array.isArray(formData.items) ? formData.items : [];
      if (!items.some((item) => String(item).trim())) errors.push("至少填写一条补充需求");
    }
    return errors;
  }

  function getRecommendation(step, status) {
    const options = T.STATUS_OPTIONS[step] || [];
    return options.find((option) => option.value === status) || null;
  }

  function lineEndingOf(text) {
    const crlf = (text.match(/\r\n/g) || []).length;
    const withoutCrlf = text.replace(/\r\n/g, "");
    const lf = (withoutCrlf.match(/\n/g) || []).length;
    const cr = (withoutCrlf.match(/\r/g) || []).length;
    if (cr > 0 || (crlf > 0 && lf > 0)) return { error: "文件使用混合或不支持的换行符，已拒绝回写。" };
    return { value: crlf > 0 ? "\r\n" : "\n" };
  }

  function normalizeNewlines(text, newline) {
    return String(text).replace(/\r\n|\r|\n/g, newline);
  }

  function replaceAgentsSection(original, rules) {
    const lineEnding = lineEndingOf(original);
    if (lineEnding.error) return { error: lineEnding.error };
    const newline = lineEnding.value;
    const headings = [...original.matchAll(/^## 三模型协作规则[ \t]*\r?$/gm)];
    if (headings.length > 1) return { error: "找到多个“## 三模型协作规则”标题，未执行写入。" };

    const newRules = normalizeNewlines(rules, newline);
    if (headings.length === 0) {
      if (!original.length) return { text: newRules, action: "append", oldSection: "（原文件中不存在该规则节）", newSection: newRules };
      const separator = original.endsWith(newline + newline) ? "" : original.endsWith(newline) ? newline : newline + newline;
      return { text: original + separator + newRules, action: "append", oldSection: "（原文件中不存在该规则节）", newSection: newRules };
    }

    const heading = headings[0];
    const start = heading.index;
    const afterHeading = start + heading[0].length;
    const remaining = original.slice(afterHeading);
    const nextHeading = /^## (?!#)[^\r\n]*/gm;
    const nextMatch = nextHeading.exec(remaining);
    const end = nextMatch ? afterHeading + nextMatch.index : original.length;
    const oldSectionWithSpacing = original.slice(start, end);
    const trailingMatch = oldSectionWithSpacing.match(/(?:\r\n|\n)+$/);
    const trailing = trailingMatch ? trailingMatch[0] : "";
    const oldSection = trailing ? oldSectionWithSpacing.slice(0, -trailing.length) : oldSectionWithSpacing;
    const replacement = newRules + trailing;
    const text = original.slice(0, start) + replacement + original.slice(end);
    return { text, action: "replace", oldSection, newSection: newRules };
  }

  const api = Object.freeze({ buildPrompt, validateStep, getRecommendation, replaceAgentsSection, lineEndingOf, substituteRoles, normalizeDocsRoot, getLocalDate, getP1FieldValues });
  global.PromptApp = api;

  function init() {
    const root = document.getElementById("app");
    if (!root) return;

    let state;
    let storageAvailable = true;
    try {
      state = mergeState(JSON.parse(global.localStorage.getItem(STORAGE_KEY) || "null"));
    } catch (_) {
      state = mergeState(null);
      storageAvailable = false;
    }

    const $ = (id) => document.getElementById(id);
    const stepSelect = $("step-select");
    const stepFields = $("step-fields");
    const preview = $("prompt-preview");
    const statusSelect = $("status-select");
    const recommendResult = $("recommend-result");
    const goNext = $("go-next");
    const validationMessage = $("validation-message");
    const copyStatus = $("copy-status");
    const storageStatus = $("storage-status");
    const writeButton = $("write-agents");
    const writeDialog = $("write-dialog");
    const docRulesToggle = $("doc-rules-toggle");
    const docsRootInput = $("docs-root");
    const docsRootNotice = $("docs-root-notice");
    let pendingWrite = null;

    function persist(message) {
      try {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        storageAvailable = true;
        storageStatus.textContent = message || "已保存在当前浏览器。";
      } catch (_) {
        storageAvailable = false;
        storageStatus.textContent = "浏览器本地存储不可用；本次输入不会在关闭页面后保留。";
      }
    }

    function escapeText(value) {
      return String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
    }

    function renderStepOptions() {
      stepSelect.replaceChildren();
      Object.entries(T.STEPS).forEach(([key, item]) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = item.title;
        stepSelect.append(option);
      });
      stepSelect.value = state.currentStep;
    }

    function setField(markup, values) {
      stepFields.innerHTML = markup;
      Object.entries(values || {}).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
      });
    }

    function renderFields() {
      const step = state.currentStep;
      $("step-description").textContent = T.STEPS[step].when;
      const role = step === "P1" ? "analyst" : ["P2", "P2b", "P4"].includes(step) ? "planner" : step === "P3" || step === "P5" ? "implementer" : "";
      $("role-hint").textContent = role ? `建议切换到：${state.models[role]}` : "规则内容可直接复制，也可选择 AGENTS.md 回写。";
      writeButton.hidden = step !== "AGENTS";
      const downloadButton = $("download-rules");
      if (downloadButton) downloadButton.hidden = step !== "AGENTS";
      const context = $("extra-context");
      context.value = state.contexts[step] || "";

      if (step === "P1") {
        setField('<div class="field"><label class="field-label" for="task-type">任务类型</label><select id="task-type" class="control"><option value="Bug">Bug</option><option value="Feature">Feature</option></select></div><div class="field"><label class="field-label" for="requirement">需求 <span aria-hidden="true">*</span></label><textarea id="requirement" class="control" rows="3" placeholder="描述 Bug 现象或新增功能"></textarea></div><div class="field"><label class="field-label" for="expected">期望结果 <span aria-hidden="true">*</span></label><textarea id="expected" class="control" rows="3" placeholder="描述期望行为或结果"></textarea></div><div class="field"><label class="field-label" for="constraints">场景/约束</label><textarea id="constraints" class="control" rows="3" placeholder="无内容时生成“待分析”"></textarea></div>', getP1FieldValues(state.forms.P1));
      } else if (step === "P2b") {
        stepFields.replaceChildren();
        const label = document.createElement("label");
        label.className = "field-label";
        label.textContent = "补充需求列表（至少填写一项）";
        stepFields.append(label);
        const list = document.createElement("div");
        list.id = "items-list";
        stepFields.append(list);
        const add = document.createElement("button");
        add.type = "button";
        add.className = "button button-secondary add-row";
        add.textContent = "添加一项";
        add.id = "add-item";
        stepFields.append(add);
        renderItems();
      } else {
        setField(`<p class="help-text">${escapeText(T.STEPS[step].when)} 此步骤使用固定模板。</p>`, {});
      }
      renderStatusOptions();
      updatePreview();
    }

    function renderItems() {
      const list = $("items-list");
      if (!list) return;
      list.replaceChildren();
      state.forms.P2b.items.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "list-row";
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 2000;
        input.value = item;
        input.setAttribute("aria-label", `补充需求 ${index + 1}`);
        input.placeholder = `补充需求 ${index + 1}`;
        input.addEventListener("input", () => {
          state.forms.P2b.items[index] = input.value;
          persist();
          updatePreview();
        });
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "button button-quiet";
        remove.textContent = "删除";
        remove.setAttribute("aria-label", `删除补充需求 ${index + 1}`);
        remove.addEventListener("click", () => {
          if (state.forms.P2b.items.length === 1) state.forms.P2b.items[0] = "";
          else state.forms.P2b.items.splice(index, 1);
          persist();
          renderItems();
          updatePreview();
        });
        row.append(input, remove);
        list.append(row);
      });
      const add = $("add-item");
      if (add) add.onclick = () => {
        state.forms.P2b.items.push("");
        persist();
        renderItems();
        updatePreview();
        const inputs = $("items-list").querySelectorAll("input");
        inputs[inputs.length - 1].focus();
      };
    }

    function renderStatusOptions() {
      statusSelect.replaceChildren();
      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "选择模型实际返回的状态…";
      statusSelect.append(empty);
      (T.STATUS_OPTIONS[state.currentStep] || []).forEach((entry) => {
        const option = document.createElement("option");
        option.value = entry.value;
        option.textContent = entry.value;
        statusSelect.append(option);
      });
      statusSelect.disabled = !T.STATUS_OPTIONS[state.currentStep];
      statusSelect.value = state.statuses[state.currentStep] || "";
      showRecommendation();
    }

    function currentForm() {
      if (state.currentStep === "P1") return state.forms.P1;
      if (state.currentStep === "P2b") return state.forms.P2b;
      return {};
    }

    function currentPromptOptions() {
      const normalized = normalizeDocsRoot(state.docsRoot);
      docsRootNotice.textContent = normalized.notice;
      return { docRules: state.docRules, docsRoot: state.docsRoot, date: getLocalDate() };
    }

    function updatePreview() {
      preview.value = buildPrompt(state.currentStep, currentForm(), state.models, state.contexts[state.currentStep], currentPromptOptions());
      const errors = validateStep(state.currentStep, currentForm());
      validationMessage.hidden = errors.length === 0;
      validationMessage.textContent = errors.length ? `复制前请补全：${errors.join("、")}` : "";
    }

    function showRecommendation() {
      const status = statusSelect.value;
      state.statuses[state.currentStep] = status;
      const recommendation = getRecommendation(state.currentStep, status);
      goNext.hidden = true;
      if (!status) {
        recommendResult.textContent = T.STATUS_OPTIONS[state.currentStep] ? "选择模型实际返回的状态后显示推荐。" : "此步骤没有下一步状态推荐。";
      } else if (!recommendation) {
        recommendResult.textContent = "该状态不属于当前步骤，无法推荐下一步。";
      } else if (recommendation.terminal === "completed") {
        recommendResult.textContent = "流程完成。按验收标准检查结果和证据。";
      } else if (recommendation.terminal === "failed") {
        recommendResult.textContent = "实施失败。停止重复尝试；按项目规则评估并交计划模型复核，不要直接重试。";
      } else {
        const modelName = state.models[recommendation.model];
        recommendResult.textContent = `建议切换到 ${modelName}，使用 ${recommendation.next}。`;
        goNext.textContent = `前往 ${recommendation.next} · ${modelName}`;
        goNext.hidden = false;
      }
      persist();
    }

    function currentModelRoleKey(role) {
      return `model-${role}`;
    }

    Object.keys(T.DEFAULT_MODELS).forEach((role) => {
      const input = $(currentModelRoleKey(role));
      input.value = state.models[role];
      input.addEventListener("input", () => {
        state.models[role] = input.value;
        persist();
        $("role-hint").textContent = T.STEPS[state.currentStep].role === "规则内容" ? "规则内容可直接复制，也可选择 AGENTS.md 回写。" : `建议切换到：${state.models[roleForStep(state.currentStep)] || T.STEPS[state.currentStep].role}`;
        updatePreview();
        showRecommendation();
      });
    });

    function roleForStep(step) {
      if (step === "P1") return "analyst";
      if (["P2", "P2b", "P4"].includes(step)) return "planner";
      if (["P3", "P5"].includes(step)) return "implementer";
      return "";
    }

    stepSelect.addEventListener("change", () => {
      state.currentStep = stepSelect.value;
      persist();
      renderFields();
    });

    stepFields.addEventListener("input", (event) => {
      const id = event.target.id;
      if (state.currentStep === "P1" && ["task-type", "requirement", "expected", "constraints"].includes(id)) {
        const key = id === "task-type" ? "taskType" : id;
        state.forms.P1[key] = event.target.value;
        persist();
        updatePreview();
      }
    });

    $("extra-context").addEventListener("input", (event) => {
      state.contexts[state.currentStep] = event.target.value;
      persist();
      updatePreview();
    });

    docRulesToggle.addEventListener("change", () => {
      state.docRules = docRulesToggle.checked;
      persist();
      updatePreview();
    });

    docsRootInput.addEventListener("input", () => {
      state.docsRoot = docsRootInput.value;
      persist();
      updatePreview();
    });

    statusSelect.addEventListener("change", showRecommendation);

    goNext.addEventListener("click", () => {
      const recommendation = getRecommendation(state.currentStep, statusSelect.value);
      if (!recommendation || !recommendation.next) return;
      state.currentStep = recommendation.next;
      stepSelect.value = state.currentStep;
      persist();
      renderFields();
    });

    $("clear-step").addEventListener("click", () => {
      const step = state.currentStep;
      if (step === "P1") state.forms.P1 = { ...DEFAULT_STATE.forms.P1 };
      if (step === "P2b") state.forms.P2b = { items: ["", ""] };
      delete state.contexts[step];
      delete state.statuses[step];
      $("extra-context").value = "";
      if (step === "P1") renderFields();
      else if (step === "P2b") { renderItems(); renderStatusOptions(); updatePreview(); }
      else { renderStatusOptions(); updatePreview(); }
      persist("已清空当前步骤。");
    });

    $("reset-models").addEventListener("click", () => {
      state.models = { ...T.DEFAULT_MODELS };
      Object.keys(T.DEFAULT_MODELS).forEach((role) => { $(currentModelRoleKey(role)).value = state.models[role]; });
      renderFields();
      persist("模型名已恢复默认值。");
    });

    async function copyText(text) {
      if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
        try {
          await global.navigator.clipboard.writeText(text);
          return;
        } catch (_) { /* fall through to the user-gesture-compatible legacy copy path */ }
      }
      const temporary = document.createElement("textarea");
      temporary.value = text;
      temporary.setAttribute("readonly", "");
      temporary.style.position = "fixed";
      temporary.style.opacity = "0";
      document.body.append(temporary);
      temporary.select();
      const copied = document.execCommand("copy");
      temporary.remove();
      if (!copied) throw new Error("浏览器拒绝了剪贴板操作。");
    }

    $("copy-prompt").addEventListener("click", async () => {
      const errors = validateStep(state.currentStep, currentForm());
      if (errors.length) {
        validationMessage.hidden = false;
        validationMessage.textContent = `复制前请补全：${errors.join("、")}`;
        copyStatus.textContent = "";
        return;
      }
      try {
        await copyText(preview.value);
        copyStatus.textContent = "已复制，内容与预览一致。";
      } catch (error) {
        copyStatus.textContent = `复制失败：${error.message}。请手动选择预览内容复制。`;
      }
    });

    function bytesToUtf8(bytes) {
      const hasBom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
      const payload = hasBom ? bytes.subarray(3) : bytes;
      let text;
      try { text = new TextDecoder("utf-8", { fatal: true }).decode(payload); }
      catch (_) { throw new Error("文件不是有效的 UTF-8，已拒绝回写。原文件未更改。"); }
      return { text, hasBom };
    }

    function utf8ToBytes(text, hasBom) {
      const body = new TextEncoder().encode(text);
      if (!hasBom) return body;
      const result = new Uint8Array(body.length + 3);
      result.set([0xef, 0xbb, 0xbf], 0);
      result.set(body, 3);
      return result;
    }

    function downloadRules(text) {
      const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "三模型协作规则.md";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }

    function showDownloadFallback(message, rules) {
      storageStatus.textContent = message;
      let download = $("download-rules");
      if (!download) {
        download = document.createElement("button");
        download.id = "download-rules";
        download.type = "button";
        download.className = "button button-secondary";
        download.textContent = "下载规则 Markdown";
        writeButton.insertAdjacentElement("afterend", download);
      }
      download.hidden = false;
      download.onclick = () => downloadRules(rules);
    }

    writeButton.addEventListener("click", async () => {
      const rules = buildPrompt("AGENTS", {}, state.models, state.contexts.AGENTS, currentPromptOptions());
      if (!global.showOpenFilePicker) {
        showDownloadFallback("此浏览器未提供文件选择/写入 API；未修改文件，可下载规则内容。", rules);
        return;
      }
      try {
        const [handle] = await global.showOpenFilePicker({
          multiple: false,
          types: [{ description: "AGENTS Markdown", accept: { "text/markdown": [".md"], "text/plain": [".md"] } }]
        });
        if (!handle) return;
        let permission = await handle.queryPermission({ mode: "readwrite" });
        if (permission !== "granted") permission = await handle.requestPermission({ mode: "readwrite" });
        if (permission !== "granted") {
          showDownloadFallback("文件写入权限未授予；原文件未修改。可下载规则内容。", rules);
          return;
        }
        const file = await handle.getFile();
        const decoded = bytesToUtf8(new Uint8Array(await file.arrayBuffer()));
        const result = replaceAgentsSection(decoded.text, rules);
        if (result.error) {
          showDownloadFallback(result.error, rules);
          return;
        }
        pendingWrite = { handle, text: result.text, hasBom: decoded.hasBom };
        $("write-summary").textContent = result.action === "append" ? `将在 ${file.name} 末尾追加目标规则节。` : `将在 ${file.name} 中替换唯一的目标规则节。`;
        $("old-rules").textContent = result.oldSection;
        $("new-rules").textContent = result.newSection;
        if (typeof writeDialog.showModal === "function") writeDialog.showModal();
        else {
          pendingWrite = null;
          showDownloadFallback("此浏览器不支持安全确认对话框；原文件未修改。可下载规则内容。", rules);
        }
      } catch (error) {
        if (error && error.name === "AbortError") {
          storageStatus.textContent = "已取消选择，文件未修改。";
        } else {
          showDownloadFallback(`回写准备失败：${error.message || "未知错误"}；原文件未修改。`, rules);
        }
      }
    });

    $("cancel-write").addEventListener("click", () => {
      pendingWrite = null;
      writeDialog.close();
      storageStatus.textContent = "已取消回写，文件未修改。";
    });

    $("confirm-write").addEventListener("click", async () => {
      if (!pendingWrite) return;
      const current = pendingWrite;
      let writable = null;
      try {
        writable = await current.handle.createWritable();
        await writable.write(utf8ToBytes(current.text, current.hasBom));
        await writable.close();
        pendingWrite = null;
        writeDialog.close();
        storageStatus.textContent = "规则已写入所选文件。";
      } catch (error) {
        try { if (writable) await writable.abort(); } catch (_) { /* best-effort cleanup */ }
        pendingWrite = null;
        writeDialog.close();
        showDownloadFallback(`写入失败：${error.message || "未知错误"}。请检查文件权限；原文件未确认写入。`, buildPrompt("AGENTS", {}, state.models, state.contexts.AGENTS, currentPromptOptions()));
      }
    });

    docRulesToggle.checked = state.docRules;
    docsRootInput.value = state.docsRoot;
    renderStepOptions();
    renderFields();
    if (!storageAvailable) storageStatus.textContent = "浏览器本地存储不可用；本次输入不会在关闭页面后保留。";
    else storageStatus.textContent = "已从当前浏览器恢复本地数据。";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
