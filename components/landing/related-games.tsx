"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Grid3X3, MemoryStick, Gauge, Target, BrainCircuit, Wind, Crosshair, Shuffle, Shield } from "lucide-react";

const allGames = [
  { href: "/reaction-time", title: "反应速度测试", desc: "测大脑处理速度", icon: Gauge, color: "#D4A832" },
  { href: "/flanker", title: "Flanker 任务", desc: "选择性注意训练", icon: Crosshair, color: "#5A9DE0" },
  { href: "/task-switching", title: "任务切换", desc: "认知灵活性训练", icon: Shuffle, color: "#A87AD4" },
  { href: "/stroop-test", title: "斯特鲁普测试", desc: "认知抑制能力", icon: Brain, color: "#D4847C" },
  { href: "/go-nogo", title: "Go / No-Go", desc: "抑制控制训练", icon: Shield, color: "#D4847C" },
  { href: "/attention-span", title: "专注力追踪", desc: "持续注意稳定性", icon: Target, color: "#8FB8A8" },
  { href: "/schulte-grid", title: "舒尔特方格", desc: "注意力广度训练", icon: Grid3X3, color: "#5A9DE0" },
  { href: "/nback-memory", title: "N-Back 记忆", desc: "工作记忆测评", icon: MemoryStick, color: "#A87AD4" },
  { href: "/digit-span", title: "数字广度", desc: "记忆容量评估", icon: BrainCircuit, color: "#9B7BC7" },
  { href: "/breathing-478", title: "4-7-8 呼吸", desc: "放松减压练习", icon: Wind, color: "#6BA7A8" },
];

interface RelatedGamesProps {
  currentHref: string;
}

export function RelatedGames({ currentHref }: RelatedGamesProps) {
  const related = allGames
    .filter((g) => g.href !== currentHref)
    .slice(0, 3);

  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-lg font-bold text-[#3D2B1F] mb-1">
            试试其他测试
          </h2>
          <p className="text-sm text-[#8B7E74] mb-4">
            全面评估你的认知能力
          </p>
        </motion.div>

        <div className="grid gap-2.5">
          {related.map((game, i) => (
            <motion.div
              key={game.href}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={game.href}
                className="group flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-[#EDE5DB] hover:border-[#DDD5CC] hover:shadow-sm transition-all duration-200"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                  style={{
                    background: `${game.color}10`,
                    border: `1px solid ${game.color}18`,
                  }}
                >
                  <game.icon className="w-5 h-5" style={{ color: game.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3D2B1F] group-hover:text-[#5A4A3F] transition-colors">
                    {game.title}
                  </p>
                  <p className="text-xs text-[#B5A99A]">{game.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#C8BEB3] group-hover:text-[#8B7E74] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
