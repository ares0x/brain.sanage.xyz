import { createMetadata, createWebPageJsonLd, createSoftwareApplicationJsonLd, createFAQPageJsonLd } from "@/config/seo";
import { breathing478Content } from "@/config/game-landing-content";
import { HeroSection } from "@/components/landing/hero-section";
import { BreathingDecoration } from "@/components/landing/hero-decorations";
import { ScienceSection } from "@/components/landing/science-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RelatedGames } from "@/components/landing/related-games";
import { SectionDivider } from "@/components/design/section-divider";
import Breathing478HomepageShell from "@/components/game/breathing-478/breathing-478-homepage-shell";

export const metadata = createMetadata({
  title: "4-7-8 呼吸法 — 在线放松练习",
  description:
    "免费在线 4-7-8 呼吸练习工具。跟随视觉指引进行吸气-屏息-呼气循环，激活副交感神经，快速缓解焦虑、改善睡眠。",
  keywords: [
    "478呼吸法",
    "呼吸练习",
    "放松训练",
    "减压方法",
    "焦虑缓解",
    "助眠技巧",
    "正念呼吸",
    "副交感神经",
  ],
  pathname: "/breathing-478",
});

export default function Breathing478Page() {
  const jsonLd = [
    createWebPageJsonLd(
      "/breathing-478",
      "4-7-8 呼吸法 — 在线放松练习",
      breathing478Content.description
    ),
    createSoftwareApplicationJsonLd(
      "4-7-8 呼吸法练习",
      breathing478Content.description,
      "/breathing-478"
    ),
    createFAQPageJsonLd(breathing478Content.faq),
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
          title={breathing478Content.title}
          subtitle={breathing478Content.subtitle}
          description={breathing478Content.description}
          decoration={<BreathingDecoration />}
        />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <Breathing478HomepageShell />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <ScienceSection
          title={breathing478Content.science.title}
          paragraphs={breathing478Content.science.paragraphs}
        />
        <BenefitsSection benefits={breathing478Content.benefits} />
        <FaqSection faq={breathing478Content.faq} />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <RelatedGames currentHref="/breathing-478" />
      </main>
    </>
  );
}
