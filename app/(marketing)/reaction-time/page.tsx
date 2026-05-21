import { createMetadata, createWebPageJsonLd, createSoftwareApplicationJsonLd, createFAQPageJsonLd } from "@/config/seo";
import { reactionTimeContent } from "@/config/game-landing-content";
import { HeroSection } from "@/components/landing/hero-section";
import { ReactionTimeDecoration } from "@/components/landing/hero-decorations";
import { ScienceSection } from "@/components/landing/science-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RelatedGames } from "@/components/landing/related-games";
import { SectionDivider } from "@/components/design/section-divider";
import ReactionTimeHomepageShell from "@/components/game/reaction-time/reaction-time-homepage-shell";

export const metadata = createMetadata({
  title: "反应速度测试 — 在线测大脑反应时间",
  description:
    "免费在线反应速度测试，测量你的视觉简单反应时间。屏幕变绿瞬间点击，5轮测试取平均，看看你的大脑处理速度属于哪一档。",
  keywords: [
    "反应速度测试",
    "反应时间",
    "大脑反应",
    "反应力测试",
    "处理速度",
    "简单反应时间",
    "在线反应测试",
    "注意力测试",
    "处理速度障碍",
  ],
  pathname: "/reaction-time",
});

export default function ReactionTimePage() {
  const jsonLd = [
    createWebPageJsonLd(
      "/reaction-time",
      "反应速度测试 — 在线测大脑反应时间",
      reactionTimeContent.description
    ),
    createSoftwareApplicationJsonLd(
      "反应速度测试",
      reactionTimeContent.description,
      "/reaction-time"
    ),
    createFAQPageJsonLd(reactionTimeContent.faq),
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
          title={reactionTimeContent.title}
          subtitle={reactionTimeContent.subtitle}
          description={reactionTimeContent.description}
          decoration={<ReactionTimeDecoration />}
        />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <ReactionTimeHomepageShell />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <ScienceSection
          title={reactionTimeContent.science.title}
          paragraphs={reactionTimeContent.science.paragraphs}
        />
        <BenefitsSection benefits={reactionTimeContent.benefits} />
        <FaqSection faq={reactionTimeContent.faq} />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <RelatedGames currentHref="/reaction-time" />

      </main>
    </>
  );
}
