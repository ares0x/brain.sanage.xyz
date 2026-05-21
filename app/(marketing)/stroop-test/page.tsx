import {
    createMetadata,
    createWebPageJsonLd,
    createSoftwareApplicationJsonLd,
    createFAQPageJsonLd,
} from "@/config/seo";
import { stroopContent } from "@/config/game-landing-content";
import { HeroSection } from "@/components/landing/hero-section";
import { StroopDecoration } from "@/components/landing/hero-decorations";
import { ScienceSection } from "@/components/landing/science-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { FaqSection } from "@/components/landing/faq-section";
import { RelatedGames } from "@/components/landing/related-games";
import { SectionDivider } from "@/components/design/section-divider";
import StroopHomepageShell from "@/components/game/stroop/stroop-homepage-shell";

export const metadata = createMetadata({
    title: "专注拉回（Stroop） — 在线认知抑制训练",
    description:
        "免费在线 Stroop 专注拉回训练。3分钟拉回走神的大脑，经典认知心理学实验。测试你的认知抑制能力与注意力控制水平。",
    keywords: [
        "斯特鲁普测试",
        "Stroop Test",
        "认知抑制测试",
        "注意力测试",
        "执行功能评估",
        "反应力测试",
        "在线心理学测试",
        "ADHD",
        "ADD",
        "注意力缺陷",
        "执行功能障碍",
    ],
    pathname: "/stroop-test",
});

export default function StroopTestPage() {
    const jsonLd = [
        createWebPageJsonLd(
            "/stroop-test",
            "斯特鲁普测试 — 在线认知抑制能力测评",
            stroopContent.description,
        ),
        createSoftwareApplicationJsonLd(
            "斯特鲁普测试",
            stroopContent.description,
            "/stroop-test",
        ),
        createFAQPageJsonLd(stroopContent.faq),
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
                    title={stroopContent.title}
                    subtitle={stroopContent.subtitle}
                    description={stroopContent.description}
                    decoration={<StroopDecoration />}
                />
                <div className="mx-auto max-w-lg sm:max-w-xl px-5">
                    <SectionDivider />
                </div>
                <StroopHomepageShell />
                <div className="mx-auto max-w-lg sm:max-w-xl px-5">
                    <SectionDivider />
                </div>
                <ScienceSection
                    title={stroopContent.science.title}
                    paragraphs={stroopContent.science.paragraphs}
                />
                <BenefitsSection benefits={stroopContent.benefits} />
                <FaqSection faq={stroopContent.faq} />
                <div className="mx-auto max-w-lg sm:max-w-xl px-5">
                    <SectionDivider />
                </div>
                <RelatedGames currentHref="/stroop-test" />
            </main>
        </>
    );
}
