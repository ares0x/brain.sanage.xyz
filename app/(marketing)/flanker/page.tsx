import { createMetadata, createWebPageJsonLd, createSoftwareApplicationJsonLd, createFAQPageJsonLd } from "@/config/seo";
import { flankerContent } from "@/config/game-landing-content";
import { HeroSection } from "@/components/landing/hero-section";
import { FlankerDecoration } from "@/components/landing/hero-decorations";
import { ScienceSection } from "@/components/landing/science-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RelatedGames } from "@/components/landing/related-games";
import { SectionDivider } from "@/components/design/section-divider";
import FlankerHomepageShell from "@/components/game/flanker/flanker-homepage-shell";

export const metadata = createMetadata({
  title: "抗干扰训练 — 在线 Flanker 认知训练",
  description:
    "免费在线抗干扰训练。Flanker 经典范式，帮你在嘈杂环境保持专注。在干扰箭头中快速判断中心方向，测量冲突效应量。",
  keywords: [
    "Flanker任务",
    "选择性注意",
    "抑制控制",
    "注意力训练",
    "认知灵活性",
    "干扰抑制",
    "执行功能",
    "注意力测试",
  ],
  pathname: "/flanker",
});

export default function FlankerPage() {
  const jsonLd = [
    createWebPageJsonLd(
      "/flanker",
      "Flanker 任务 — 在线选择性注意训练",
      flankerContent.description
    ),
    createSoftwareApplicationJsonLd(
      "Flanker 任务",
      flankerContent.description,
      "/flanker"
    ),
    createFAQPageJsonLd(flankerContent.faq),
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
          title={flankerContent.title}
          subtitle={flankerContent.subtitle}
          description={flankerContent.description}
          decoration={<FlankerDecoration />}
        />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <FlankerHomepageShell />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <ScienceSection
          title={flankerContent.science.title}
          paragraphs={flankerContent.science.paragraphs}
        />
        <BenefitsSection benefits={flankerContent.benefits} />
        <FaqSection faq={flankerContent.faq} />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <RelatedGames currentHref="/flanker" />
      </main>
    </>
  );
}
