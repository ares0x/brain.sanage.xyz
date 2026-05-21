import { createMetadata, createWebPageJsonLd } from "@/config/seo";
import { getRecords } from "@/lib/storage";
import { generateCognitiveReport } from "@/lib/cognitive-report";
import { ReportClient } from "@/components/report/report-client";

export const metadata = createMetadata({
  title: "认知能力评估报告 — Brain Sanage",
  description:
    "基于科学验证的心理学实验范式，生成你的专属认知能力评估报告。涵盖注意力、记忆力、处理速度、执行功能等多维度分析。",
  pathname: "/report",
});

export default function ReportPage() {
  const records = getRecords();
  const report = generateCognitiveReport(records);

  const jsonLd = createWebPageJsonLd(
    "/report",
    "认知能力评估报告 — Brain Sanage",
    "基于科学验证的心理学实验范式，生成你的专属认知能力评估报告。涵盖注意力、记忆力、处理速度、执行功能等多维度分析。"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReportClient initialReport={report} />
    </>
  );
}
