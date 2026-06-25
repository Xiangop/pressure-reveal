# Pressure Reveal / 压力可视化装置

Pressure Reveal is a low-burden pressure structure visualization prototype.

> Reveal the structure — then adjust the orbit.

它把一个或多个压力来源转化为“中心恒星 + 环绕行星”的轨道结构。用户可以只观察，也可以自愿进入 Guided Re-orbit / 引导式压力调轨，完成一个低负担行动。

## Project Boundary / 项目边界

- No login / 不需要登录
- No upload or storage / 不上传、不存储
- No backend or external API / 当前无后端与外部 API
- No open chat / 不提供开放聊天
- Structured reflection only / 仅提供结构化观察与行动入口

## Current Flow / 当前流程

1. Landing / 首页
2. Onboarding / 项目说明
3. Pressure Structure Type / 单一来源或复合压力
4. Source Selection / 压力来源选择
5. SIDCBEG Parameters / 分来源参数输入
6. Orbital Pressure Map / 轨道压力图
7. AI-assisted Guided Re-orbit Entry / 自愿进入大模型辅助调轨
8. Guided Re-orbit / 算法推荐、结构化解释并允许改选来源
9. Re-orbit Feedback / 动态调轨反馈
10. Recovery Breathing / 呼吸重置

## Pressure Sources / 压力来源

- Academic / Deadline
- Future / Career
- Social Comparison
- Relationship
- Family Responsibility
- Identity Transition
- Physical State

Compound pressure is a structure type, not a source item.

## Scoring / 评分

`pressureGravity` 决定中心恒星：

```text
intensity × 0.30
+ duration × 0.20
+ control × 0.20
+ body × 0.10
+ expression × 0.10
+ gap × 0.10
```

`guidancePriority` 决定引导页的默认推荐：

```text
pressureGravity × 0.45
+ actionability × 0.25
+ urgency × 0.20
- difficulty × 0.20
```

`urgency` 由来源基础紧急性和 SIDCBEG 参数推导，并限制在 1–10。

## AI-assisted Guidance / 大模型辅助引导

当前版本不请求外部服务。基础算法负责排序，`llmMock.js` 负责把结构化分数、当前压力源、关键变量和最多两个 context chips 转译为：

- AI-assisted reason / 大模型辅助解释
- Personalized note / 个性化说明
- Adjusted first step / 微调后的第一步

行动仍限定在 `actions.js` 的七套低负担模板中，不提供开放聊天。真实模型接口预留为 `callRealLLMAPI(payload)`，未来应通过后端或 serverless function 调用。

## File Structure / 文件结构

- `index.html`：十步页面流程。
- `style.css`：布局、轨道视觉、引导与反馈样式。
- `script.js`：状态管理、页面切换、参数保存与流程控制。
- `scoring.js`：Pressure Gravity、Urgency、Guidance Priority。
- `actions.js`：七类分步行动与来源反馈。
- `llmMock.js`：`buildAIGuidancePayload(state)`、`generateMockAIGuidance(payload)` 和真实服务接口预留。
- `orbital.js`：SVG 轨道图、来源高亮与调轨动画。
- `sketch.js`：旧版实验渲染代码，当前页面不加载。

## How to Run / 如何运行

可以直接打开 `index.html`，或在本目录启动静态服务器：

```powershell
python -m http.server 8765
```

然后访问 `http://127.0.0.1:8765/index.html`。

## Recommended Full Test / 推荐完整测试

1. 选择 `Single-source pressure`，连续点击两个来源，确认只保留最后一个。
2. Restart 后选择 `Compound pressure`，选择 Academic、Relationship、Future。
3. Academic：Intensity 9、Duration 8、Control 8。
4. Relationship：Intensity 8、Duration 8、Expression 9。
5. Future：Intensity 7、Expectation Gap 9。
6. Generate 后确认 Academic 是中心恒星，另外两个来源是环绕行星。
7. 点击 `Start guided re-orbit`，确认默认推荐 Academic，并显示理由标签与评分依据。
8. 选择 `I have very low energy`，确认个性化建议要求把第一步缩小。
9. 改选 Relationship，确认行动是 `One-sentence Expression / 一句话表达`。
10. 点击 `I finished this step`，确认对应来源距离变远、速度变慢、颜色变浅、体积略小，但不会消失。
11. 返回结果页，确认调轨状态仍保留。
12. 进入呼吸重置并点击 Restart，确认模式、来源、参数、context chips 和引导记录全部清空。
