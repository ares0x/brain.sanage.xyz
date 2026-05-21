import { createMetadata, createWebPageJsonLd, createSoftwareApplicationJsonLd, createFAQPageJsonLd } from "@/config/seo";
import { schulteContent } from "@/config/game-landing-content";
import { HeroSection } from "@/components/landing/hero-section";
import { SchulteDecoration } from "@/components/landing/hero-decorations";
import { ScienceSection } from "@/components/landing/science-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RelatedGames } from "@/components/landing/related-games";
import { SectionDivider } from "@/components/design/section-divider";
import SchulteHomepageShell from "@/components/game/schulte/schulte-homepage-shell";

export const metadata = createMetadata({
  title: "舒尔特方格 — 在线注意力广度训练",
  description:
    "免费在线舒尔特方格（Schulte Grid），经典注意力训练工具。支持 3×3 到 7×7 多种难度，测试视觉搜索速度与注意力稳定性。",
  keywords: [
    "舒尔特方格",
    "Schulte Grid",
    "注意力训练",
    "注意力广度测试",
    "视觉搜索训练",
    "专注力测试",
    "飞行员注意力训练",
    "ADHD",
    "ADD",
    "注意力缺陷",
    "专注力不足",
  ],
  pathname: "/schulte-grid",
});

export default function SchulteGridPage() {
  const jsonLd = [
    createWebPageJsonLd(
      "/schulte-grid",
      "舒尔特方格 — 在线注意力广度训练",
      schulteContent.description
    ),
    createSoftwareApplicationJsonLd(
      "舒尔特方格",
      schulteContent.description,
      "/schulte-grid"
    ),
    createFAQPageJsonLd(schulteContent.faq),
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
          title={schulteContent.title}
          subtitle={schulteContent.subtitle}
          description={schulteContent.description}
          decoration={<SchulteDecoration />}
        />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <SchulteHomepageShell />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <ScienceSection
          title={schulteContent.science.title}
          paragraphs={schulteContent.science.paragraphs}
        />
        <BenefitsSection benefits={schulteContent.benefits} />
        <FaqSection faq={schulteContent.faq} />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <RelatedGames currentHref="/schulte-grid" />

      </main>
    </>
  );
}
