import { createMetadata, createWebPageJsonLd } from "@/config/seo";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata = createMetadata({
  title: "我的认知档案 — Brain Sanage",
  description:
    "查看你的认知训练历史、能力趋势和游戏表现。追踪进步，发现优势与提升空间。",
  pathname: "/profile",
});

export default function ProfilePage() {
  const jsonLd = createWebPageJsonLd(
    "/profile",
    "我的认知档案 — Brain Sanage",
    "查看你的认知训练历史、能力趋势和游戏表现。追踪进步，发现优势与提升空间。"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileClient />
    </>
  );
}
