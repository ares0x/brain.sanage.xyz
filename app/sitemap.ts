import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { pathname: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { pathname: "/reaction-time", priority: 0.9, changeFrequency: "weekly" as const },
    { pathname: "/attention-span", priority: 0.9, changeFrequency: "weekly" as const },
    { pathname: "/stroop-test", priority: 0.9, changeFrequency: "weekly" as const },
    { pathname: "/schulte-grid", priority: 0.9, changeFrequency: "weekly" as const },
    { pathname: "/nback-memory", priority: 0.9, changeFrequency: "weekly" as const },
    { pathname: "/digit-span", priority: 0.9, changeFrequency: "weekly" as const },
    { pathname: "/focus-gaze", priority: 0.9, changeFrequency: "weekly" as const },
    { pathname: "/go-nogo", priority: 0.9, changeFrequency: "weekly" as const },
    { pathname: "/flanker", priority: 0.9, changeFrequency: "weekly" as const },
    { pathname: "/task-switching", priority: 0.9, changeFrequency: "weekly" as const },
    { pathname: "/breathing-478", priority: 0.9, changeFrequency: "weekly" as const },
    { pathname: "/profile", priority: 0.6, changeFrequency: "weekly" as const },
    { pathname: "/report", priority: 0.6, changeFrequency: "weekly" as const },
    { pathname: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { pathname: "/guide", priority: 0.7, changeFrequency: "monthly" as const },
    { pathname: "/privacy", priority: 0.5, changeFrequency: "yearly" as const },
    { pathname: "/terms", priority: 0.5, changeFrequency: "yearly" as const },
    { pathname: "/cookies", priority: 0.5, changeFrequency: "yearly" as const },
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route.pathname}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
