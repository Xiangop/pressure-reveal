(function () {
  const keyVariableLabels = {
    intensity: "Intensity / 压力强度",
    duration: "Duration / 持续时间",
    control: "Low Control / 失控感",
    body: "Body Response / 身体反应",
    expression: "Expression / 表达困难",
    gap: "Expectation Gap / 预期落差"
  };

  const adjustedHints = {
    academic: {
      en: "Name the nearest task and open the related file. Leave the full plan for later.",
      zh: "只写下最近的任务并打开相关文件，完整计划可以稍后再做。"
    },
    career: {
      en: "Verify one date, requirement, or next step, then stop searching.",
      zh: "只确认一个日期、要求或下一步，然后先停止继续搜索。"
    },
    social: {
      en: "Close one comparison source and write down one action at your own pace.",
      zh: "先关闭一个比较入口，再写下一件可以按自己节奏完成的事。"
    },
    relationship: {
      en: "Write one private sentence about the pressure. You do not need to send it.",
      zh: "先私下写一句关于压力的话，不需要把它发送出去。"
    },
    family: {
      en: "Write one duty and one worry in separate columns. Do not solve either yet.",
      zh: "把一项责任和一项担心分开写下，暂时不需要处理它们。"
    },
    identity: {
      en: "Name only your current role and one need for this stage.",
      zh: "只写下当前角色，以及这个阶段的一项需要。"
    },
    physical: {
      en: "Take six slow breaths, drink water, and step away from the screen for five minutes.",
      zh: "做六轮慢呼吸、喝一点水，并离开屏幕五分钟。"
    }
  };

  function getKeyVariable(profile) {
    const entry = Object.entries(profile || {})
      .sort((a, b) => Number(b[1]) - Number(a[1]))[0] || ["intensity", 0];
    return {
      id: entry[0],
      label: keyVariableLabels[entry[0]] || entry[0],
      value: Number(entry[1])
    };
  }

  function buildAIGuidancePayload(currentState) {
    const recommendedSource = currentState.guide.recommendedSource ||
      getRecommendedGuideSource(currentState);
    const selectedGuideSource = currentState.guide.selectedGuideSource ||
      recommendedSource;
    const sourceProfiles = {};
    const sources = currentState.selectedSources.map((source) => {
      sourceProfiles[source] = { ...currentState.sourceProfiles[source] };
      return {
        source,
        profile: sourceProfiles[source],
        scores: getSourceScores(source, sourceProfiles[source])
      };
    });
    const recommendedItem = sources.find((item) => item.source === recommendedSource);
    const selectedItem = sources.find((item) => item.source === selectedGuideSource);
    const matchedAction = getGuidedAction(
      selectedGuideSource,
      sourceProfiles[selectedGuideSource]
    );

    return {
      version: "ai-guidance-port-v2",
      pressureMode: currentState.pressureMode,
      selectedSources: [...currentState.selectedSources],
      sourceProfiles,
      recommendedSource,
      selectedGuideSource,
      pressureGravity: recommendedItem?.scores.pressureGravity || 0,
      guidancePriority: recommendedItem?.scores.guidancePriority || 0,
      keyVariable: getKeyVariable(sourceProfiles[selectedGuideSource]),
      contextChips: [...(currentState.guide.contextChips || [])],
      matchedAction: {
        title: matchedAction.title,
        steps: matchedAction.steps.map((step) => [...step])
      },
      recommendedScores: { ...(recommendedItem?.scores || {}) },
      selectedScores: { ...(selectedItem?.scores || {}) },
      sources,
      constraints: {
        format: "brief-structured-guidance",
        allowOpenChat: false,
        allowClinicalAssessment: false,
        allowUnboundedActions: false
      }
    };
  }

  function buildReasonTags(scores) {
    const tags = [];
    tags.push(scores.pressureGravity >= 7
      ? { en: "High pressure gravity", zh: "压力引力高" }
      : { en: "Noticeable pressure gravity", zh: "压力引力明显" });
    tags.push(scores.urgency >= 7.5
      ? { en: "High urgency", zh: "紧急性高" }
      : { en: "Current urgency", zh: "存在当前紧急性" });
    tags.push(scores.actionability >= 7
      ? { en: "More actionable as a first step", zh: "更适合作为第一步" }
      : { en: "Needs a low-risk entry", zh: "需要低风险入口" });
    if (scores.difficulty >= 6) {
      tags.push({ en: "Higher interaction difficulty", zh: "互动处理难度较高" });
    }
    return tags;
  }

  function buildAIReason(payload) {
    const options = window.sourceOptions || {};
    const recommendedName = options[payload.recommendedSource]?.short || payload.recommendedSource;
    const selectedName = options[payload.selectedGuideSource]?.short || payload.selectedGuideSource;
    const ranked = [...payload.sources]
      .sort((a, b) => b.scores.guidancePriority - a.scores.guidancePriority);
    const alternative = ranked.find((item) => item.source !== payload.recommendedSource);
    const alternativeName = alternative
      ? options[alternative.source]?.short || alternative.source
      : null;

    if (payload.selectedGuideSource !== payload.recommendedSource) {
      return {
        en: `${recommendedName} remains the first recommendation because of its balance of urgency and actionability. You selected ${selectedName}, so the guidance keeps this orbit contained and low-burden.`,
        zh: `${recommendedName} 仍是综合紧急性与可行动性后的第一推荐。你当前选择了 ${selectedName}，因此建议会保持范围清楚、负担较低。`
      };
    }

    if (alternativeName) {
      return {
        en: `Although ${alternativeName} also has a noticeable pull, ${recommendedName} is currently more urgent and easier to turn into one bounded action.`,
        zh: `虽然 ${alternativeName} 的压力引力也很明显，但 ${recommendedName} 当前更紧急，也更容易被切分成一个范围清楚的小动作。`
      };
    }

    return {
      en: `${recommendedName} currently offers the clearest balance of pressure strength, urgency, difficulty, and actionability.`,
      zh: `${recommendedName} 当前在压力强度、紧急性、处理难度和可行动性之间形成了更清晰的第一步。`
    };
  }

  function buildPersonalizedNote(payload) {
    const notes = {
      "low-energy": {
        en: "Because your current energy is low, the first step should be smaller than usual.",
        zh: "考虑到你现在精力较低，第一步应该比平时更小。"
      },
      today: {
        en: "Because you need something workable today, the suggestion stops after one visible action.",
        zh: "考虑到你需要今天就能开始的事，建议会在一个可见的小动作后停下。"
      },
      "involves-other": {
        en: "Because another person is involved, the first step stays private and avoids immediate confrontation.",
        zh: "考虑到这件事涉及他人，第一步会保持私密，并避开立即对抗。"
      },
      "not-talk": {
        en: "You do not need to explain or share anything yet. The step can remain entirely private.",
        zh: "你现在不需要解释或分享任何内容，这一步可以完全只留给自己。"
      },
      "organize-first": {
        en: "Because you only want to organize it first, the suggestion focuses on naming and sorting.",
        zh: "考虑到你只想先整理一下，建议会集中在命名和区分，而不是扩大行动。"
      }
    };

    const selectedNotes = payload.contextChips
      .map((chip) => notes[chip])
      .filter(Boolean);

    if (selectedNotes.length) {
      return {
        en: selectedNotes.map((item) => item.en).join(" "),
        zh: selectedNotes.map((item) => item.zh).join("")
      };
    }

    const variableNotes = {
      control: {
        en: "Low control is the strongest variable, so the suggestion focuses only on the part you can start yourself.",
        zh: "失控感是当前最明显的变量，因此建议只聚焦在你可以自己开始的部分。"
      },
      intensity: {
        en: "Intensity is the strongest variable, so the suggestion stays brief and avoids adding another large task.",
        zh: "压力强度是当前最明显的变量，因此建议会保持简短，不再增加一个大任务。"
      },
      duration: {
        en: "Duration is the strongest variable, so the first step aims to interrupt the pattern rather than finish everything.",
        zh: "持续时间是当前最明显的变量，因此第一步只尝试打断惯性，而不是完成全部。"
      },
      body: {
        en: "Body response is the strongest variable, so the suggestion leaves room to slow down physically first.",
        zh: "身体反应是当前最明显的变量，因此建议会先给身体留出慢下来的空间。"
      },
      expression: {
        en: "Expression difficulty is the strongest variable, so the suggestion does not require sharing anything.",
        zh: "表达困难是当前最明显的变量，因此建议不会要求你把内容分享出去。"
      },
      gap: {
        en: "Expectation gap is the strongest variable, so the suggestion returns to one concrete fact or role.",
        zh: "预期落差是当前最明显的变量，因此建议会回到一个具体事实或当前角色。"
      }
    };
    return variableNotes[payload.keyVariable.id] || variableNotes.intensity;
  }

  function buildAdjustedHint(payload) {
    const source = payload.selectedGuideSource;
    const contexts = payload.contextChips;

    if (source === "academic" && contexts.includes("low-energy")) {
      return {
        en: "Do not make a full plan. Only name the nearest task.",
        zh: "不要制定完整计划，只先写下最近的一个任务。"
      };
    }
    if ((source === "relationship" || source === "family") &&
        (contexts.includes("involves-other") || contexts.includes("not-talk"))) {
      return {
        en: "Keep the first note private. Do not contact anyone as part of this step.",
        zh: "先把第一条记录只留给自己，这一步不需要联系任何人。"
      };
    }
    if (contexts.includes("low-energy")) {
      return {
        en: `Use only the first part of ${payload.matchedAction.title.split(" / ")[0]}. Stop after one small mark on the page.`,
        zh: `只完成“${payload.matchedAction.title.split(" / ")[1] || payload.matchedAction.title}”的第一小部分，留下一个简单记录后就可以停下。`
      };
    }
    if (contexts.includes("organize-first")) {
      return {
        en: "Only name and sort one item. No further response is needed today.",
        zh: "只命名并整理一项内容，今天不需要继续做出回应。"
      };
    }
    if (contexts.includes("today")) {
      return {
        en: "Choose the smallest version that can be completed today, and stop after that one action.",
        zh: "选择今天可以完成的最小版本，并在这一个动作后停下。"
      };
    }
    return adjustedHints[source] || adjustedHints.physical;
  }

  function generateMockAIGuidance(payload) {
    const aiReason = buildAIReason(payload);
    return {
      aiReason,
      reasonTags: buildReasonTags(payload.recommendedScores),
      personalizedNote: buildPersonalizedNote(payload),
      adjustedStepHint: buildAdjustedHint(payload),
      basis: {
        pressureGravity: payload.recommendedScores.pressureGravity,
        actionability: payload.recommendedScores.actionability,
        difficulty: payload.recommendedScores.difficulty,
        urgency: payload.recommendedScores.urgency,
        guidancePriority: payload.recommendedScores.guidancePriority
      }
    };
  }

  async function callRealLLMAPI(payload) {
    // Future extension only.
    // Do not put API keys in frontend code.
    // Real API calls should go through a backend or serverless function.
    return null;
  }

  window.LLMGuidancePort = {
    buildAIGuidancePayload,
    generateMockAIGuidance,
    callRealLLMAPI
  };
  window.buildAIGuidancePayload = buildAIGuidancePayload;
  window.generateMockAIGuidance = generateMockAIGuidance;
  window.callRealLLMAPI = callRealLLMAPI;
  window.buildGuidancePayload = buildAIGuidancePayload;
  window.generateMockLLMGuidance = generateMockAIGuidance;
})();
