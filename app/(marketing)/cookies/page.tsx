import type { Metadata } from "next";
import { Cookie, Info, Shield, XCircle } from "lucide-react";
import { createMetadata, createWebPageJsonLd } from "@/config/seo";
import { HeroSection } from "@/components/landing/hero-section";
import { SectionDivider } from "@/components/design/section-divider";

export const metadata: Metadata = createMetadata({
  title: "Cookie 政策 — Brain Sanage",
  description:
    "Brain Sanage Cookie 政策：我们极少使用 Cookie，不部署追踪型 Cookie。了解我们如何使用本地存储和第三方分析工具。",
  keywords: [
    "Cookie 政策",
    "Cookie 使用说明",
    "无追踪 Cookie",
    "隐私保护",
    "本地存储",
  ],
  pathname: "/cookies",
});

export default function CookiesPage() {
  const jsonLd = createWebPageJsonLd(
    "/cookies",
    "Cookie 政策 — Brain Sanage",
    "Brain Sanage Cookie 政策：我们极少使用 Cookie，不部署追踪型 Cookie。"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1">
        <HeroSection
          title="Cookie 政策"
          subtitle="透明、极简的 Cookie 使用"
          description="我们坚信隐私保护应当简单明了。Brain Sanage 不使用追踪型 Cookie，不构建用户画像。"
        />

        <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-4 sm:px-5 py-8 sm:py-12">
          {/* Summary */}
          <section className="mb-10">
            <div className="p-5 rounded-2xl border border-[rgba(143,184,168,0.25)] bg-[rgba(143,184,168,0.05)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(143,184,168,0.15)] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#4AAD7A]" />
                </div>
                <h2 className="font-serif text-base font-bold text-[#3D2B1F]">一句话总结</h2>
              </div>
              <p className="text-sm text-[#5A4A3F] leading-relaxed">
                <strong>Brain Sanage 不使用追踪型 Cookie。</strong>我们不会通过 Cookie 收集您的浏览习惯、兴趣爱好或个人身份信息。本站仅使用必要的技术机制（LocalStorage）保存您的测试分数，且完全由您控制。
              </p>
            </div>
          </section>

          <SectionDivider />

          {/* What we use */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(212,132,124,0.1)] border border-[rgba(212,132,124,0.15)] flex items-center justify-center">
                <Cookie className="w-4 h-4 text-[#D4847C]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">我们使用的技术</h2>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-[#EDE5DB] bg-[#FAF7F4]">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-[#5A9DE0]" />
                  <h3 className="text-sm font-bold text-[#3D2B1F]">本地存储（LocalStorage）</h3>
                </div>
                <p className="text-xs text-[#8B7E74] leading-relaxed mb-2">
                  我们使用浏览器的 LocalStorage 保存您的测试历史记录和最高分。这与 Cookie 不同——数据不会随每次 HTTP 请求发送给服务器，仅保存在您的设备本地。
                </p>
                <p className="text-xs text-[#8B7E74] leading-relaxed">
                  <strong>您可以随时清除：</strong>浏览器设置 → 隐私与安全 → 清除浏览数据 → 选中"本地存储数据"。清除后您的测试记录将被重置。
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#EDE5DB] bg-[#FAF7F4]">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-[#D4A832]" />
                  <h3 className="text-sm font-bold text-[#3D2B1F]">Google Analytics（匿名统计）</h3>
                </div>
                <p className="text-xs text-[#8B7E74] leading-relaxed mb-2">
                  我们使用 Google Analytics 了解网站的整体访问情况（如哪些页面最受欢迎、用户平均停留多久）。这些信息是完全匿名和聚合的，无法识别您个人身份。
                </p>
                <p className="text-xs text-[#8B7E74] leading-relaxed">
                  <strong>如何禁用：</strong>您可以安装 Google 官方的「Google Analytics Opt-out Browser Add-on」，或在浏览器中启用「请勿追踪」（Do Not Track）功能。
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#EDE5DB] bg-[#FAF7F4]">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-[#C97B7B]" />
                  <h3 className="text-sm font-bold text-[#3D2B1F]">我们明确不使用</h3>
                </div>
                <ul className="text-xs text-[#8B7E74] leading-relaxed space-y-1 list-disc list-inside">
                  <li>第三方广告追踪 Cookie（如 Facebook Pixel、广告联盟）</li>
                  <li>用户行为分析工具（如 Hotjar、FullStory 等录屏工具）</li>
                  <li>跨站追踪 Cookie（用于在其他网站识别您）</li>
                  <li>指纹追踪技术（Canvas Fingerprinting 等）</li>
                </ul>
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* Cookie Definition */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(168,122,212,0.1)] border border-[rgba(168,122,212,0.15)] flex items-center justify-center">
                <Cookie className="w-4 h-4 text-[#A87AD4]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">什么是 Cookie？</h2>
            </div>
            <p className="text-sm text-[#8B7E74] leading-relaxed">
              Cookie 是网站存储在您浏览器中的小型文本文件，通常用于记住您的登录状态、偏好设置或追踪您的浏览行为。Cookie 可以按来源分为「第一方 Cookie」（由您访问的网站直接设置）和「第三方 Cookie」（由嵌入该网站的其他服务设置）。Brain Sanage 不设置任何第三方追踪 Cookie。
            </p>
          </section>

          <SectionDivider />

          {/* Manage */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(90,157,224,0.1)] border border-[rgba(90,157,224,0.15)] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#5A9DE0]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">如何管理您的偏好</h2>
            </div>
            <div className="space-y-2.5">
              {[
                "在浏览器设置中清除 LocalStorage 数据，即可删除所有测试记录。",
                "启用浏览器的「阻止第三方 Cookie」选项，不会影响本站正常使用。",
                "使用隐私浏览模式（无痕模式）访问，测试数据不会保存到本地存储。",
                "安装广告拦截或隐私保护插件（如 uBlock Origin、Privacy Badger）不会影响本站功能。",
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
