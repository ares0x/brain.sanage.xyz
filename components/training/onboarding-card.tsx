"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Award,
  BookOpen,
  Briefcase,
  UserCheck,
  TrendingUp,
  Target,
  Brain,
  Wind,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COHORT_METADATA,
  GOAL_METADATA,
  getRecommendedTrack,
  type CohortRole,
  type ImprovementGoal,
} from "@/config/curriculums";
import { getTodayPlan, PERSONA_KEY } from "@/lib/training/plan-generator";

interface OnboardingCardProps {
  onComplete: () => void;
}

export function OnboardingCard({ onComplete }: OnboardingCardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRole, setSelectedRole] = useState<CohortRole | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<ImprovementGoal | null>(null);
  const [loadingText, setLoadingText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle loading animations in Step 3
  useEffect(() => {
    if (step !== 3) return;

    const texts = [
      "🔍 分析您的认知类型...",
      "🧬 匹配个性化脑力推荐模型...",
      "🛡️ 已生成首日科学热身训练集！",
    ];

    let currentIdx = 0;
    setLoadingText(texts[0]);

    const timer = setInterval(() => {
      currentIdx++;
      if (currentIdx < texts.length) {
        setLoadingText(texts[currentIdx]);
      } else {
        clearInterval(timer);
        // Move to Step 4 (Result screen)
        setStep(4);
      }
    }, 900);

    return () => clearInterval(timer);
  }, [step]);

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm h-96 animate-pulse" />
    );
  }

  const handleSelectRole = (role: CohortRole) => {
    setSelectedRole(role);
    // Auto-advance after a small delay for tactile feedback
    setTimeout(() => {
      setStep(2);
    }, 250);
  };

  const handleSelectGoal = (goal: ImprovementGoal) => {
    setSelectedGoal(goal);
    setTimeout(() => {
      setStep(3);
    }, 250);
  };

  const handleUnlockPlan = () => {
    if (!selectedRole || !selectedGoal) return;

    // Save persona to localStorage
    const persona = {
      role: selectedRole,
      goal: selectedGoal,
      createdAt: Date.now(),
    };
    window.localStorage.setItem(PERSONA_KEY, JSON.stringify(persona));

    // Force plan generator to recalculate today's plan based on persona
    // (By clearing the cached daily plan if it exists so it recreates it with custom currics)
    window.localStorage.removeItem("bs_daily_plan_v1");
    // Trigger plan generation
    getTodayPlan();

    // Fade out and notify parent to render DailyPlanCard
    onComplete();
  };

  const rolesList: { id: CohortRole; label: string; emoji: string; desc: string; icon: React.ElementType }[] = [
    {
      id: "student",
      label: COHORT_METADATA.student.name,
      emoji: COHORT_METADATA.student.emoji,
      desc: COHORT_METADATA.student.tagline,
      icon: BookOpen,
    },
    {
      id: "worker",
      label: COHORT_METADATA.worker.name,
      emoji: COHORT_METADATA.worker.emoji,
      desc: COHORT_METADATA.worker.tagline,
      icon: Briefcase,
    },
    {
      id: "senior",
      label: COHORT_METADATA.senior.name,
      emoji: COHORT_METADATA.senior.emoji,
      desc: COHORT_METADATA.senior.tagline,
      icon: UserCheck,
    },
    {
      id: "enthusiast",
      label: COHORT_METADATA.enthusiast.name,
      emoji: COHORT_METADATA.enthusiast.emoji,
      desc: COHORT_METADATA.enthusiast.tagline,
      icon: TrendingUp,
    },
  ];

  const goalsList: { id: ImprovementGoal; label: string; emoji: string; desc: string; icon: React.ElementType }[] = [
    {
      id: "focus",
      label: GOAL_METADATA.focus.name,
      emoji: GOAL_METADATA.focus.emoji,
      desc: GOAL_METADATA.focus.tagline,
      icon: Target,
    },
    {
      id: "memory",
      label: GOAL_METADATA.memory.name,
      emoji: GOAL_METADATA.memory.emoji,
      desc: GOAL_METADATA.memory.tagline,
      icon: Brain,
    },
    {
      id: "calm",
      label: GOAL_METADATA.calm.name,
      emoji: GOAL_METADATA.calm.emoji,
      desc: GOAL_METADATA.calm.tagline,
      icon: Wind,
    },
    {
      id: "speed",
      label: GOAL_METADATA.speed.name,
      emoji: GOAL_METADATA.speed.emoji,
      desc: GOAL_METADATA.speed.tagline,
      icon: Gauge,
    },
  ];

  // Get current recommendation to preview in Step 4
  const recommendedTrack =
    selectedRole && selectedGoal
      ? getRecommendedTrack(selectedRole, selectedGoal)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-border p-5 shadow-sm"
    >
      <AnimatePresence mode="wait">
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/8 text-primary px-2 py-0.5 rounded-md">
                  步骤 1 / 2
                </span>
                <span className="text-[10px] font-bold text-muted-secondary">
                  选择您的角色身份
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                告诉我们您的大脑日常
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                我们将为您定制最切合日常生活需求的脑力训练集。
              </p>
            </div>

            {/* List */}
            <div className="space-y-2">
              {rolesList.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedRole === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectRole(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border text-left transition-all duration-200 cursor-pointer group active:scale-98 min-h-[52px]",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-accent-hover hover:bg-background-soft"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-background-soft text-muted-secondary group-hover:text-primary"
                      )}
                    >
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate font-medium">
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-muted-secondary transition-transform group-hover:translate-x-0.5 shrink-0",
                        isSelected && "text-primary"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Goal Selection */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/8 text-primary px-2 py-0.5 rounded-md">
                    步骤 2 / 2
                  </span>
                  <span className="text-[10px] font-bold text-muted-secondary">
                    设定您的核心诉求
                  </span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-0.5 text-[10px] font-bold text-muted-secondary hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  上一步
                </button>
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                您目前最渴望获得哪些提升？
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                科学的大脑热身可以从最急迫的神经维度入手。
              </p>
            </div>

            {/* List */}
            <div className="space-y-2">
              {goalsList.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedGoal === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectGoal(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border text-left transition-all duration-200 cursor-pointer group active:scale-98 min-h-[52px]",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-accent-hover hover:bg-background-soft"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-background-soft text-muted-secondary group-hover:text-primary"
                      )}
                    >
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate font-medium">
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-muted-secondary transition-transform group-hover:translate-x-0.5 shrink-0",
                        isSelected && "text-primary"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 3: High Emotion Loading/Matching Screen */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center text-center py-10 space-y-5"
          >
            <div className="relative">
              {/* Outer soft breathing circle */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-[-12px] bg-primary/10 rounded-full blur-md"
              />
              <div className="w-16 h-16 rounded-full bg-primary/8 border border-primary/20 flex items-center justify-center relative">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
            </div>

            <div className="space-y-1.5">
              <motion.p
                key={loadingText}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-sm font-bold text-foreground min-h-[20px]"
              >
                {loadingText}
              </motion.p>
              <p className="text-[11px] text-muted-secondary font-medium px-4">
                基于哈佛、斯坦福等经典心理学认知范式，定制您的专属神经匹配矩阵。
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 4: Onboarding Result & Unlock Card */}
        {step === 4 && recommendedTrack && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 text-center py-1"
          >
            {/* Header Logo */}
            <div className="mx-auto w-12 h-12 rounded-full bg-accent/40 border border-accent-foreground/15 flex items-center justify-center relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.15 }}
                className="absolute"
              >
                <Sparkles className="w-5 h-5 text-accent-foreground" />
              </motion.div>
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E1F5EE] border border-[rgba(74,173,122,0.12)] text-[#4AAD7A]">
                <Award className="w-3 h-3" />
                智能归纳已就绪
              </span>
              <h3 className="font-serif text-[17px] font-bold text-foreground">
                解锁您的「{recommendedTrack.title}」
              </h3>
              <p className="text-xs text-muted-foreground px-3 leading-relaxed font-medium">
                {recommendedTrack.description}
              </p>
            </div>

            {/* Curriculum Games Preview */}
            <div className="bg-background-soft rounded-xl border border-border p-3.5 text-left space-y-2.5 max-w-sm mx-auto">
              <p className="text-[10px] font-bold text-muted-secondary tracking-wide uppercase">
                首日训练计划预览
              </p>
              <div className="space-y-2">
                {recommendedTrack.games.slice(0, 3).map((item) => (
                  <div key={item.gameId} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <p className="text-xs text-foreground leading-normal font-medium">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Unlock Button CTA */}
            <button
              onClick={handleUnlockPlan}
              className="w-full h-13 rounded-xl bg-primary hover:bg-[#C97B7B] active:scale-98 transition-all duration-200 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              解锁今日定制计划
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
