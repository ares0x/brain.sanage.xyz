/**
 * Real-world benefit mappings for each game.
 *
 * Displayed on the result page to help users understand
 * what their cognitive training means in everyday life.
 */

export interface RealWorldMapping {
  gameId: string;
  title: string;
  scenarios: string[];
}

export const REAL_WORLD_MAPPINGS: Record<string, RealWorldMapping> = {
  "stroop-test": {
    gameId: "stroop-test",
    title: "专注拉回",
    scenarios: [
      "在嘈杂咖啡馆也能专注读一本书",
      "手机弹窗闪过，不被它带走注意力",
      "走神后能快速回到原本在做的事",
    ],
  },
  flanker: {
    gameId: "flanker",
    title: "抗干扰训练",
    scenarios: [
      "周围有人聊天也能保持专注",
      "从杂乱信息里一眼找到目标",
      "多件事同时进行时不迷失重点",
    ],
  },
  "go-nogo": {
    gameId: "go-nogo",
    title: "冲动控制",
    scenarios: [
      "想脱口而出的话能先停一停",
      "减少冲动消费和情绪化决定",
      "面对诱惑时能守住原定计划",
    ],
  },
  "nback-memory": {
    gameId: "nback-memory",
    title: "工作记忆",
    scenarios: [
      "临时记个号码不用写下来",
      "边听边记笔记不走神",
      "同时处理几件事不容易混乱",
    ],
  },
  "task-switching": {
    gameId: "task-switching",
    title: "专注切换",
    scenarios: [
      "刷完手机能快速回到工作状态",
      "不同任务间切换更灵活顺畅",
      "减少「做着 A 想起 B」的走神",
    ],
  },
  "schulte-grid": {
    gameId: "schulte-grid",
    title: "舒尔特方格",
    scenarios: [
      "快速扫描文档找到关键信息",
      "阅读时一眼捕捉更多内容",
      "扩大视野范围，减少逐字阅读",
    ],
  },
  "reaction-time": {
    gameId: "reaction-time",
    title: "反应速度",
    scenarios: [
      "开车时对突发状况反应更敏捷",
      "运动中能更快做出动作判断",
      "及时发现环境中的细微变化",
    ],
  },
  "attention-span": {
    gameId: "attention-span",
    title: "专注力追踪",
    scenarios: [
      "长时间读书不走神、不翻手机",
      "听完一整节课不犯困走神",
      "深度工作时杂念不容易闯入",
    ],
  },
  "digit-span": {
    gameId: "digit-span",
    title: "数字广度",
    scenarios: [
      "记住验证码不用反复回头看",
      "心算时能在脑中保持更多数字",
      "记住购物清单不用依赖手机",
    ],
  },
  "focus-gaze": {
    gameId: "focus-gaze",
    title: "凝视启动",
    scenarios: [
      "30 秒进入工作状态，不再拖拖拉拉",
      "开始工作前有一个简单的启动仪式",
      "从放松模式快速切换到专注模式",
    ],
  },
  "breathing-478": {
    gameId: "breathing-478",
    title: "4-7-8 呼吸法",
    scenarios: [
      "睡前几分钟就能放松入睡",
      "焦虑时有一个即用的平复工具",
      "紧张时刻深呼吸就能恢复冷静",
    ],
  },
};
