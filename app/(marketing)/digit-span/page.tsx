import { createMetadata, createWebPageJsonLd, createSoftwareApplicationJsonLd, createFAQPageJsonLd } from "@/config/seo";
import { digitSpanContent } from "@/config/game-landing-content";
import { HeroSection } from "@/components/landing/hero-section";
import { DigitSpanDecoration } from "@/components/landing/hero-decorations";
import { ScienceSection } from "@/components/landing/science-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RelatedGames } from "@/components/landing/related-games";
import { SectionDivider } from "@/components/design/section-divider";
import DigitSpanHomepageShell from "@/components/game/digit-span/digit-span-homepage-shell";

export const metadata = createMetadata({
  title: "数字广度测试 — 在线记忆容量测评",
  description:
    "免费在线数字广度测试，经典心理学工作记忆测评。记住依次出现的数字序列并按顺序复述，评估你的记忆广度上限。",
  keywords: [
    "数字广度测试",
    "工作记忆",
    "记忆容量",
    "心理学测试",
    "认知训练",
    "记忆广度",
    "短期记忆",
    "在线记忆测试",
    "ADHD",
    "工作记忆缺陷",
  ],
  pathname: "/digit-span",
});

export default function DigitSpanPage() {
  const jsonLd = [
    createWebPageJsonLd(
      "/digit-span",
      "数字广度测试 — 在线记忆容量测评",
      digitSpanContent.description
    ),
    createSoftwareApplicationJsonLd(
      "数字广度测试",
      digitSpanContent.description,
      "/digit-span"
    ),
    createFAQPageJsonLd(digitSpanContent.faq),
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
          title={digitSpanContent.title}
          subtitle={digitSpanContent.subtitle}
          description={digitSpanContent.description}
          decoration={<DigitSpanDecoration />}
        />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <DigitSpanHomepageShell />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <ScienceSection
          title={digitSpanContent.science.title}
          paragraphs={digitSpanContent.science.paragraphs}
        />
        <BenefitsSection benefits={digitSpanContent.benefits} />
        <FaqSection faq={digitSpanContent.faq} />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <RelatedGames currentHref="/digit-span" />

      </main>
    </>
  );
}
