import type { Metadata } from "next";
import { BookOpen, Clock, Target, TrendingUp, Lightbulb, Calendar } from "lucide-react";
import { createMetadata, createWebPageJsonLd } from "@/config/seo";
import { HeroSection } from "@/components/landing/hero-section";
import { SectionDivider } from "@/components/design/section-divider";

export const metadata: Metadata = createMetadata({
  title: "使用指南 — 如何科学训练认知能力",
  description:
    "Brain Sanage 使用指南：了解如何制定认知训练计划，选择适合你的测试，解读结果并持续改进注意力、记忆力和反应速度。",
  keywords: [
    "认知训练指南",
    "注意力训练方法",
    "工作记忆训练",
    "认知能力提升",
    "专注力训练计划",
    "大脑训练方法",
    "认知测试使用说明",
  ],
  pathname: "/guide",
});

export default function GuidePage() {
  const jsonLd = createWebPageJsonLd(
    "/guide",
    "使用指南 — 如何科学训练认知能力",
    "了解如何制定认知训练计划，选择适合你的测试，解读结果并持续改进。"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1">
        <HeroSection
          title="使用指南"
          subtitle="科学训练你的认知能力"
          description="从选择测试到制定训练计划，这份指南将帮助你高效利用 Brain Sanage 的每一项工具。"
        />

        <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-4 sm:px-5 py-8 sm:py-12">
          {/* Getting Started */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(212,132,124,0.1)] border border-[rgba(212,132,124,0.15)] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#D4847C]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">第一次使用</h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  title: "选择一项测试",
                  desc: "根据你当前最关心的能力选择：注意力涣散选「舒尔特方格」或「专注力追踪」；想测记忆力选「N-Back」或「数字广度」。",
                },
                {
                  step: "2",
                  title: "在安静环境中进行",
                  desc: "关闭通知，选择不被打扰的时间段。认知测试对环境敏感，一次消息提醒就可能影响结果。",
                },
                {
                  step: "3",
                  title: "连续测试 3 次取平均",
                  desc: "单次测试受偶然因素影响较大。建议同一项测试连续做 3 次，取中间值作为参考基准。",
                },
                {
                  step: "4",
                  title: "记录你的基准线",
                  desc: "把第一次的综合结果作为「基准线」。后续训练后的进步，都是和这个基准线对比。",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#D4847C] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#3D2B1F] mb-0.5">{item.title}</h3>
                    <p className="text-xs text-[#8B7E74] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* Test Selection */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(143,184,168,0.12)] border border-[rgba(143,184,168,0.2)] flex items-center justify-center">
                <Target className="w-4 h-4 text-[#8FB8A8]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">如何选择适合你的测试</h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "容易走神、上课/开会注意力不集中",
                  test: "舒尔特方格 + 专注力追踪",
                  reason: "直接测量你的视觉搜索速度和持续注意力稳定性。",
                },
                {
                  title: "做题速度慢、反应迟钝",
                  test: "反应速度测试 + 斯特鲁普测试",
                  reason: "区分是「基础神经速度」问题，还是「认知抑制」导致的干扰。",
                },
                {
                  title: "记不住东西、转头就忘",
                  test: "数字广度 + N-Back",
                  reason: "分别测量记忆容量和工作记忆的更新维持能力。",
                },
                {
                  title: "想全面了解自己的认知水平",
                  test: "全部 6 项测试",
                  reason: "覆盖注意力、反应力、记忆三大维度，获得完整画像。",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl border border-[#EDE5DB] bg-[#FAF7F4]"
                >
                  <p className="text-sm font-medium text-[#3D2B1F] mb-1">{item.title}</p>
                  <p className="text-xs text-[#D4847C] font-medium mb-1">推荐：{item.test}</p>
                  <p className="text-xs text-[#8B7E74] leading-relaxed">{item.reason}</p>
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* Training Plan */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(212,168,50,0.1)] border border-[rgba(212,168,50,0.18)] flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#D4A832]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">推荐训练计划</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Clock,
                  title: "每日微训练",
                  desc: "每天选 1 项测试，5 分钟完成。适合时间碎片化的上班族和学生。",
                  tag: "5 分钟/天",
                },
                {
                  icon: TrendingUp,
                  title: "周期进阶",
                  desc: "每周固定 3 天，每次完成 2-3 项测试，持续 4 周观察进步曲线。",
                  tag: "20 分钟/次",
                },
                {
                  icon: Lightbulb,
                  title: "专项突破",
                  desc: "针对薄弱项集中训练。例如连续 2 周每天做 N-Back，尝试提升一个难度等级。",
                  tag: "专注单项",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl border border-[#EDE5DB] bg-white text-center"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#FAF7F4] border border-[#EDE5DB] flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#D4847C]" />
                  </div>
                  <span className="inline-block text-[10px] font-medium text-[#D4847C] bg-[rgba(212,132,124,0.08)] px-2 py-0.5 rounded-full mb-2">
                    {item.tag}
                  </span>
                  <h3 className="text-sm font-bold text-[#3D2B1F] mb-1">{item.title}</h3>
                  <p className="text-xs text-[#8B7E74] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* Tips */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(168,122,212,0.1)] border border-[rgba(168,122,212,0.15)] flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-[#A87AD4]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">提升效果的小技巧</h2>
            </div>
            <div className="space-y-2.5">
              {[
                "固定测试时间：每天早晨或同一时段测试，减少生理节律差异带来的波动。",
                "保证睡眠：睡眠不足会显著降低反应速度和工作记忆表现，测试结果失真。",
                "不要频繁测试同一项：同一测试每天最多 3 次，避免练习效应掩盖真实水平。",
                "关注趋势而非单次分数：认知能力日常波动 ±10% 是正常的，看 2 周以上的趋势更有意义。",
                "结合生活习惯记录：如果某天分数异常低，回想一下昨晚睡眠、当天压力、咖啡因摄入情况。",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#FAF7F4] border border-[#EDE5DB] flex items-center justify-center text-[10px] font-bold text-[#8B7E74] shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[#8B7E74] leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
