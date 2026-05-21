import { createMetadata, createWebPageJsonLd, createSoftwareApplicationJsonLd, createFAQPageJsonLd } from "@/config/seo";
import { nbackContent } from "@/config/game-landing-content";
import { HeroSection } from "@/components/landing/hero-section";
import { NbackDecoration } from "@/components/landing/hero-decorations";
import { ScienceSection } from "@/components/landing/science-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RelatedGames } from "@/components/landing/related-games";
import { SectionDivider } from "@/components/design/section-divider";
import NbackHomepageShell from "@/components/game/nback/nback-homepage-shell";

export const metadata = createMetadata({
  title: "工作记忆 — 在线 N-Back 认知训练",
  description:
    "免费在线工作记忆训练。N-Back 黄金标准任务，支持 1-Back 到 4-Back 难度，评估信息保持、更新与比较能力。",
  keywords: [
    "N-Back",
    "工作记忆训练",
    "工作记忆测试",
    "N-Back 训练",
    "记忆力测试",
    "短期记忆训练",
    "认知能力提升",
    "流体智力",
    "ADHD",
    "工作记忆缺陷",
    "执行功能",
  ],
  pathname: "/nback-memory",
});

export default function NbackMemoryPage() {
  const jsonLd = [
    createWebPageJsonLd(
      "/nback-memory",
      "N-Back 记忆训练 — 在线工作记忆测评",
      nbackContent.description
    ),
    createSoftwareApplicationJsonLd(
      "N-Back 记忆训练",
      nbackContent.description,
      "/nback-memory"
    ),
    createFAQPageJsonLd(nbackContent.faq),
  ];

  return (
    <>
      {jsonLd.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <main className="flex-1">
        <HeroSection
          title={nbackContent.title}
          subtitle={nbackContent.subtitle}
          description={nbackContent.description}
          decoration={<NbackDecoration />}
        />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <NbackHomepageShell />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <ScienceSection
          title={nbackContent.science.title}
          paragraphs={nbackContent.science.paragraphs}
        />
        <BenefitsSection benefits={nbackContent.benefits} />
        <FaqSection faq={nbackContent.faq} />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <RelatedGames currentHref="/nback-memory" />

      </main>
    </>
  );
}
