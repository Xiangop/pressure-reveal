(function () {
  const sourceMeta = {
    academic: { label: "Academic / Deadline", zh: "学业 / DDL", difficulty: 2, actionability: 8, baseUrgency: 7 },
    career: { label: "Future / Career", zh: "未来 / 就业", difficulty: 4, actionability: 7, baseUrgency: 5 },
    social: { label: "Social Comparison", zh: "同伴比较", difficulty: 3, actionability: 7, baseUrgency: 4 },
    relationship: { label: "Relationship", zh: "人际关系", difficulty: 6, actionability: 4, baseUrgency: 4 },
    family: { label: "Family Responsibility", zh: "家庭 / 责任", difficulty: 6, actionability: 4, baseUrgency: 4 },
    identity: { label: "Identity Transition", zh: "身份转换", difficulty: 5, actionability: 5, baseUrgency: 3 },
    physical: { label: "Physical State", zh: "身体状态", difficulty: 2, actionability: 8, baseUrgency: 6 }
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizeIntensity(value) {
    const numeric = Number(value) || 0;
    return numeric > 10
      ? clamp(numeric / 10, 0, 10)
      : clamp(numeric, 0, 10);
  }

  function roundScore(value) {
    return Math.round(value * 100) / 100;
  }

  function computePressureGravity(source, profile) {
    if (!profile) return 0;
    const intensity = normalizeIntensity(profile.intensity);
    return roundScore(
      intensity * 0.30 +
      profile.duration * 0.20 +
      profile.control * 0.20 +
      profile.body * 0.10 +
      profile.expression * 0.10 +
      profile.gap * 0.10
    );
  }

  function computeUrgency(source, profile) {
    const meta = sourceMeta[source] || { baseUrgency: 4 };
    const intensity = normalizeIntensity(profile.intensity);
    const urgency =
      meta.baseUrgency +
      intensity * 0.15 +
      profile.duration * 0.10 +
      profile.control * 0.10;
    return roundScore(clamp(urgency, 1, 10));
  }

  function computeGuidancePriority(source, profile) {
    const meta = sourceMeta[source] || { difficulty: 5, actionability: 5 };
    const pressureGravity = computePressureGravity(source, profile);
    const urgency = computeUrgency(source, profile);
    return roundScore(
      pressureGravity * 0.45 +
      meta.actionability * 0.25 +
      urgency * 0.20 -
      meta.difficulty * 0.20
    );
  }

  function getSourceScores(source, profile) {
    const meta = sourceMeta[source];
    return {
      pressureGravity: computePressureGravity(source, profile),
      urgency: computeUrgency(source, profile),
      guidancePriority: computeGuidancePriority(source, profile),
      actionability: meta.actionability,
      difficulty: meta.difficulty
    };
  }

  function rankSources(currentState, scoreName) {
    return currentState.selectedSources
      .filter((source) => currentState.sourceProfiles[source])
      .map((source) => ({
        source,
        profile: currentState.sourceProfiles[source],
        scores: getSourceScores(source, currentState.sourceProfiles[source])
      }))
      .sort((a, b) => b.scores[scoreName] - a.scores[scoreName]);
  }

  function getDominantSource(currentState) {
    return rankSources(currentState, "pressureGravity")[0]?.source || null;
  }

  function getRecommendedGuideSource(currentState) {
    return rankSources(currentState, "guidancePriority")[0]?.source || null;
  }

  function getRecommendationReason(source, scores, sourceOptions) {
    const name = sourceOptions[source];
    const highUrgency = scores.urgency >= 7.5;
    const highGravity = scores.pressureGravity >= 7;
    const workable = scores.actionability >= 7;
    const complex = scores.difficulty >= 6;

    if (source === "academic") {
      return {
        en: "It carries strong pressure gravity and near-term urgency, while still being easy to divide into one small action.",
        zh: "它当前的压力引力与近期紧急性较高，同时更容易切分成一个可以立即开始的小动作。"
      };
    }
    if (source === "physical") {
      return {
        en: "A small body reset is highly actionable and can create useful distance before approaching other sources.",
        zh: "身体重置具有较高可行动性，可以先拉开一点距离，再观察其他压力来源。"
      };
    }
    if (source === "relationship" || source === "family") {
      return {
        en: `This source matters, but its first step should stay low-risk. ${name.short} is approached through naming or boundaries rather than immediate confrontation.`,
        zh: `这个来源很重要，但第一步需要保持低风险。系统会从命名或边界入手，而不是要求立即沟通或对抗。`
      };
    }
    if (workable && highUrgency) {
      return {
        en: "It combines near-term urgency with a small action that can be started today.",
        zh: "它同时具备近期紧急性，也能被切分成今天就可以开始的小动作。"
      };
    }
    if (highGravity && workable) {
      return {
        en: "Its pull is noticeable, and there is a practical first step available without taking on the whole source at once.",
        zh: "它的引力较明显，同时存在一个不需要一次承担全部问题的实际入口。"
      };
    }
    if (complex) {
      return {
        en: "It is approached through a contained, low-burden entry rather than a large immediate response.",
        zh: "系统会从一个范围清楚、负担较低的入口开始，而不是要求立即做出大幅行动。"
      };
    }
    return {
      en: "Its balance of pressure gravity, urgency, and actionability makes it a workable first step.",
      zh: "它在压力引力、紧急性与可行动性之间更适合作为当前第一步。"
    };
  }

  const api = {
    sourceMeta,
    computePressureGravity,
    computeUrgency,
    computeGuidancePriority,
    getSourceScores,
    rankSources,
    getDominantSource,
    getRecommendedGuideSource,
    getRecommendationReason
  };

  window.PressureScoring = api;
  Object.assign(window, api);
})();
