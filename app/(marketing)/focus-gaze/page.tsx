import { createMetadata, createWebPageJsonLd, createSoftwareApplicationJsonLd, createFAQPageJsonLd } from "@/config/seo";
import { focusGazeContent } from "@/config/game-landing-content";
import { HeroSection } from "@/components/landing/hero-section";
import { ScienceSection } from "@/components/landing/science-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RelatedGames } from "@/components/landing/related-games";
import { SectionDivider } from "@/components/design/section-divider";
import FocusGazeHomepageShell from "@/components/game/focus-gaze/focus-gaze-homepage-shell";

export const metadata = createMetadata({
  title: "凝视启动 — 30秒快速进入专注状态",
  description:
    "通过持续凝视固定焦点 30-60 秒，激活蓝斑核-去甲肾上腺素系统，快速进入专注状态。适合工作学习前的专注力「开关」。",
  keywords: [
    "凝视训练",
    "专注力启动",
    "蓝斑核激活",
    "注意力训练",
    "去甲肾上腺素",
    "视觉聚焦",
    "专注状态",
    "认知激活",
  ],
  pathname: "/focus-gaze",
});

export default function FocusGazePage() {
  const jsonLd = [
    createWebPageJsonLd(
      "/focus-gaze",
      "凝视启动 — 30秒快速进入专注状态",
      focusGazeContent.description
    ),
    createSoftwareApplicationJsonLd(
      "凝视启动",
      focusGazeContent.description,
      "/focus-gaze"
    ),
    createFAQPageJsonLd(focusGazeContent.faq),
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
          title={focusGazeContent.title}
          subtitle={focusGazeContent.subtitle}
          description={focusGazeContent.description}
        />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <FocusGazeHomepageShell />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <ScienceSection
          title={focusGazeContent.science.title}
          paragraphs={focusGazeContent.science.paragraphs}
        />
        <BenefitsSection benefits={focusGazeContent.benefits} />
        <FaqSection faq={focusGazeContent.faq} />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <RelatedGames currentHref="/focus-gaze" />
      </main>
    </>
  );
}
