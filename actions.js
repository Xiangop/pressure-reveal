(function () {
  const guidedActions = {
    academic: {
      title: "Time Slicing / 时间切片",
      steps: [
        ["Write down the nearest task or deadline.", "写下最近的一个任务或 DDL。"],
        ["Cut it into one action that can be started within 25 minutes.", "把它切成一个 25 分钟内可以开始的小动作。"],
        ["Open the file, write one line, or organize one title.", "打开文件，写下一行字，或整理一个标题。"]
      ]
    },
    career: {
      title: "Reality Anchor / 现实锚点",
      steps: [
        ["Choose one uncertainty you want to verify.", "选择一个你想确认的不确定问题。"],
        ["Find one concrete fact: a date, a requirement, or a next step.", "找到一个具体事实：日期、要求或下一步。"],
        ["Stop searching after one useful fact.", "找到一个有用事实后先停止继续搜索。"]
      ]
    },
    social: {
      title: "Attention Reclaim / 视线回收",
      steps: [
        ["Name one comparison source.", "说出一个容易引发比较的入口。"],
        ["Close it for half a day.", "暂时关闭它半天。"],
        ["Write down one thing you can do at your own rhythm.", "写下一件可以按照自己节奏完成的事。"]
      ]
    },
    relationship: {
      title: "One-sentence Expression / 一句话表达",
      steps: [
        ["Do not try to explain everything.", "不要试图一次解释全部事情。"],
        ["Write one sentence beginning with “I feel pressure because...”", "只写一句以“我感到压力是因为……”开头的话。"],
        ["Keep it private first. You do not have to send it.", "先自己保存，不需要马上发给任何人。"]
      ]
    },
    family: {
      title: "Boundary Split / 边界分离",
      steps: [
        ["Draw two columns.", "画两列。"],
        ["Left: things I must do. Right: things I am only worrying about.", "左边写“我必须做的事”，右边写“我只是在担心的事”。"],
        ["Put only one item in each column.", "每列先只写一项。"]
      ]
    },
    identity: {
      title: "Role Naming / 角色命名",
      steps: [
        ["Write down your current role in one phrase.", "用一个短语写下你当前的身份。"],
        ["Add one sentence: “At this stage, I only need to...”", "再写一句：“在这个阶段，我只需要……”"],
        ["Do not define your whole future today.", "今天不需要定义完整的未来。"]
      ]
    },
    physical: {
      title: "Body Reset / 身体重置",
      steps: [
        ["Take six slow breaths.", "做六轮慢呼吸。"],
        ["Drink water and leave the screen for five minutes.", "喝水，并离开屏幕五分钟。"],
        ["Notice whether your body feels slightly less tense.", "感受身体是否有一点点放松。"]
      ]
    }
  };

  const feedbackBySource = {
    academic: [
      "The task is still there, but the next step is smaller now.",
      "任务仍然存在，但下一步已经变小了。"
    ],
    career: [
      "The future is still uncertain, but one fact has been anchored.",
      "未来仍然不确定，但你已经确认了一个事实。"
    ],
    social: [
      "Comparison is still nearby, but your attention has returned to your own rhythm.",
      "比较仍然在附近，但你的注意力已经回到自己的节奏。"
    ],
    relationship: [
      "The relationship pressure is still there, but it no longer has to stay completely unnamed.",
      "人际压力仍然存在，但它不再完全说不出口。"
    ],
    family: [
      "The responsibility remains, but its boundary is a little clearer now.",
      "责任仍然存在，但它的边界已经稍微清楚了一点。"
    ],
    identity: [
      "The transition continues, but today’s role has become a little clearer.",
      "转换仍在继续，但今天所处的角色已经稍微清楚了一点。"
    ],
    physical: [
      "The physical pressure is still present, but your body has been given a small pause.",
      "身体压力仍然存在，但你已经给身体留出了一小段缓冲。"
    ]
  };

  function getGuidedAction(source, profile) {
    return guidedActions[source] || guidedActions.physical;
  }

  function getGuidedActionSteps(source) {
    return getGuidedAction(source);
  }

  function getReorbitFeedback(source) {
    const pair = feedbackBySource[source] || [
      "The pressure is still there, but its orbit has shifted a little.",
      "压力仍然存在，但它与你的距离已经稍微改变。"
    ];
    return { en: pair[0], zh: pair[1] };
  }

  window.PressureActions = { guidedActions, getGuidedAction, getGuidedActionSteps, getReorbitFeedback };
  window.getGuidedAction = getGuidedAction;
  window.getGuidedActionSteps = getGuidedActionSteps;
  window.getReorbitFeedback = getReorbitFeedback;
})();
