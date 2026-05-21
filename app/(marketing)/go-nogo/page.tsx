import { createMetadata, createWebPageJsonLd, createSoftwareApplicationJsonLd, createFAQPageJsonLd } from "@/config/seo";
import { goNogoContent } from "@/config/game-landing-content";
import { HeroSection } from "@/components/landing/hero-section";
import { GoNogoDecoration } from "@/components/landing/hero-decorations";
import { ScienceSection } from "@/components/landing/science-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RelatedGames } from "@/components/landing/related-games";
import { SectionDivider } from "@/components/design/section-divider";
import GoNogoHomepageShell from "@/components/game/go-nogo/go-nogo-homepage-shell";

export const metadata = createMetadata({
  title: "冲动控制 — 在线 Go/No-Go 训练",
  description:
    "免费在线冲动控制训练。Go/No-Go 经典范式，看到绿色点击，红色不点击，测量你的抑制控制能力。",
  keywords: [
    "Go No-Go",
    "抑制控制",
    "冲动控制",
    "执行功能",
    "前额叶",
    "ADHD测试",
    "认知训练",
    "抑制控制训练",
    "在线测试",
  ],
  pathname: "/go-nogo",
});

export default function GoNogoPage() {
  const jsonLd = [
    createWebPageJsonLd(
      "/go-nogo",
      "Go / No-Go — 在线抑制控制测试",
      goNogoContent.description
    ),
    createSoftwareApplicationJsonLd(
      "Go / No-Go",
      goNogoContent.description,
      "/go-nogo"
    ),
    createFAQPageJsonLd(goNogoContent.faq),
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
          title={goNogoContent.title}
          subtitle={goNogoContent.subtitle}
          description={goNogoContent.description}
          decoration={<GoNogoDecoration />}
        />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <GoNogoHomepageShell />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <ScienceSection
          title={goNogoContent.science.title}
          paragraphs={goNogoContent.science.paragraphs}
        />
        <BenefitsSection benefits={goNogoContent.benefits} />
        <FaqSection faq={goNogoContent.faq} />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <RelatedGames currentHref="/go-nogo" />
      </main>
    </>
  );
}
