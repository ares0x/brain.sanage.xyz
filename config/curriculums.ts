import type { GameId } from "@/lib/storage/types";

export type CohortRole = "student" | "worker" | "senior" | "enthusiast";
export type ImprovementGoal = "focus" | "memory" | "calm" | "speed";

export interface CohortPersona {
  role: CohortRole;
  goal: ImprovementGoal;
  createdAt: number;
}

export interface RecommendedGame {
  gameId: GameId;
  reason: string;
}

export interface CurriculumTrack {
  title: string;
  emoji: string;
  badge: string;
  description: string;
  games: RecommendedGame[];
}

export const COHORT_METADATA: Record<
  CohortRole,
  { name: string; emoji: string; tagline: string; description: string }
> = {
  student: {
    name: "校园学生",
    emoji: "🎓",
    tagline: "提升学业专注与高效备考",
    description: "针对高浓度学习、考试复习与知识记忆设计的科学脑力轨道。",
  },
  worker: {
    name: "职场白领",
    emoji: "💼",
    tagline: "告别工作分神与多任务焦虑",
    description: "为多线程任务切换、抗干扰、以及开工前快速进入高能专注状态定制。",
  },
  senior: {
    name: "银发长辈",
    emoji: "👵",
    tagline: "保持头脑常青与灵活反应",
    description: "专注敏捷反应、日常记忆维持，在温和有趣的挑战中延缓脑力衰老。",
  },
  enthusiast: {
    name: "脑力爱好者",
    emoji: "⚡",
    tagline: "探索大脑潜能与巅峰极限",
    description: "提供高难度、深维度的认知负荷任务，追求极致脑力、手眼协调与工作记忆容量。",
  },
};

export const GOAL_METADATA: Record<
  ImprovementGoal,
  { name: string; emoji: string; tagline: string; description: string }
> = {
  focus: {
    name: "专注力",
    emoji: "🎯",
    tagline: "减少杂念，深度沉浸",
    description: "重建专注屏障，提升抗干扰和持续关注稳定性。",
  },
  memory: {
    name: "记忆力",
    emoji: "🧠",
    tagline: "扩容大脑，过目不忘",
    description: "扩充工作记忆容量，加强瞬间与长时记忆提取效率。",
  },
  calm: {
    name: "平静减压",
    emoji: "🍃",
    tagline: "平复焦虑，清空大脑",
    description: "调节自主神经，让紧张、疲惫的大脑快速降温并恢复活力。",
  },
  speed: {
    name: "反应速度",
    emoji: "⚡",
    tagline: "快人一步，敏锐协同",
    description: "加速视听觉反应通道，优化手眼协同与神经决策耗时。",
  },
};

export const CURRICULUM_MATRIX: Record<
  CohortRole,
  Record<ImprovementGoal, CurriculumTrack>
> = {
  student: {
    focus: {
      title: "学生专注力特训轨道",
      emoji: "🎓🎯",
      badge: "学业精进",
      description: "专为校园备考与高强度学习设计，全面稳固您的长效专注屏障，抵抗复习中的外界干扰。",
      games: [
        { gameId: "attention-span", reason: "🎓 专注耐力 · 练习考场长效注意「平板支撑」" },
        { gameId: "schulte-grid", reason: "🎓 快速检索 · 提高试卷扫视与定位数字速度" },
        { gameId: "flanker", reason: "🎓 强效抗扰 · 排除教室杂音，沉浸自主刷题" },
      ],
    },
    memory: {
      title: "学生记忆力提升轨道",
      emoji: "🎓🧠",
      badge: "超级闪存",
      description: "针对复杂公式推导、概念背诵打造的记忆扩容计划，强化大脑物理内存与瞬时提取效率。",
      games: [
        { gameId: "nback-memory", reason: "🎓 黄金脑容量 · 挑战高强工作记忆，推导复杂公式" },
        { gameId: "digit-span", reason: "🎓 记忆广度 · 扩容大脑短时内存，速记知识概念" },
        { gameId: "schulte-grid", reason: "🎓 瞬时提取 · 加速手眼协同，缩短思维检索路径" },
      ],
    },
    calm: {
      title: "学生平静减压轨道",
      emoji: "🎓🍃",
      badge: "心平气和",
      description: "舒缓过度刷题带来的神经紧绷与考前焦虑，帮助您科学合理“降温”，保持最佳清醒度。",
      games: [
        { gameId: "breathing-478", reason: "🎓 考前降温 · 舒缓过度刷题的紧绷心率与焦虑感" },
        { gameId: "focus-gaze", reason: "🎓 状态归零 · 凝视蓝斑核，激活自习前的深度专注" },
        { gameId: "attention-span", reason: "🎓 稳定心神 · 温和慢速追踪，修复碎片化注意力" },
      ],
    },
    speed: {
      title: "学生反应速度轨道",
      emoji: "🎓⚡",
      badge: "神经跃迁",
      description: "激活视听觉判断与快速手眼协同，训练考试中的瞬间作答直觉，减少粗心带来的漏看。",
      games: [
        { gameId: "reaction-time", reason: "🎓 神经闪电 · 挑战基础神经反射，维持高度敏捷" },
        { gameId: "stroop-test", reason: "🎓 快速抗干扰 · 冲突颜色文字判断，提高作答决策速度" },
        { gameId: "go-nogo", reason: "🎓 精确制动 · 训练大脑急停能力，减少粗心漏看" },
      ],
    },
  },
  worker: {
    focus: {
      title: "白领多任务深度聚焦轨道",
      emoji: "💼🎯",
      badge: "深度沉浸",
      description: "专为对抗开放式工位噪音、减少在聊天软件和表格报告之间频繁“切挡”的注意力流耗设计。",
      games: [
        { gameId: "task-switching", reason: "💼 认知灵活 · 减少从沟通到表格的多任务切换内耗" },
        { gameId: "flanker", reason: "💼 抗噪深度 · 隔绝开放式工位的嘈杂，保持沉浸" },
        { gameId: "attention-span", reason: "💼 持续追踪 · 稳固视线与思维，降低疲劳分神率" },
      ],
    },
    memory: {
      title: "白领并发工作记忆轨道",
      emoji: "💼🧠",
      badge: "多线并进",
      description: "强化高负荷信息并发处理，助您稳固工作流中的零碎数据、业务指标与代办要点，不易忘事。",
      games: [
        { gameId: "nback-memory", reason: "💼 多线程记忆 · 记住复杂业务逻辑，提升并发处理力" },
        { gameId: "digit-span", reason: "💼 核心广度 · 稳固工作流中的零碎数据与关键指标" },
        { gameId: "task-switching", reason: "💼 规则切换 · 确保多任务切换下信息互不干扰" },
      ],
    },
    calm: {
      title: "白领正念解压调理轨道",
      emoji: "💼🍃",
      badge: "元气重启",
      description: "利用碎片时间快速清空大脑高压态，平复紧张会议或项目汇报前的焦虑，实现即时充能。",
      games: [
        { gameId: "breathing-478", reason: "💼 会前减压 · 快速激活副交感神经，平复紧张汇报" },
        { gameId: "focus-gaze", reason: "💼 午后重启 · 盯住一点激活脑干，清空过度内耗" },
        { gameId: "attention-span", reason: "💼 舒缓追踪 · 视觉慢速跟随，提供身心安宁状态" },
      ],
    },
    speed: {
      title: "白领极速决策跃迁轨道",
      emoji: "💼⚡",
      badge: "果断高效",
      description: "优化大脑高级神经传导，提升在短时间内的业务判断和临机反应力，操作更快更敏锐。",
      games: [
        { gameId: "reaction-time", reason: "💼 高能脑网速 · 提升神经传导，加速键盘操作决策" },
        { gameId: "stroop-test", reason: "💼 瞬间决策 · 克服字义冲突干扰，提升临场反应力" },
        { gameId: "task-switching", reason: "💼 飞速换挡 · 提高会议和方案汇报时的敏锐对答" },
      ],
    },
  },
  senior: {
    focus: {
      title: "银发长辈视听视界激活轨道",
      emoji: "👵🎯",
      badge: "身心合一",
      description: "在温和、有规律的视觉追踪与按序查找中，锻炼眼球搜索能力，保持思维安定与平稳。",
      games: [
        { gameId: "schulte-grid", reason: "👵 视野激活 · 锻炼眼球搜索与手眼配合的稳定性" },
        { gameId: "attention-span", reason: "👵 视力追踪 · 温和锻炼手部动作和视觉跟随" },
        { gameId: "go-nogo", reason: "👵 沉稳决策 · 练习安全合理的认知抑制，不急不躁" },
      ],
    },
    memory: {
      title: "银发长辈日常记忆健脑轨道",
      emoji: "👵🧠",
      badge: "岁月留金",
      description: "专注于稳固电话号码、买菜账目等生活记忆容量，以趣味脑力体操形式激活大脑活跃度。",
      games: [
        { gameId: "digit-span", reason: "👵 记忆稳固 · 锻炼日常数字、电话等生活记忆容量" },
        { gameId: "schulte-grid", reason: "👵 顺序检索 · 维护视觉与数字认知的协同连接" },
        { gameId: "nback-memory", reason: "👵 脑力体操 · 温和挑战工作记忆，预防认知衰退" },
      ],
    },
    calm: {
      title: "银发长辈神凝安定轨道",
      emoji: "👵🍃",
      badge: "松静自然",
      description: "跟随舒适放松的天然呼吸节奏平稳心率，舒缓周身紧绷与失眠前的烦闷焦虑。",
      games: [
        { gameId: "breathing-478", reason: "👵 深呼吸练习 · 调节血氧与心率，舒缓身体紧绷" },
        { gameId: "focus-gaze", reason: "👵 凝神安定 · 温和安定心神，缓解睡眠前焦虑" },
        { gameId: "attention-span", reason: "👵 慢速运动 · 舒适慢速跟随，提供宁静愉悦感" },
      ],
    },
    speed: {
      title: "银发长辈灵活防衰敏捷轨道",
      emoji: "👵⚡",
      badge: "步履矫健",
      description: "激活神经突触的瞬间传递，锻炼大脑“一键急停”反应力，为日常生活中的防摔防错保驾护航。",
      games: [
        { gameId: "reaction-time", reason: "👵 反应维持 · 激活神经反射，维持手脚活动敏捷度" },
        { gameId: "go-nogo", reason: "👵 防滑防错 · 锻炼大脑瞬间制动，确保日常出行安全" },
        { gameId: "stroop-test", reason: "👵 冲突克制 · 激活抑制中心，锻炼大脑抗老化能力" },
      ],
    },
  },
  enthusiast: {
    focus: {
      title: "脑力极客无瑕专注轨道",
      emoji: "⚡🎯",
      badge: "心流神域",
      description: "极致剥离一切杂念的严苛抗扰挑战，追求无懈可击的长效关注与高度纯净的心流体验。",
      games: [
        { gameId: "flanker", reason: "⚡ 极限抗扰 · 挑战高强度箭头干扰，实现完美聚焦" },
        { gameId: "attention-span", reason: "⚡ 极致追踪 · 追求无懈可击的持续物理视线锁定" },
        { gameId: "stroop-test", reason: "⚡ 冲突对抗 · 在字形字色剧烈干扰下挑战精细控制力" },
      ],
    },
    memory: {
      title: "脑力极客巅峰工作记忆轨道",
      emoji: "⚡🧠",
      badge: "超维极速",
      description: "挑战人类工作记忆极限高墙的魔鬼级健脑体操，刷新流体智力在超高负荷下的并发存储阈值。",
      games: [
        { gameId: "nback-memory", reason: "⚡ 巅峰工作记忆 · 突破 N-Back 极限级高能脑容量体操" },
        { gameId: "digit-span", reason: "⚡ 脑内闪存上限 · 刷新大脑的物理内存承载位宽" },
        { gameId: "task-switching", reason: "⚡ 多脑区联动 · 体验极速在多元逻辑集之间穿梭的快感" },
      ],
    },
    calm: {
      title: "脑力极客意念超觉觉醒轨道",
      emoji: "⚡🍃",
      badge: "深空静穆",
      description: "以静制动，通过高浓度盯盘与极限憋气训练，挑战脑干神经自主平衡，达到高阶精神安定。",
      games: [
        { gameId: "focus-gaze", reason: "⚡ 神经蓝斑核激活 · 探索神经极境，达到极致的专注状态" },
        { gameId: "breathing-478", reason: "⚡ 心脏自主控制 · 深度调节副交感神经，探索呼吸极限" },
        { gameId: "attention-span", reason: "⚡ 流体追踪 · 体验注意力进入「心流」的宁静世界" },
      ],
    },
    speed: {
      title: "脑力极客零点反射爆发轨道",
      emoji: "⚡⚡",
      badge: "毫秒必争",
      description: "突破毫秒级生理反射弧的极致测试，实现绝对自控力、微秒视动决策以及超高爆发的急速释放。",
      games: [
        { gameId: "reaction-time", reason: "⚡ 绝对极限反应 · 挑战毫秒级神经反射上限，刷新纪录" },
        { gameId: "stroop-test", reason: "⚡ 极速冲突抑制 · 短时间内压制本能反应并做出正确抉择" },
        { gameId: "go-nogo", reason: "⚡ 闪电判断制动 · 极速反射条件下的绝对自主控制测试" },
      ],
    },
  },
};

/**
 * Gets a customized curriculum track based on the user's role and goal.
 */
export function getRecommendedTrack(
  role: CohortRole,
  goal: ImprovementGoal
): CurriculumTrack {
  return CURRICULUM_MATRIX[role]?.[goal] || CURRICULUM_MATRIX.student.focus;
}
