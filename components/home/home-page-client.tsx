"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Shield,
  Sparkles,
  Clock,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LabBadge } from "@/components/design/lab-badge";
import { SectionDivider } from "@/components/design/section-divider";
import { DailyPlanCard } from "@/components/training/daily-plan-card";
import { OnboardingCard } from "@/components/training/onboarding-card";
import { hasTrainingData } from "@/lib/training";
import { GAME_SCENES } from "@/config/game-scenes";
import { CommunityCard } from "@/components/game/community-card";
import { GAMES_LIST } from "@/config/games";

const games = GAMES_LIST;

const features = [
  {
    icon: Zap,
    title: "即时体验",
    description: "无需注册，打开即测，30 秒开始训练。",
  },
  {
    icon: Shield,
    title: "隐私优先",
    description: "数据仅存于本地浏览器，不上传服务器。",
  },
  {
    icon: Sparkles,
    title: "科学范式",
    description: "基于经典认知心理学实验设计。",
  },
];

export function HomePageClient() {
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(
    new Set(["warm-up"])
  );
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasPersona = typeof window !== "undefined" && !!window.localStorage.getItem("bs_onboarding_persona");
    const hasData = hasTrainingData();
    if (!hasPersona && !hasData) {
      setShowOnboarding(true);
    }
  }, []);

  const toggleScene = (sceneId: string) => {
    setExpandedScenes((prev) => {
      const next = new Set(prev);
      if (next.has(sceneId)) {
        next.delete(sceneId);
      } else {
        next.add(sceneId);
      }
      return next;
    });
  };

  const getGameByHref = (href: string) => games.find((g) => g.href === href);

  return (
    <main className="flex-1">
      {/* Main Dashboard Section: Handles responsive grid */}
      <section className="pt-6 pb-8 sm:pt-10 sm:pb-12 md:pt-12 md:pb-16">
        <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-6xl px-4 sm:px-5 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
            
            {/* Left Column: Hero Info & Daily plan - Sticky on Desktop */}
            <div className="lg:col-span-5 text-center lg:text-left lg:sticky lg:top-24 space-y-6 lg:space-y-8">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.06 }}
                  className="mb-3 sm:mb-4 lg:inline-block"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/40 text-accent-foreground border border-accent-foreground/15">
                    <Shield className="w-3 h-3 text-[#4A6B5A]" />
                    无需账号，打开即测
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 }}
                  className="font-serif text-[1.5rem] sm:text-[1.75rem] md:text-[2.25rem] font-bold tracking-tight mb-3 sm:mb-4 text-foreground leading-snug lg:leading-[1.2]"
                >
                  读书读到一半，发现
                  <br className="sm:hidden lg:inline" />
                  什么都没进去——
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.18 }}
                  className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-2 max-w-sm sm:max-w-md lg:max-w-none mx-auto lg:mx-0 font-medium"
                >
                  每天 5 分钟，用科学方法重新训练你的大脑
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.22 }}
                  className="text-xs text-muted-secondary mb-4 lg:mb-0 font-medium"
                >
                  用科学哄好你的大脑 · 顺着大脑的本能，不对抗，不强迫
                </motion.p>
              </div>

              <div className="pt-2 lg:pt-0">
                <AnimatePresence mode="wait">
                  {showOnboarding ? (
                    <motion.div
                      key="onboarding"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <OnboardingCard onComplete={() => setShowOnboarding(false)} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="daily-plan"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DailyPlanCard />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Game scenes accordion & Community cards */}
            <div className="lg:col-span-7 mt-8 lg:mt-0 space-y-6 sm:space-y-7">
              <div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xs font-bold text-muted-secondary uppercase tracking-wider mb-4 text-left"
                >
                  选一个你现在的状态
                </motion.p>

                <div className="space-y-3.5">
                  {GAME_SCENES.map((scene, sceneIndex) => {
                    const isExpanded = expandedScenes.has(scene.id);
                    const sceneGames = scene.gameHrefs
                      .map(getGameByHref)
                      .filter(Boolean);

                    return (
                      <motion.div
                        key={scene.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.32 + sceneIndex * 0.06,
                        }}
                        className={cn(
                          "bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                          isExpanded 
                            ? "border-border shadow-[0_8px_30px_rgba(61,43,31,0.03)]" 
                            : "border-border hover:border-accent-hover hover:shadow-[0_4px_12px_rgba(61,43,31,0.02)]"
                        )}
                        style={{
                          borderLeftWidth: "3.5px",
                          borderLeftColor: scene.color,
                        }}
                      >
                        {/* Scene Header */}
                        <button
                          onClick={() => toggleScene(scene.id)}
                          className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-background-soft transition-colors cursor-pointer group"
                        >
                          <span className="text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110">
                            {scene.emoji}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                {scene.title}
                              </h3>
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 transition-colors"
                                style={{
                                  background: `${scene.color}10`,
                                  color: scene.color,
                                  border: `1px solid ${scene.color}18`,
                                }}
                              >
                                {sceneGames.length} 项
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 transition-colors group-hover:text-muted-foreground/80 font-medium">
                              {scene.subtitle}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full border border-transparent group-hover:border-border-light group-hover:bg-white flex items-center justify-center transition-all duration-300">
                            <ChevronDown
                              className={cn(
                                "w-4.5 h-4.5 text-muted-secondary shrink-0 transition-transform duration-300",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </div>
                        </button>

                        {/* Scene Games */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-1">
                                <div
                                  className={cn(
                                    "gap-3",
                                    sceneGames.length < 3
                                      ? "flex flex-wrap"
                                      : "grid grid-cols-2 sm:grid-cols-3"
                                  )}
                                >
                                  {sceneGames.map((game, gameIndex) =>
                                    game ? (
                                      <motion.div
                                        key={game.href}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          duration: 0.3,
                                          delay: gameIndex * 0.05,
                                        }}
                                        className={cn(
                                          "transition-transform duration-300 hover:-translate-y-0.5",
                                          sceneGames.length < 3
                                            ? "w-[calc(50%-6px)]"
                                            : ""
                                        )}
                                      >
                                        <Link
                                          href={game.href}
                                          className="group flex flex-col items-center text-center bg-background-soft rounded-xl p-4 border border-border hover:border-accent-hover hover:bg-white hover:shadow-[0_8px_30px_rgba(61,43,31,0.04)] transition-all duration-300 h-full"
                                        >
                                          <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-all duration-300 group-hover:scale-105"
                                            style={{
                                              background: `linear-gradient(135deg, ${game.color}14, ${game.color}08)`,
                                              border: `1px solid ${game.color}22`,
                                            }}
                                          >
                                            <game.icon
                                              className="w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110"
                                              style={{ color: game.color }}
                                            />
                                          </div>

                                          <h4 className="text-sm font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">
                                            {game.title}
                                          </h4>

                                          <p
                                            className="text-[11px] font-bold mb-2"
                                            style={{ color: game.color }}
                                          >
                                            {game.benefit}
                                          </p>

                                          <div className="flex items-center gap-2 mt-auto w-full justify-center">
                                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                                              <Clock className="w-3 h-3 text-muted-secondary" />
                                              {game.duration}
                                            </span>
                                            <span
                                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                              style={{
                                                background: `${game.color}08`,
                                                color: game.color,
                                                border: `1px solid ${game.color}14`,
                                              }}
                                            >
                                              {game.difficulty}
                                            </span>
                                          </div>
                                        </Link>
                                      </motion.div>
                                    ) : null
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Integrated Community Card inside Desktop right-column / Mobile flow */}
              <div className="pt-2">
                <CommunityCard />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-6xl px-4 sm:px-5">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <LabBadge className="mb-3">设计理念</LabBadge>
            <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">
              简洁、科学、私密
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              专注于最纯粹的认知训练体验
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center bg-white p-5 rounded-2xl border border-border-light hover:shadow-[0_4px_12px_rgba(61,43,31,0.02)] transition-shadow duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-3.5 rounded-xl bg-primary/8 border border-primary/12 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-sm font-bold text-foreground mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
