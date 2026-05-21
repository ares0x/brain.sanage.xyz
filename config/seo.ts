import type { Metadata } from "next";

export const siteConfig = {
    name: "Brain Sanage",
    url: "https://brain.sanage.xyz",
    description:
        "在线认知训练与脑力测评工具，基于经科学验证的心理学实验范式，免费提供注意力、工作记忆、反应速度等多项认知能力自测。",
    keywords: [
        "认知训练",
        "脑力测评",
        "注意力测试",
        "ADHD",
        "ADD",
        "注意力缺陷",
        "专注力训练",
        "工作记忆训练",
        "大脑训练",
        "斯特鲁普测试",
        "sitelupu",
        "舒尔特方格",
        "shuertefangge",
        "N-Back",
        "认知能力评估",
        "心理学测试",
        "在线脑力游戏",
        "执行功能",
        "反应速度测试",
        "记忆广度",
    ],
    authors: [{ name: "Brain Sanage" }],
    creator: "Brain Sanage",
    ogImage: "/og-image.png",
} as const;

export function createMetadata(override?: {
    title?: string;
    description?: string;
    keywords?: string[];
    pathname?: string;
    ogImage?: string;
    noIndex?: boolean;
}): Metadata {
    const title = override?.title
        ? { absolute: override.title }
        : {
              default: `${siteConfig.name} — 在线认知训练与脑力测评`,
              template: `%s | ${siteConfig.name}`,
          };

    const description = override?.description ?? siteConfig.description;
    const keywords = override?.keywords
        ? [...siteConfig.keywords, ...override.keywords]
        : [...siteConfig.keywords];
    const url = override?.pathname
        ? `${siteConfig.url}${override.pathname}`
        : siteConfig.url;
    const ogImage = override?.ogImage
        ? `${siteConfig.url}${override.ogImage}`
        : `${siteConfig.url}${siteConfig.ogImage}`;

    return {
        title,
        description,
        keywords,
        authors: [...siteConfig.authors],
        creator: siteConfig.creator,
        metadataBase: new URL(siteConfig.url),
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: "website",
            locale: "zh_CN",
            siteName: siteConfig.name,
            title:
                typeof title === "object" && "absolute" in title
                    ? title.absolute
                    : siteConfig.name,
            description,
            url,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${siteConfig.name} — 在线认知训练`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title:
                typeof title === "object" && "absolute" in title
                    ? title.absolute
                    : siteConfig.name,
            description,
            images: [ogImage],
        },
        robots: override?.noIndex
            ? { index: false, follow: false }
            : {
                  index: true,
                  follow: true,
                  googleBot: {
                      index: true,
                      follow: true,
                      "max-video-preview": -1,
                      "max-image-preview": "large",
                      "max-snippet": -1,
                  },
              },
        other: {
            "baidu-site-verification": "",
        },
    };
}

// Helpers for JSON-LD structured data
export function createWebSiteJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };
}

export function createWebPageJsonLd(
    pathname: string,
    title: string,
    description: string,
) {
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        url: `${siteConfig.url}${pathname}`,
        description,
        isPartOf: {
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
        },
    };
}

export function createSoftwareApplicationJsonLd(
    name: string,
    description: string,
    pathname: string,
) {
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name,
        applicationCategory: "HealthApplication",
        description,
        url: `${siteConfig.url}${pathname}`,
        operatingSystem: "Any",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "CNY",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "100",
        },
    };
}

export function createFAQPageJsonLd(
    faqs: { question: string; answer: string }[],
) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
}
