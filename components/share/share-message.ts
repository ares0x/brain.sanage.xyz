/**
 * Generate social-media-ready share text for each game result.
 */

import { percentileToGrade } from "@/lib/scoring/grade";
import type { GameShareData } from "./share-card-canvas";

interface ShareMessage {
  title: string;
  body: string;
  hashtags: string;
}

export function generateShareMessage(data: GameShareData): ShareMessage {
  const { gameTitle, score, scoreLabel, tagline, percentile, gradeLabel } = data;

  const titles = [
    `刚测了${gameTitle}，得了 ${score}${scoreLabel}！`,
    `${gameTitle}挑战完成 ✅ ${score}${scoreLabel}`,
    `今日${gameTitle}打卡 · ${score}${scoreLabel}`,
  ];

  const title = titles[Math.floor(Math.random() * titles.length)];

  const resolvedGradeLabel = gradeLabel || (percentile !== undefined ? percentileToGrade(percentile).label : undefined);

  let body = `「${tagline}」`;
  if (resolvedGradeLabel) {
    body += `\n表现评级：${resolvedGradeLabel} 🌟`;
  }
  body += "\n\n每天 5 分钟，科学训练大脑 🧠";

  const hashtags = "#BrainSanage #认知训练 #脑力测评 #专注力训练";

  return { title, body, hashtags };
}

export function formatShareText(data: GameShareData): string {
  const msg = generateShareMessage(data);
  return `${msg.title}\n${msg.body}\n\n${msg.hashtags}`;
}
