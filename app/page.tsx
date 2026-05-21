import { createMetadata, createWebSiteJsonLd, createWebPageJsonLd } from "@/config/seo";
import { HomePageClient } from "@/components/home/home-page-client";

export const metadata = createMetadata({
  title: "Brain Sanage — 在线认知训练与脑力测评工具",
  description:
    "免费在线认知训练平台，基于经科学验证的心理学实验范式，提供反应速度、专注力、工作记忆等多项认知能力自测。无需注册，数据仅存本地。",
  keywords: [
    "大脑训练",
    "认知能力测试",
    "注意力训练",
    "脑力测评",
    "ADHD 自测",
    "专注力提升",
    "心理学在线测试",
    "执行功能评估",
  ],
  pathname: "/",
});

export default function HomePage() {
  const webSiteJsonLd = createWebSiteJsonLd();
  const webPageJsonLd = createWebPageJsonLd(
    "/",
    "Brain Sanage — 在线认知训练与脑力测评工具",
    "免费在线认知训练平台，基于科学验证的心理学范式，提供反应速度、专注力、工作记忆等多项认知能力自测工具。"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
