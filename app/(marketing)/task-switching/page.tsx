import { createMetadata, createWebPageJsonLd, createSoftwareApplicationJsonLd, createFAQPageJsonLd } from "@/config/seo";
import { taskSwitchingContent } from "@/config/game-landing-content";
import { HeroSection } from "@/components/landing/hero-section";
import { TaskSwitchingDecoration } from "@/components/landing/hero-decorations";
import { ScienceSection } from "@/components/landing/science-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RelatedGames } from "@/components/landing/related-games";
import { SectionDivider } from "@/components/design/section-divider";
import TaskSwitchingHomepageShell from "@/components/game/task-switching/task-switching-homepage-shell";

export const metadata = createMetadata({
  title: "专注切换 — 在线认知灵活性训练",
  description:
    "免费在线专注切换训练，测试你的认知灵活性。在「大小」和「奇偶」两套规则间快速切换，测量切换代价。",
  keywords: [
    "任务切换",
    "认知灵活性",
    "执行功能",
    "注意力切换",
    "认知控制",
    "工作记忆",
    "大脑训练",
    "认知训练",
  ],
  pathname: "/task-switching",
});

export default function TaskSwitchingPage() {
  const jsonLd = [
    createWebPageJsonLd(
      "/task-switching",
      "任务切换 — 在线认知灵活性训练",
      taskSwitchingContent.description
    ),
    createSoftwareApplicationJsonLd(
      "任务切换训练",
      taskSwitchingContent.description,
      "/task-switching"
    ),
    createFAQPageJsonLd(taskSwitchingContent.faq),
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
          title={taskSwitchingContent.title}
          subtitle={taskSwitchingContent.subtitle}
          description={taskSwitchingContent.description}
          decoration={<TaskSwitchingDecoration />}
        />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <TaskSwitchingHomepageShell />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <ScienceSection
          title={taskSwitchingContent.science.title}
          paragraphs={taskSwitchingContent.science.paragraphs}
        />
        <BenefitsSection benefits={taskSwitchingContent.benefits} />
        <FaqSection faq={taskSwitchingContent.faq} />
        <div className="mx-auto max-w-lg sm:max-w-xl px-5">
          <SectionDivider />
        </div>
        <RelatedGames currentHref="/task-switching" />
      </main>
    </>
  );
}
