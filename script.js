const sourceOptions = {
  academic: {
    short: "Academic / Deadline",
    zh: "学业 / DDL",
    description: "学业、任务与截止日期",
    color: "source-blue"
  },
  career: {
    short: "Future / Career",
    zh: "未来 / 就业",
    description: "未来选择、就业与不确定性",
    color: "source-peach"
  },
  social: {
    short: "Social Comparison",
    zh: "同伴比较",
    description: "同伴比较、排名与社交信息",
    color: "source-lavender"
  },
  relationship: {
    short: "Relationship",
    zh: "人际关系",
    description: "人际关系与沟通负担",
    color: "source-rose"
  },
  family: {
    short: "Family / Responsibility",
    zh: "家庭 / 责任",
    description: "家庭期待、照顾与责任",
    color: "source-sage"
  },
  identity: {
    short: "Identity Transition",
    zh: "身份转换",
    description: "身份变化、阶段转换与角色不确定",
    color: "source-violet"
  },
  physical: {
    short: "Physical State",
    zh: "身体状态",
    description: "睡眠、疲惫与身体不适",
    color: "source-stone"
  }
};

const variableMeta = {
  intensity: { label: "Intensity / 压力强度", weight: 0.3, scale: 100 },
  duration: { label: "Duration / 持续时间", weight: 0.2 },
  control: { label: "Low Control / 失控感", weight: 0.2 },
  body: { label: "Body Response / 身体反应", weight: 0.1 },
  expression: { label: "Expression / 表达困难", weight: 0.1 },
  gap: { label: "Expectation Gap / 预期落差", weight: 0.1 }
};

const sliderIds = Object.keys(variableMeta);
const defaultProfile = {
  intensity: 50,
  duration: 5,
  control: 5,
  body: 5,
  expression: 5,
  gap: 5
};

function createGuideState() {
  return {
    entered: false,
    recommendedSource: null,
    selectedGuideSource: null,
    contextChips: [],
    aiGuidance: null,
    completedActions: {},
    actionLog: [],
    orbitAdjustments: {}
  };
}

const state = {
  pressureMode: null,
  selectedSources: [],
  sourceProfiles: {},
  activeSource: null,
  combined: null,
  seed: 1,
  currentStep: "mode",
  anonymousConcern: "",
  anonymousReturnStep: "mode",
  guide: createGuideState()
};

window.sourceOptions = sourceOptions;
window.pressureRevealState = state;
window.appState = state;

const $ = (id) => document.getElementById(id);
let breathTimer = null;
let breathStartedAt = 0;

function cloneProfile() {
  return { ...defaultProfile };
}

function ensureProfile(source) {
  if (!state.sourceProfiles[source]) {
    state.sourceProfiles[source] = cloneProfile();
  }
  return state.sourceProfiles[source];
}

function normalizeVariableValue(id, value) {
  const numeric = Number(value) || 0;
  if (id === "intensity" && numeric > 10) return numeric / 10;
  return numeric;
}

function formatVariableValue(id, value) {
  const scale = variableMeta[id]?.scale || 10;
  const precision = scale === 100 ? 0 : 1;
  return `${Number(value).toFixed(precision)}/${scale}`;
}

function getStructuredReturnStep() {
  return ["mode", "source", "variables"].includes(state.currentStep)
    ? state.currentStep
    : "mode";
}

function openExperience() {
  document.body.classList.add("experience-open");
  $("experience").classList.add("is-active");
  const step = state.currentStep === "anonymous"
    ? state.anonymousReturnStep || "mode"
    : state.currentStep || "mode";
  showExperienceStep(step);
  window.setTimeout(() => $("exitExperienceBtn").focus(), 80);
}

function openAnonymousInput(returnStep = null) {
  document.body.classList.add("experience-open");
  $("experience").classList.add("is-active");
  state.anonymousReturnStep = returnStep || getStructuredReturnStep();
  showExperienceStep("anonymous");
  window.setTimeout(() => $("anonymousConcernText").focus(), 80);
}

function closeExperience() {
  document.body.classList.remove("experience-open");
  $("experience").classList.remove("is-active");
  if (typeof stopOrbitalView === "function") stopOrbitalView();
}

function showExperienceStep(step) {
  const panels = {
    anonymous: $("anonymousStep"),
    mode: $("modeStep"),
    source: $("sourceStep"),
    variables: $("variablesStep"),
    result: $("resultStep"),
    guide: $("guided-reorbit-section")
  };

  Object.entries(panels).forEach(([name, panel]) => {
    panel.classList.toggle("is-active", name === step);
  });
  state.currentStep = step;

  const progress = {
    anonymous: ["OPTIONAL · ANONYMOUS CONCERN INPUT", "Optional", "20%"],
    mode: ["01 · PRESSURE STRUCTURE", "1 / 5", "20%"],
    source: ["02 · PRESSURE SOURCES", "2 / 5", "40%"],
    variables: ["03 · SIDCBEG VARIABLES", "3 / 5", "60%"],
    result: ["04 · ORBITAL PRESSURE MAP", "4 / 5", "80%"],
    guide: ["05 · GUIDED RE-ORBIT", "5 / 5", "100%"]
  }[step];

  $("progressLabel").textContent = progress[0];
  $("progressCount").textContent = progress[1];
  $("progressBar").style.width = progress[2];
  $("experience").scrollTo({ top: 0, behavior: "smooth" });

  if (typeof stopOrbitalView === "function") stopOrbitalView();

  if (step === "anonymous") loadAnonymousConcern();
  if (step === "source") renderSourceSelection();
  if (step === "variables") {
    renderSourceTabs();
    loadActiveProfile();
  }
  if (step === "result") renderResult();
  if (step === "guide") renderGuidance();
}

function selectPressureMode(mode) {
  if (!["single", "compound"].includes(mode)) return;
  const changed = state.pressureMode && state.pressureMode !== mode;
  state.pressureMode = mode;

  if (changed) {
    state.selectedSources = [];
    state.sourceProfiles = {};
    state.activeSource = null;
    state.combined = null;
    state.guide = createGuideState();
  }

  document.querySelectorAll("[data-pressure-mode]").forEach((card) => {
    const selected = card.dataset.pressureMode === mode;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", selected ? "true" : "false");
  });

  $("modeHint").textContent = mode === "single"
    ? "Single-source / 单一压力结构"
    : "Compound / 复合压力结构";
  $("toSourcesBtn").disabled = false;
}

function toggleSource(source) {
  const selected = state.selectedSources.includes(source);

  if (state.pressureMode === "single") {
    state.selectedSources = selected ? [] : [source];
    state.activeSource = selected ? null : source;
    if (!selected) ensureProfile(source);
  } else if (selected) {
    state.selectedSources = state.selectedSources.filter((item) => item !== source);
    if (state.activeSource === source) {
      state.activeSource = state.selectedSources[0] || null;
    }
  } else {
    state.selectedSources.push(source);
    state.activeSource = state.activeSource || source;
    ensureProfile(source);
  }

  state.combined = null;
  state.guide.recommendedSource = null;
  state.guide.selectedGuideSource = null;
  renderSourceSelection();
}

function renderSourceSelection() {
  document.querySelectorAll(".source-card").forEach((card) => {
    const selected = state.selectedSources.includes(card.dataset.source);
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", selected ? "true" : "false");
  });

  const count = state.selectedSources.length;
  const modeCopy = state.pressureMode === "single"
    ? "单一模式：选择一个来源"
    : "复合模式：至少选择两个来源";
  $("experienceTitle").textContent = state.pressureMode === "single"
    ? "此刻，哪个压力最靠近你？"
    : "此刻，哪些压力正在靠近你？";
  $("selectionCount").textContent = count
    ? `${modeCopy} · 已选择 ${count} 个`
    : `${modeCopy} · 尚未选择`;
  $("toVariablesBtn").disabled = state.pressureMode === "compound" ? count < 2 : count !== 1;
}

function setActiveSource(source) {
  if (!state.selectedSources.includes(source)) return;
  state.activeSource = source;
  renderSourceTabs();
  loadActiveProfile();
}

function renderSourceTabs() {
  const container = $("sourceTabs");
  container.replaceChildren();
  state.selectedSources.forEach((source) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `source-tab${source === state.activeSource ? " active" : ""}`;
    button.textContent = sourceOptions[source].short;
    button.addEventListener("click", () => setActiveSource(source));
    container.appendChild(button);
  });
}

function loadActiveProfile() {
  if (!state.selectedSources.includes(state.activeSource)) {
    state.activeSource = state.selectedSources[0] || null;
  }
  const source = state.activeSource;
  if (!source) return;

  const profile = ensureProfile(source);
  const option = sourceOptions[source];
  $("activeSourceName").textContent = option.short;
  $("activeSourceZh").textContent = option.description;
  $("activeSourceOrb").className = `active-source-orb ${option.color}`;

  sliderIds.forEach((id) => {
    $(id).value = profile[id];
    updateSliderVisual(id);
  });
}

function updateSliderVisual(id) {
  const input = $(id);
  const value = Number(input.value);
  $(`${id}Value`).textContent = value;
  const percentage = ((value - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100;
  input.style.background = `linear-gradient(90deg, var(--brown-light) ${percentage}%, rgba(112, 86, 66, 0.13) ${percentage}%)`;
}

function updateProfile(id) {
  if (!state.activeSource) return;
  ensureProfile(state.activeSource)[id] = Number($(id).value);
  state.combined = null;
  state.guide.recommendedSource = null;
  updateSliderVisual(id);
}

function loadAnonymousConcern() {
  $("anonymousConcernText").value = state.anonymousConcern || "";
  $("anonymousConcernStatus").textContent = state.anonymousConcern
    ? "Saved locally in this browser session."
    : "";
}

function returnFromAnonymousInput() {
  const nextStep = state.anonymousReturnStep || "mode";
  showExperienceStep(nextStep);
}

function saveAnonymousConcern() {
  state.anonymousConcern = $("anonymousConcernText").value.trim();
  state.guide.aiGuidance = null;
  $("anonymousConcernStatus").textContent = state.anonymousConcern
    ? "Saved privately in local browser state."
    : "No private note saved.";
  returnFromAnonymousInput();
}

function skipAnonymousConcern() {
  $("anonymousConcernText").value = state.anonymousConcern || "";
  returnFromAnonymousInput();
}

function createCombinedStructure() {
  const profiles = state.selectedSources
    .map((source) => {
      const profile = ensureProfile(source);
      const score = typeof computePressureGravity === "function"
        ? computePressureGravity(source, profile)
        : sliderIds.reduce((sum, id) => sum + normalizeVariableValue(id, profile[id]) * variableMeta[id].weight, 0);
      return { source, profile, score, pressureGravity: score };
    })
    .sort((a, b) => b.score - a.score);

  const averages = {};
  sliderIds.forEach((id) => {
    averages[id] = profiles.reduce((sum, item) => sum + item.profile[id], 0) / profiles.length;
  });

  const dominant = profiles[0];
  const strongestVariable = sliderIds
    .map((id) => ({
      id,
      value: averages[id],
      normalizedValue: normalizeVariableValue(id, averages[id])
    }))
    .sort((a, b) => b.normalizedValue - a.normalizedValue)[0];

  return {
    selectedSources: [...state.selectedSources],
    profiles,
    averages,
    dominantSource: dominant.source,
    dominantProfile: dominant.profile,
    dominantScore: dominant.score,
    keyVariable: strongestVariable
  };
}

function generateResult() {
  if (!state.selectedSources.length) return;
  state.combined = createCombinedStructure();
  state.seed = Math.floor(Math.random() * 90000) + 10000;
  state.guide.recommendedSource = null;
  state.guide.selectedGuideSource = null;
  showExperienceStep("result");
}

function renderResult() {
  if (!state.combined) state.combined = createCombinedStructure();

  const dominant = state.combined.dominantSource;
  const dominantOption = sourceOptions[dominant];
  const sourceCount = state.selectedSources.length;

  $("dominantName").textContent = dominantOption.short;
  $("structureReading").textContent = sourceCount === 1
    ? `${dominantOption.description}是此刻最清晰的单一来源。先观察它的形状，不需要马上处理全部。`
    : `${dominantOption.description}形成了目前最强的中心引力；其他来源仍在轨道上，现在已经可以分别看见。`;
  $("structureType").textContent = state.pressureMode === "single"
    ? "Single-source / 单一来源"
    : "Compound / 多来源叠加";
  $("strongestVariable").textContent =
    `${variableMeta[state.combined.keyVariable.id].label} · ${formatVariableValue(state.combined.keyVariable.id, state.combined.keyVariable.value)}`;
  $("visibleSources").textContent =
    state.selectedSources.map((source) => sourceOptions[source].short).join(" · ");

  const previewAction = getGuidedAction(dominant, state.sourceProfiles[dominant]);
  $("gentleAction").textContent = previewAction.steps[0][1];
  $("observeStatus").textContent = "";

  if (typeof renderOrbitalView === "function") {
    renderOrbitalView($("resultOrbitalView"), state.combined, {
      seed: state.seed,
      sourceOptions,
      selectedSource: dominant,
      orbitAdjustments: state.guide.orbitAdjustments
    });
  }
}

function enterGuidance() {
  if (!state.combined) state.combined = createCombinedStructure();
  state.guide.entered = true;
  state.guide.recommendedSource = getRecommendedGuideSource(state);
  if (!state.selectedSources.includes(state.guide.selectedGuideSource)) {
    state.guide.selectedGuideSource = state.guide.recommendedSource;
  }
  showExperienceStep("guide");
}

function renderGuidance() {
  if (!state.combined) state.combined = createCombinedStructure();
  if (!state.guide.recommendedSource) {
    state.guide.recommendedSource = getRecommendedGuideSource(state);
  }
  if (!state.selectedSources.includes(state.guide.selectedGuideSource)) {
    state.guide.selectedGuideSource = state.guide.recommendedSource;
  }

  const recommended = state.guide.recommendedSource;
  $("recommendedSourceName").textContent =
    `${sourceOptions[recommended].short} · ${sourceOptions[recommended].zh}`;
  renderContextChips();
  renderGuideSourceChips();
  renderSelectedGuidance();

  if (typeof renderOrbitalView === "function") {
    renderOrbitalView($("guidedOrbitalView"), state.combined, {
      seed: state.seed,
      sourceOptions,
      selectedSource: state.guide.selectedGuideSource,
      orbitAdjustments: state.guide.orbitAdjustments,
      onSourceSelect: selectGuideSource
    });
  }
}

function renderGuideSourceChips() {
  const container = $("guideSourceChips");
  container.replaceChildren();

  state.selectedSources.forEach((source) => {
    const button = document.createElement("button");
    const selected = source === state.guide.selectedGuideSource;
    button.type = "button";
    button.className = `guide-source-chip${selected ? " active" : ""}`;
    button.setAttribute("aria-pressed", selected ? "true" : "false");
    button.innerHTML = `
      <span>${sourceOptions[source].short}</span>
      <small>${sourceOptions[source].zh}${source === state.guide.recommendedSource ? " · Recommended" : ""}</small>
    `;
    button.addEventListener("click", () => selectGuideSource(source));
    container.appendChild(button);
  });
}

function selectGuideSource(source) {
  if (!state.selectedSources.includes(source)) return;
  state.guide.selectedGuideSource = source;
  renderGuideSourceChips();
  renderSelectedGuidance();
  if (typeof updateOrbitalSelection === "function") updateOrbitalSelection(source);
}

function toggleContextChip(context) {
  const chips = state.guide.contextChips;
  const selected = chips.includes(context);

  if (selected) {
    state.guide.contextChips = chips.filter((item) => item !== context);
  } else if (chips.length < 2) {
    state.guide.contextChips = [...chips, context];
  } else {
    $("contextChipHint").textContent = "Up to 2 choices / 最多选择 2 项，可先取消一项";
    return;
  }

  renderContextChips();
  renderSelectedGuidance();
}

function renderContextChips() {
  const selectedCount = state.guide.contextChips.length;
  document.querySelectorAll("[data-context]").forEach((button) => {
    const selected = state.guide.contextChips.includes(button.dataset.context);
    button.classList.toggle("selected", selected);
    button.classList.toggle("limit-muted", selectedCount >= 2 && !selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });
  $("contextChipHint").textContent = selectedCount
    ? `${selectedCount} / 2 selected · 已选择 ${selectedCount} 项`
    : "Choose up to 2 / 最多选择 2 项";
}

function renderSelectedGuidance() {
  const source = state.guide.selectedGuideSource;
  const profile = state.sourceProfiles[source];
  const action = getGuidedAction(source, profile);
  const completed = Boolean(state.guide.completedActions[source]);
  const payload = buildAIGuidancePayload(state);
  const guidance = generateMockAIGuidance(payload);

  state.guide.aiGuidance = guidance;
  renderAIGuidance(guidance);
  $("guidedActionTitle").textContent = action.title;

  const steps = $("guidedActionSteps");
  steps.replaceChildren();
  action.steps.forEach(([en, zh], index) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span>Step ${index + 1}</span>
      <p>${en}</p>
      <small>${zh}</small>
    `;
    steps.appendChild(item);
  });

  $("finishGuideBtn").disabled = completed;
  $("finishGuideBtn").classList.toggle("is-complete", completed);
  $("finishGuideBtn").querySelector("span").innerHTML = completed
    ? "Step completed<br /><small>这一步已完成</small>"
    : "I finished this step<br /><small>我完成了这一步</small>";

  const feedback = $("reorbitFeedback");
  feedback.hidden = !completed;
  if (completed) updateFeedbackCopy(source);
}

function renderAIGuidance(guidance) {
  $("recommendationReasonEn").textContent = guidance.aiReason.en;
  $("recommendationReasonZh").textContent = guidance.aiReason.zh;
  $("personalizedReasonEn").textContent = guidance.aiReason.en;
  $("personalizedReasonZh").textContent = guidance.aiReason.zh;
  $("personalizedNoteEn").textContent = guidance.personalizedNote.en;
  $("personalizedNoteZh").textContent = guidance.personalizedNote.zh;
  $("adjustedStepHintEn").textContent = guidance.adjustedStepHint.en;
  $("adjustedStepHintZh").textContent = guidance.adjustedStepHint.zh;

  const tags = $("priorityReasonTags");
  tags.replaceChildren();
  guidance.reasonTags.forEach((tag) => {
    const item = document.createElement("span");
    item.innerHTML = `${tag.en}<small>${tag.zh}</small>`;
    tags.appendChild(item);
  });

  const basis = guidance.basis;
  $("basisPressureGravity").textContent = `${Number(basis.pressureGravity).toFixed(1)} / 10`;
  $("basisActionability").textContent = `${Number(basis.actionability).toFixed(1)} / 10`;
  $("basisDifficulty").textContent = `${Number(basis.difficulty).toFixed(1)} / 10`;
  $("basisUrgency").textContent = `${Number(basis.urgency).toFixed(1)} / 10`;
  $("basisGuidancePriority").textContent = `${Number(basis.guidancePriority).toFixed(1)} / 10`;
}

function finishGuidedAction() {
  const source = state.guide.selectedGuideSource;
  if (!source || state.guide.completedActions[source]) return;

  const action = getGuidedAction(source, state.sourceProfiles[source]);
  const adjustment = {
    distanceOffset: 60,
    sizeScale: 0.88,
    speedScale: 0.65,
    opacityScale: 0.86,
    haloScale: 0.72,
    shineScale: 0.82,
    textureScale: 0.78
  };

  state.guide.completedActions[source] = true;
  state.guide.orbitAdjustments[source] = adjustment;
  state.guide.actionLog.push({
    source,
    actionName: action.title,
    completedAt: new Date().toISOString()
  });

  if (typeof updateOrbitalAdjustment === "function") {
    updateOrbitalAdjustment(source, adjustment, source);
  }

  renderSelectedGuidance();
  $("reorbitFeedback").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function updateFeedbackCopy(source) {
  const sourceFeedback = getReorbitFeedback(source);
  $("reorbitFeedbackEn").textContent =
    "The pressure is still there, but its orbit has shifted a little.";
  $("reorbitFeedbackZh").textContent =
    `压力仍然存在，但它与你的距离已经稍微改变。${sourceFeedback.zh}`;
}

function resetExperience() {
  state.pressureMode = null;
  state.selectedSources = [];
  state.sourceProfiles = {};
  state.activeSource = null;
  state.combined = null;
  state.seed = 1;
  state.currentStep = "mode";
  state.anonymousReturnStep = "mode";
  state.guide = createGuideState();

  if (typeof stopOrbitalView === "function") stopOrbitalView();
  document.querySelectorAll("[data-pressure-mode]").forEach((card) => {
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  });
  $("modeHint").textContent = "请选择一种压力结构";
  $("toSourcesBtn").disabled = true;
  renderSourceSelection();
  showExperienceStep("mode");
}

function showPlanetTooltip(label) {
  $("planetTooltip").textContent = `${label} · 已被看见`;
}

function openBreathing() {
  const dialog = $("breathingDialog");
  breathStartedAt = performance.now();
  updateBreathing();
  window.clearInterval(breathTimer);
  breathTimer = window.setInterval(updateBreathing, 250);
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeBreathing() {
  const dialog = $("breathingDialog");
  window.clearInterval(breathTimer);
  breathTimer = null;
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function updateBreathing() {
  const elapsed = ((performance.now() - breathStartedAt) / 1000) % 12;
  if (elapsed < 4) {
    $("breathPhase").textContent = "Inhale";
    $("breathHint").textContent = "缓慢吸气 4 秒";
  } else if (elapsed < 6) {
    $("breathPhase").textContent = "Hold";
    $("breathHint").textContent = "轻轻停留 2 秒";
  } else {
    $("breathPhase").textContent = "Exhale";
    $("breathHint").textContent = "缓慢呼气 6 秒";
  }
}

function bindEvents() {
  document.querySelectorAll("[data-start]").forEach((button) => {
    button.addEventListener("click", openExperience);
  });

  document.querySelectorAll("[data-start-anonymous]").forEach((button) => {
    button.addEventListener("click", () => openAnonymousInput("mode"));
  });

  document.querySelectorAll("[data-anonymous-entry]").forEach((button) => {
    button.addEventListener("click", () => openAnonymousInput());
  });

  document.querySelectorAll("[data-scroll-to]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.scrollTo);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-planet-label]").forEach((planet) => {
    planet.addEventListener("click", () => showPlanetTooltip(planet.dataset.planetLabel));
  });

  document.querySelectorAll("[data-pressure-mode]").forEach((card) => {
    card.addEventListener("click", () => selectPressureMode(card.dataset.pressureMode));
  });

  document.querySelectorAll(".source-card").forEach((card) => {
    card.addEventListener("click", () => toggleSource(card.dataset.source));
  });

  document.querySelectorAll("[data-context]").forEach((button) => {
    button.addEventListener("click", () => toggleContextChip(button.dataset.context));
  });

  sliderIds.forEach((id) => {
    $(id).addEventListener("input", () => updateProfile(id));
    updateSliderVisual(id);
  });

  $("exitExperienceBtn").addEventListener("click", closeExperience);
  $("saveAnonymousBtn").addEventListener("click", saveAnonymousConcern);
  $("skipAnonymousBtn").addEventListener("click", skipAnonymousConcern);
  $("toSourcesBtn").addEventListener("click", () => {
    if (state.pressureMode) showExperienceStep("source");
  });
  $("toVariablesBtn").addEventListener("click", () => {
    if (!state.selectedSources.length) return;
    state.activeSource = state.activeSource || state.selectedSources[0];
    showExperienceStep("variables");
  });
  $("backToSourcesBtn").addEventListener("click", () => showExperienceStep("source"));
  $("revealMapBtn").addEventListener("click", generateResult);
  $("backToVariablesBtn").addEventListener("click", () => showExperienceStep("variables"));
  $("restartBtn").addEventListener("click", resetExperience);
  $("observeOnlyBtn").addEventListener("click", () => {
    $("observeStatus").textContent = "You can stay with the map for as long as you need. / 可以继续安静观察。";
  });
  $("enterGuideBtn").addEventListener("click", enterGuidance);
  $("finishGuideBtn").addEventListener("click", finishGuidedAction);
  $("backToMapBtn").addEventListener("click", () => showExperienceStep("result"));
  $("breathingBtn").addEventListener("click", openBreathing);
  $("guideBreathingBtn").addEventListener("click", openBreathing);
  $("closeBreathingBtn").addEventListener("click", closeBreathing);
  $("breathingDialog").addEventListener("cancel", () => {
    window.clearInterval(breathTimer);
    breathTimer = null;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("experience").classList.contains("is-active") && !$("breathingDialog").open) {
      closeExperience();
    }
  });

  renderSourceSelection();
}

document.addEventListener("DOMContentLoaded", bindEvents);
