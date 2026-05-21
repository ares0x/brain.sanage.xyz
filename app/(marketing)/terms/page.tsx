import type { Metadata } from "next";
import { FileText, Scale, AlertTriangle, Heart } from "lucide-react";
import { createMetadata, createWebPageJsonLd } from "@/config/seo";
import { HeroSection } from "@/components/landing/hero-section";
import { SectionDivider } from "@/components/design/section-divider";

export const metadata: Metadata = createMetadata({
  title: "使用条款 — Brain Sanage",
  description:
    "Brain Sanage 使用条款：请在使用本站服务前阅读。本站提供的认知测试仅供信息参考，不构成医疗建议。",
  keywords: [
    "使用条款",
    "服务条款",
    "用户协议",
    "免责声明",
    "Brain Sanage 条款",
  ],
  pathname: "/terms",
});

export default function TermsPage() {
  const jsonLd = createWebPageJsonLd(
    "/terms",
    "使用条款 — Brain Sanage",
    "Brain Sanage 使用条款：本站提供的认知测试仅供信息参考，不构成医疗建议。"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1">
        <HeroSection
          title="使用条款"
          subtitle="使用 Brain Sanage 前请阅读"
          description="本站所有内容和服务均受以下条款约束。继续使用即表示您同意这些条款。"
        />

        <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-4 sm:px-5 py-8 sm:py-12">
          {/* Medical Disclaimer */}
          <section className="mb-10">
            <div className="p-5 rounded-2xl border border-[rgba(212,132,124,0.25)] bg-[rgba(212,132,124,0.05)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(212,132,124,0.15)] flex items-center justify-center">
                  <Heart className="w-4 h-4 text-[#D4847C]" />
                </div>
                <h2 className="font-serif text-base font-bold text-[#3D2B1F]">医疗免责声明</h2>
              </div>
              <p className="text-sm text-[#5A4A3F] leading-relaxed mb-3">
                <strong>本网站提供的所有内容、测试和工具仅供信息参考和认知能力自测，不构成医疗建议、诊断、治疗或临床评估。</strong>
              </p>
              <p className="text-sm text-[#5A4A3F] leading-relaxed mb-3">
                认知测试的结果受多种因素影响（如睡眠、情绪、环境、练习效应等），不能作为判断健康状况的依据。测试分数的横向对比数据基于一般人群统计，不能替代专业医疗评估。
              </p>
              <p className="text-sm text-[#5A4A3F] leading-relaxed">
                如果您对自己的认知健康、注意力问题（如 ADHD/ADD）、记忆障碍或其他健康状况有任何疑虑，<strong>请务必咨询具有执业资质的专业医生、心理咨询师或医疗机构</strong>。不要依据本网站的测试结果自行诊断或改变治疗方案。
              </p>
            </div>
          </section>

          <SectionDivider />

          {/* Terms */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(212,132,124,0.1)] border border-[rgba(212,132,124,0.15)] flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#D4847C]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">服务使用条款</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "1. 服务性质",
                  desc: "Brain Sanage 是一个免费的在线认知能力自测平台。所有测试基于公开的心理学实验范式，结果仅供参考。我们保留随时修改、暂停或终止部分或全部服务的权利，恕不另行通知。",
                },
                {
                  title: "2. 使用限制",
                  desc: "您同意不以任何方式干扰或破坏本网站的正常运行，包括但不限于：使用自动化工具（机器人、爬虫）批量访问；试图绕过安全机制；将测试结果用于商业诊断或医疗用途。",
                },
                {
                  title: "3. 知识产权",
                  desc: "本网站的所有内容（包括但不限于文字、图形、界面设计、代码）受版权保护。您可以为个人非商业目的使用本站内容，未经授权不得复制、修改、分发或用于商业用途。",
                },
                {
                  title: "4. 用户责任",
                  desc: "您理解并同意，使用本站服务的风险由您自行承担。在安静、安全的环境中进行测试，避免因测试导致的人身伤害（如长时间注视屏幕造成的视觉疲劳）。建议每 20 分钟休息一次。",
                },
                {
                  title: "5. 结果准确性",
                  desc: "我们尽力确保测试逻辑符合原始心理学实验范式，但不保证测试结果的绝对准确性。设备性能、浏览器差异、网络延迟等因素都可能影响结果。测试结果不应作为任何决策的唯一依据。",
                },
                {
                  title: "6. 第三方链接",
                  desc: "本站可能包含指向第三方网站的链接（如学术文献、研究论文）。这些链接仅为提供更多信息，不代表我们认可其内容。访问第三方网站的风险由您自行承担。",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="text-sm font-bold text-[#3D2B1F] mb-1">{item.title}</h3>
                  <p className="text-xs text-[#8B7E74] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* Limitation */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(212,168,50,0.1)] border border-[rgba(212,168,50,0.18)] flex items-center justify-center">
                <Scale className="w-4 h-4 text-[#D4A832]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">责任限制</h2>
            </div>
            <p className="text-sm text-[#8B7E74] leading-relaxed mb-3">
              在法律允许的最大范围内，Brain Sanage 及其运营方不对以下情况承担责任：
            </p>
            <ul className="text-xs text-[#8B7E74] leading-relaxed space-y-1.5 list-disc list-inside">
              <li>因使用或无法使用本站服务而导致的任何直接、间接、附带或惩罚性损失</li>
              <li>基于测试结果做出的任何决策及其后果</li>
              <li>因设备故障、网络中断、浏览器兼容性问题导致的测试中断或数据丢失</li>
              <li>第三方通过本站提供的服务或内容造成的损害</li>
            </ul>
          </section>

          <SectionDivider />

          {/* Changes */}
          <section className="py-8 sm:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[rgba(168,122,212,0.1)] border border-[rgba(168,122,212,0.15)] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-[#A87AD4]" />
              </div>
              <h2 className="font-serif text-lg font-bold text-[#3D2B1F]">条款变更</h2>
            </div>
            <p className="text-sm text-[#8B7E74] leading-relaxed">
              我们可能不时更新这些使用条款。重大变更将在网站显著位置公布，或通过其他适当方式通知用户。继续使用本站服务即表示您接受更新后的条款。建议您定期查看本页面以了解最新条款。
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
