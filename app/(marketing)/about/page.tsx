import type { Metadata } from "next";
import { Brain, BookOpen, Shield, Sparkles, Users, Microscope } from "lucide-react";
import { createMetadata, createWebPageJsonLd } from "@/config/seo";
import { HeroSection } from "@/components/landing/hero-section";
import { SectionDivider } from "@/components/design/section-divider";

export const metadata: Metadata = createMetadata({
  title: "关于我们 — Brain Sanage",
  description:
    "了解 Brain Sanage 的设计理念与科学依据。我们基于经科学验证的认知心理学实验范式，提供免费的在线认知能力自测工具。",
  keywords: [
    "关于 Brain Sanage",
    "认知训练理念",
    "科学依据",
    "心理学实验",
    "认知能力测试",
    "注意力训练原理",
  ],
  pathname: "/about",
});

export default function AboutPage() {
  const jsonLd = createWebPageJsonLd(
    "/about",
    "关于我们 — Brain Sanage",
    "了解 Brain Sanage 的设计理念与科学依据。"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1">
        <HeroSection
          title="关于 Brain Sanage"
          subtitle="设计理念与科学依据"
          description="我们致力于将经科学验证的认知心理学实验范式，转化为人人可及的免费在线自测工具。"
        />

        <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-4 sm:px-5 py-8 sm:py-12">
          {/* Mission */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(212,132,124,0.1)] border border-[rgba(212,132,124,0.15)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#D4847C]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">我们的使命</h2>
            </div>
            <p className="text-sm text-[#8B7E74] leading-relaxed mb-3">
              认知能力——注意力、工作记忆、反应速度、执行功能——是决定学习效率、工作表现和生活质量的核心因素。然而，大多数人从未系统性地了解自己的认知水平。
            </p>
            <p className="text-sm text-[#8B7E74] leading-relaxed">
              Brain Sanage 的使命是打破这一信息壁垒。我们将心理学实验室中使用的经典实验范式，转化为简洁、免费、无需注册的在线工具，让每个人都能在 5 分钟内获得关于自己认知能力的科学参考。
            </p>
          </section>

          <SectionDivider />

          {/* Science */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(143,184,168,0.12)] border border-[rgba(143,184,168,0.2)] flex items-center justify-center">
                <Microscope className="w-4 h-4 text-[#8FB8A8]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">科学依据</h2>
            </div>
            <p className="text-sm text-[#8B7E74] leading-relaxed mb-4">
              平台上的每一项测试都基于经过同行评审的认知心理学研究：
            </p>
            <div className="space-y-3">
              {[
                {
                  title: "反应速度测试（Simple Reaction Time）",
                  desc: "测量从视觉刺激出现到做出反应的时间间隔，反映基础神经传导速度和感觉运动通路的纯传导效率。",
                },
                {
                  title: "斯特鲁普测试（Stroop Test, 1935）",
                  desc: "认知抑制与选择性注意力的经典范式，广泛用于 ADHD 和执行功能评估。",
                },
                {
                  title: "Flanker 任务（Eriksen & Eriksen, 1974）",
                  desc: "在干扰刺激中快速识别目标方向，测量冲突效应量，是选择性注意与抑制控制的核心范式。",
                },
                {
                  title: "Go / No-Go 任务",
                  desc: "经典的抑制控制测试范式，对目标刺激做出反应、对非目标刺激抑制反应，直接测量冲动控制能力。",
                },
                {
                  title: "任务切换（Task Switching, Jersild, 1927）",
                  desc: "在不同任务规则间快速切换，测量切换代价，是认知灵活性的核心评估工具。",
                },
                {
                  title: "注意力持久度测试（SART）",
                  desc: "持续注意 to Response Task 的简化版本，评估长时间内维持单一目标注意力的能力。",
                },
                {
                  title: "舒尔特方格",
                  desc: "起源于德国飞行员选拔测试，用于评估视觉搜索速度和注意力广度。",
                },
                {
                  title: "N-Back 任务（Kirchner, 1958）",
                  desc: "工作记忆训练的金标准，被数百项神经科学研究采用。",
                },
                {
                  title: "数字广度测试（Digit Span）",
                  desc: "韦氏智力测验的核心子测试，直接反映工作记忆容量。",
                },
                {
                  title: "4-7-8 呼吸法（Andrew Weil）",
                  desc: "由哈佛大学医学博士推广的呼吸放松技巧，通过特定吸气-屏息-呼气节奏激活副交感神经系统。",
                },
                {
                  title: "凝视启动（Focus Gaze）",
                  desc: "通过持续视觉聚焦激活蓝斑核-去甲肾上腺素系统，快速进入专注状态，是注意力训练的前置激活技术。",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl border border-[#EDE5DB] bg-[#FAF7F4]"
                >
                  <h3 className="text-sm font-bold text-[#3D2B1F] mb-1">{item.title}</h3>
                  <p className="text-xs text-[#8B7E74] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* Design Principles */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(90,157,224,0.1)] border border-[rgba(90,157,224,0.15)] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#5A9DE0]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">设计原则</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Shield,
                  title: "隐私优先",
                  desc: "所有测试在浏览器本地运行，不收集个人信息，不上传测试数据。",
                },
                {
                  icon: Sparkles,
                  title: "科学严谨",
                  desc: "测试逻辑严格遵循原始实验范式，结果具有参考价值。",
                },
                {
                  icon: Users,
                  title: "零门槛",
                  desc: "无需注册、无需下载、无需付费。打开网页，30 秒开始测试。",
                },
                {
                  icon: Brain,
                  title: "即时反馈",
                  desc: "测试结束后立即获得结果解读和横向对比参考。",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl border border-[#EDE5DB] bg-white"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-4 h-4 text-[#D4847C]" />
                    <h3 className="text-sm font-bold text-[#3D2B1F]">{item.title}</h3>
                  </div>
                  <p className="text-xs text-[#8B7E74] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* Disclaimer */}
          <section className="py-8 sm:py-10">
            <div className="p-4 rounded-xl border border-[rgba(212,132,124,0.2)] bg-[rgba(212,132,124,0.04)]">
              <p className="text-xs text-[#8B7E74] leading-relaxed">
                <span className="font-medium text-[#5A4A3F]">重要提示：</span>
                Brain Sanage 提供的所有测试仅供自我参考和信息了解，
                <strong className="text-[#3D2B1F]">不构成医疗诊断、治疗建议或临床评估</strong>
                。测试结果不能替代专业医生或心理咨询师的意见。如果您对自己的认知健康有疑虑，请咨询专业医疗机构。
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
