/**
 * Scene-based game groupings for the homepage.
 *
 * Users browse by "what I need right now" instead of "what type of game this is".
 */

export interface GameScene {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  gameHrefs: string[];
}

export const GAME_SCENES: GameScene[] = [
  {
    id: "warm-up",
    emoji: "🌅",
    title: "我想进入状态",
    subtitle: "开工前、学习前，5 分钟热身",
    color: "#D4A832",
    gameHrefs: ["/schulte-grid", "/reaction-time", "/flanker", "/focus-gaze"],
  },
  {
    id: "deep-focus",
    emoji: "🎯",
    title: "我要专心工作",
    subtitle: "需要长时间专注、屏蔽干扰",
    color: "#5A9DE0",
    gameHrefs: ["/attention-span", "/go-nogo", "/flanker"],
  },
  {
    id: "reset",
    emoji: "😵",
    title: "我脑子很乱",
    subtitle: "刷完手机后、信息过载、走神了",
    color: "#D4847C",
    gameHrefs: ["/stroop-test", "/breathing-478", "/focus-gaze"],
  },
  {
    id: "train",
    emoji: "🧠",
    title: "我想训练大脑",
    subtitle: "有成长目标、主动提升",
    color: "#A87AD4",
    gameHrefs: ["/nback-memory", "/digit-span", "/task-switching"],
  },
  {
    id: "relax",
    emoji: "🌙",
    title: "我想放松",
    subtitle: "睡前、疲惫、焦虑",
    color: "#6BA7A8",
    gameHrefs: ["/breathing-478"],
  },
];
