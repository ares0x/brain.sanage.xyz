import type { Metadata } from "next";
import { Shield, Eye, Database, Lock, Globe, Mail } from "lucide-react";
import { createMetadata, createWebPageJsonLd } from "@/config/seo";
import { HeroSection } from "@/components/landing/hero-section";
import { SectionDivider } from "@/components/design/section-divider";

export const metadata: Metadata = createMetadata({
  title: "隐私政策 — Brain Sanage",
  description:
    "Brain Sanage 隐私政策：我们高度重视用户隐私。所有测试数据仅在本地浏览器处理，不上传服务器，不收集个人身份信息。",
  keywords: [
    "隐私政策",
    "数据保护",
    "Brain Sanage 隐私",
    "认知测试隐私",
    "本地数据存储",
    "无账号模式",
  ],
  pathname: "/privacy",
});

export default function PrivacyPage() {
  const jsonLd = createWebPageJsonLd(
    "/privacy",
    "隐私政策 — Brain Sanage",
    "Brain Sanage 隐私政策：所有测试数据仅在本地浏览器处理，不上传服务器。"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1">
        <HeroSection
          title="隐私政策"
          subtitle="你的数据，只属于你"
          description="Brain Sanage 采用纯前端架构，所有测试数据仅在您的浏览器中处理，我们不会收集、存储或传输任何个人身份信息。"
        />

        <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-4 sm:px-5 py-8 sm:py-12">
          {/* Core Principle */}
          <section className="mb-10">
            <div className="p-5 rounded-2xl border border-[rgba(143,184,168,0.25)] bg-[rgba(143,184,168,0.05)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(143,184,168,0.15)] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#4AAD7A]" />
                </div>
                <h2 className="font-serif text-base font-bold text-[#3D2B1F]">核心原则</h2>
              </div>
              <p className="text-sm text-[#5A4A3F] leading-relaxed">
                我们坚信<strong>隐私是基本权利</strong>。Brain Sanage 从设计之初就采用"零数据收集"架构——您在我们的网站上进行的所有认知测试，计算过程完全在您的设备本地完成，测试分数和反应数据不会离开您的浏览器。
              </p>
            </div>
          </section>

          <SectionDivider />

          {/* What we collect */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(212,132,124,0.1)] border border-[rgba(212,132,124,0.15)] flex items-center justify-center">
                <Eye className="w-4 h-4 text-[#D4847C]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">我们收集什么信息</h2>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-[#EDE5DB] bg-[#FAF7F4]">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-[#8FB8A8]" />
                  <h3 className="text-sm font-bold text-[#3D2B1F]">测试数据（本地存储）</h3>
                </div>
                <p className="text-xs text-[#8B7E74] leading-relaxed">
                  您在测试中产生的分数、反应时间等数据，仅保存在您浏览器的本地存储（LocalStorage）中。这些数据完全由您控制，清除浏览器数据即删除。我们无权也无法访问这些信息。
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#EDE5DB] bg-[#FAF7F4]">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-[#5A9DE0]" />
                  <h3 className="text-sm font-bold text-[#3D2B1F]">匿名分析数据（可选）</h3>
                </div>
                <p className="text-xs text-[#8B7E74] leading-relaxed">
                  我们使用 Google Analytics 收集匿名化的网站访问统计（如页面浏览量、访问时长、设备类型）。这些数据不包含任何可识别个人身份的信息，也不包含您的测试分数。您可以通过浏览器插件或设置禁用 Google Analytics 跟踪。
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#EDE5DB] bg-[#FAF7F4]">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-[#A87AD4]" />
                  <h3 className="text-sm font-bold text-[#3D2B1F]">我们不收集的信息</h3>
                </div>
                <ul className="text-xs text-[#8B7E74] leading-relaxed space-y-1 list-disc list-inside">
                  <li>姓名、邮箱、电话等个人身份信息</li>
                  <li>账号和密码（我们无账号系统）</li>
                  <li>精确的地理位置</li>
                  <li>设备通讯录、照片等敏感权限</li>
                </ul>
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* Data Security */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(143,184,168,0.12)] border border-[rgba(143,184,168,0.2)] flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#8FB8A8]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">数据安全</h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "纯前端架构",
                  desc: "整个应用是静态网站，没有后端服务器存储用户数据。即使我们的服务器被攻击，攻击者也无法获取任何用户测试数据。",
                },
                {
                  title: "HTTPS 加密传输",
                  desc: "全站使用 HTTPS 协议，确保您与网站之间的通信加密，防止中间人窃听。",
                },
                {
                  title: "无第三方 Cookie",
                  desc: "我们不使用追踪型 Cookie。网站正常运行所需的唯一本地存储是您的测试分数（LocalStorage），且完全由您控制。",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8FB8A8] mt-1.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-[#3D2B1F] mb-0.5">{item.title}</h3>
                    <p className="text-xs text-[#8B7E74] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* Contact */}
          <section className="py-8 sm:py-10">
            <div className="p-4 rounded-xl border border-[rgba(212,132,124,0.2)] bg-[rgba(212,132,124,0.04)]">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-[#D4847C]" />
                <h3 className="text-sm font-bold text-[#3D2B1F]">联系我们</h3>
              </div>
              <p className="text-xs text-[#8B7E74] leading-relaxed">
                如果您对隐私政策有任何疑问，欢迎通过站点底部的方式与我们取得联系。我们将尽力在 48 小时内回复。
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
