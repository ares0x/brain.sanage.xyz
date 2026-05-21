import { createMetadata, createWebPageJsonLd, createSoftwareApplicationJsonLd, createFAQPageJsonLd } from "@/config/seo";
import { attentionSpanContent } from "@/config/game-landing-content";
import { HeroSection } from "@/components/landing/hero-section";
import { AttentionDecoration } from "@/components/landing/hero-decorations";
import { ScienceSection } from "@/components/landing/science-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RelatedGames } from "@/components/landing/related-games";
import { SectionDivider } from "@/components/design/section-divider";
import AttentionSpanHomepageShell from "@/components/game/attention-span/attention-span-homepage-shell";

export const metadata = createMetadata({
  title: "专注力追踪 — 在线持续注意力稳定性测试",
  description:
    "免费在线专注力追踪测试，测量你的持续注意稳定性。按住移动圆点，随速度递增保持追踪，看看你的注意力能续航多久。",
  keywords: [
    "专注力测试",
    "持续注意力",
    "注意力稳定性",
    "注意力追踪",
    "注意力训练",
    "专注力评估",
    "注意力续航",
    "在线注意力测试",
    "ADHD",
    "ADD",
    "注意力缺陷",
    "专注力不足",
  ],
  pathname: "/attention-span",
});

export default function AttentionSpanPage() {
  const jsonLd = [
    createWebPageJsonLd(
      "/attention-span",
      "专注力追踪 — 在线持续注意力稳定性测试",
      attentionSpanContent.description
    ),
    createSoftwareApplicationJsonLd(
      "专注力追踪",
      attentionSpanContent.description,
      "/attention-span"
    ),
    createFAQPageJsonLd(attentionSpanContent.faq),
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
          title={attentionSpanContent.title}
          subtitle={attentionSpanContent.subtitle}
          description={attentionSpanContent.description}
          decoration={<AttentionDecoration />}
        />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <AttentionSpanHomepageShell />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <ScienceSection
          title={attentionSpanContent.science.title}
          paragraphs={attentionSpanContent.science.paragraphs}
        />
        <BenefitsSection benefits={attentionSpanContent.benefits} />
        <FaqSection faq={attentionSpanContent.faq} />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <RelatedGames currentHref="/attention-span" />

      </main>
    </>
  );
}
