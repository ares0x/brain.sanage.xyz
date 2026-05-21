/**
 * Canvas-based share card generator — Soft Editorial Edition.
 *
 * Renders a vertical 1080×1920 card suitable for Xiaohongshu / WeChat Moments.
 * No external dependencies — pure Canvas 2D API.
 *
 * Design direction: Soft Editorial (柔光编辑风)
 * - Magazine-like typography hierarchy
 * - Decorative sunburst arc + scattered dots
 * - Score gauge ring with animated feel
 * - Grade seal stamp
 * - Elegant quote box with ornamental quotes
 * - Subtle texture via layered translucent shapes
 */
import { percentileToGrade } from "@/lib/scoring/grade";

export interface GameShareData {
  type: "game";
  gameTitle: string;
  gameColor: string;
  score: number;
  scoreLabel: string;
  tagline: string;
  percentile?: number;
  gradeLabel?: string;
  /** Optional: extra detail lines shown above footer */
  details?: { label: string; value: string }[];
  /** Optional: gauge fill 0–1 (defaults to decorative 72%) */
  gaugeProgress?: number;
  /** Optional: ISO date string, defaults to today */
  date?: string;
}

export interface ReportShareData {
  type: "report";
  overallScore: number;
  dimensionScores: { label: string; score: number; color: string }[];
  summary: string;
}

export type ShareCardData = GameShareData | ReportShareData;

const W = 1080;
const H = 1920;
const SCALE = 2;

/* ─── Color helpers ─── */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ─── Canvas setup ─── */

function setupCanvas(): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "middle";
  return { canvas, ctx };
}

/* ─── Geometry helpers ─── */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

/* ─── Decorative elements ─── */

function drawTopArcDecoration(
  ctx: CanvasRenderingContext2D,
  color: string
): void {
  // Large soft arc in upper-right
  ctx.save();
  ctx.beginPath();
  ctx.arc(W + 100, -100, 700, 0, Math.PI * 2);
  ctx.fillStyle = withAlpha(color, 0.04);
  ctx.fill();
  ctx.restore();

  // Smaller accent arc in upper-left
  ctx.save();
  ctx.beginPath();
  ctx.arc(-60, 200, 400, 0, Math.PI * 2);
  ctx.fillStyle = withAlpha(color, 0.03);
  ctx.fill();
  ctx.restore();
}

function drawScatteredDots(
  ctx: CanvasRenderingContext2D,
  color: string
): void {
  const dots = [
    { x: 120, y: 420, r: 4, a: 0.12 },
    { x: 180, y: 380, r: 3, a: 0.08 },
    { x: 940, y: 460, r: 5, a: 0.1 },
    { x: 980, y: 520, r: 3, a: 0.07 },
    { x: 140, y: 1100, r: 4, a: 0.09 },
    { x: 960, y: 1080, r: 3, a: 0.08 },
    { x: 200, y: 1400, r: 4, a: 0.06 },
    { x: 920, y: 1450, r: 3, a: 0.07 },
  ];
  for (const d of dots) {
    ctx.save();
    drawCircle(ctx, d.x, d.y, d.r);
    ctx.fillStyle = withAlpha(color, d.a);
    ctx.fill();
    ctx.restore();
  }
}

function drawBottomWave(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, H - 180);
  ctx.bezierCurveTo(W * 0.25, H - 100, W * 0.55, H - 260, W, H - 140);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = withAlpha(color, 0.035);
  ctx.fill();

  // Second, subtler wave
  ctx.beginPath();
  ctx.moveTo(0, H - 120);
  ctx.bezierCurveTo(W * 0.4, H - 180, W * 0.75, H - 80, W, H - 160);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = withAlpha(color, 0.02);
  ctx.fill();
  ctx.restore();
}

function drawCornerOrnaments(ctx: CanvasRenderingContext2D): void {
  // Top-left corner bracket
  ctx.save();
  ctx.strokeStyle = "#E8E0D6";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(50, 90);
  ctx.lineTo(50, 50);
  ctx.lineTo(90, 50);
  ctx.stroke();

  // Bottom-right corner bracket
  ctx.beginPath();
  ctx.moveTo(W - 50, H - 90);
  ctx.lineTo(W - 50, H - 50);
  ctx.lineTo(W - 90, H - 50);
  ctx.stroke();
  ctx.restore();
}

function drawThinTopLine(
  ctx: CanvasRenderingContext2D,
  color: string
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(80, 0, W - 160, 5);
  ctx.restore();
}

/* ─── Typography helpers ─── */

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const chars = text.split("");
  const lines: string[] = [];
  let line = "";
  for (const char of chars) {
    const test = line + char;
    const metrics = ctx.measureText(test);
    if (metrics.width > maxWidth && line.length > 0) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  }
  lines.push(line);
  return lines;
}

/* ─── Card parts ─── */

function drawBrandHeader(
  ctx: CanvasRenderingContext2D,
  logoImg: HTMLImageElement | null
): void {
  ctx.save();

  const logoSize = logoImg ? 44 : 0;
  const textX = logoImg ? 80 + logoSize + 14 : 80;

  if (logoImg) {
    ctx.drawImage(logoImg, 80, 100 - logoSize / 2, logoSize, logoSize);
  }

  // Brand name
  ctx.fillStyle = "#3D2B1F";
  ctx.font = "bold 48px 'Noto Serif SC', 'Songti SC', serif";
  ctx.textAlign = "left";
  ctx.fillText("Brain Sanage", textX, 100);

  // Subtitle with subtle letter-spacing feel
  ctx.fillStyle = "#A89B8E";
  ctx.font = "26px sans-serif";
  ctx.fillText("科学认知训练 · 每日 5 分钟", textX, 150);

  ctx.restore();
}

function drawGameTitleBadge(
  ctx: CanvasRenderingContext2D,
  title: string,
  color: string
): void {
  ctx.save();
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  const metrics = ctx.measureText(title);
  const padX = 36;
  const padY = 18;
  const bw = metrics.width + padX * 2;
  const bh = 56;
  const bx = (W - bw) / 2;
  const by = 210;

  // Badge background
  roundRect(ctx, bx, by, bw, bh, bh / 2);
  ctx.fillStyle = withAlpha(color, 0.08);
  ctx.fill();
  ctx.strokeStyle = withAlpha(color, 0.2);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Badge text
  ctx.fillStyle = color;
  ctx.fillText(title, W / 2, by + bh / 2 + 1);

  ctx.restore();
}

function drawScoreGauge(
  ctx: CanvasRenderingContext2D,
  score: number,
  label: string,
  color: string,
  progress?: number
): void {
  const cx = W / 2;
  const cy = 520;
  const outerR = 220;
  const innerR = 190;
  const startAngle = -Math.PI * 0.75;
  const endAngle = Math.PI * 0.75;
  const totalAngle = endAngle - startAngle;

  ctx.save();

  // Background track
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, startAngle, endAngle);
  ctx.strokeStyle = "#F0EAE3";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.stroke();

  // Progress arc — if progress not provided, use a decorative default
  const prog = progress !== undefined ? Math.min(Math.max(progress, 0), 1) : 0.72;
  const progEnd = startAngle + totalAngle * prog;

  const grad = ctx.createLinearGradient(
    cx - outerR,
    cy - outerR,
    cx + outerR,
    cy + outerR
  );
  grad.addColorStop(0, withAlpha(color, 0.6));
  grad.addColorStop(1, color);

  ctx.beginPath();
  ctx.arc(cx, cy, outerR, startAngle, progEnd);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.stroke();

  // Inner decorative ring (thin, dashed feel via segments)
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.strokeStyle = withAlpha(color, 0.08);
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 12]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tick marks
  const tickCount = 12;
  for (let i = 0; i <= tickCount; i++) {
    const t = i / tickCount;
    const a = startAngle + totalAngle * t;
    const isMajor = i % 3 === 0;
    const tr = outerR + (isMajor ? 16 : 10);
    const trInner = outerR + 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * trInner, cy + Math.sin(a) * trInner);
    ctx.lineTo(cx + Math.cos(a) * tr, cy + Math.sin(a) * tr);
    ctx.strokeStyle = isMajor ? withAlpha(color, 0.25) : withAlpha(color, 0.12);
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.stroke();
  }

  // Score number
  ctx.fillStyle = "#3D2B1F";
  ctx.font = "bold 180px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(score), cx, cy + 8);

  // Score label
  ctx.fillStyle = "#8B7E74";
  ctx.font = "32px sans-serif";
  ctx.fillText(label, cx, cy + 130);

  ctx.restore();
}

function drawGradeSeal(
  ctx: CanvasRenderingContext2D,
  tagline: string,
  color: string
): void {
  const cx = W / 2;
  const cy = 860;
  const r = 72;

  ctx.save();

  // Outer double ring
  drawCircle(ctx, cx, cy, r);
  ctx.strokeStyle = withAlpha(color, 0.35);
  ctx.lineWidth = 2.5;
  ctx.stroke();

  drawCircle(ctx, cx, cy, r - 10);
  ctx.strokeStyle = withAlpha(color, 0.18);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Decorative dots around ring
  const dotCount = 8;
  for (let i = 0; i < dotCount; i++) {
    const a = (i / dotCount) * Math.PI * 2 - Math.PI / 2;
    const dx = cx + Math.cos(a) * (r + 16);
    const dy = cy + Math.sin(a) * (r + 16);
    drawCircle(ctx, dx, dy, 3);
    ctx.fillStyle = withAlpha(color, 0.2);
    ctx.fill();
  }

  // Inner fill (very subtle)
  drawCircle(ctx, cx, cy, r - 12);
  ctx.fillStyle = withAlpha(color, 0.03);
  ctx.fill();

  // Grade text — center
  ctx.fillStyle = "#3D2B1F";
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "center";

  // If tagline is long, wrap to two lines
  const maxTextW = (r - 16) * 1.8;
  const lines = wrapText(ctx, tagline, maxTextW);
  const lineHeight = 38;
  const totalH = lines.length * lineHeight;
  const startY = cy - totalH / 2 + lineHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, startY + i * lineHeight);
  }

  ctx.restore();
}

function drawGradeBadge(
  ctx: CanvasRenderingContext2D,
  gradeLabel: string,
  color: string
): void {
  const text = `表现: ${gradeLabel}`;
  ctx.save();
  ctx.font = "30px sans-serif";
  ctx.textAlign = "center";
  const metrics = ctx.measureText(text);
  const padX = 40;
  const padY = 14;
  const bw = metrics.width + padX * 2;
  const bh = 56;
  const bx = (W - bw) / 2;
  const by = 960;

  // Soft shadow
  roundRect(ctx, bx + 2, by + 3, bw, bh, bh / 2);
  ctx.fillStyle = withAlpha(color, 0.06);
  ctx.fill();

  // Badge body
  roundRect(ctx, bx, by, bw, bh, bh / 2);
  ctx.fillStyle = withAlpha(color, 0.08);
  ctx.fill();
  ctx.strokeStyle = withAlpha(color, 0.22);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Small star icon left of text
  const starX = bx + padX - 8;
  const starY = by + bh / 2;
  drawStar(ctx, starX, starY, 5, 7, 3.5);
  ctx.fillStyle = color;
  ctx.fill();

  // Text
  ctx.fillStyle = color;
  ctx.fillText(text, W / 2 + 6, by + bh / 2 + 1);

  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
): void {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

function drawQuoteBox(
  ctx: CanvasRenderingContext2D,
  tagline: string,
  color: string,
  boxY = 1140
): number {
  const marginX = 100;
  const paddingY = 32;

  ctx.save();

  // Top decorative line
  ctx.beginPath();
  ctx.moveTo(marginX, boxY);
  ctx.lineTo(W - marginX, boxY);
  ctx.strokeStyle = "#E8E0D6";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Large ornamental quote mark
  ctx.fillStyle = withAlpha(color, 0.1);
  ctx.font = "bold 100px serif";
  ctx.textAlign = "left";
  ctx.fillText("“", marginX + 10, boxY + 55);

  // Quote text
  ctx.fillStyle = "#5A4A3F";
  ctx.font = "italic 32px sans-serif";
  ctx.textAlign = "center";
  const lines = wrapText(ctx, tagline, W - marginX * 2 - 60);
  const lineHeight = 48;
  const textH = lines.length * lineHeight;
  const boxH = Math.max(160, textH + paddingY * 2);
  const startY = boxY + paddingY + lineHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], W / 2, startY + i * lineHeight);
  }

  // Bottom decorative line
  ctx.beginPath();
  ctx.moveTo(marginX, boxY + boxH);
  ctx.lineTo(W - marginX, boxY + boxH);
  ctx.strokeStyle = "#E8E0D6";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();

  return boxH;
}

function drawDetailPills(
  ctx: CanvasRenderingContext2D,
  details: { label: string; value: string }[],
  color: string,
  startY = 1060
): void {
  if (!details || details.length === 0) return;
  const pillH = 56;
  const gap = 16;
  const marginX = 100;
  const availableW = W - marginX * 2;
  const perPillW = (availableW - gap * (details.length - 1)) / details.length;

  ctx.save();
  ctx.textAlign = "center";

  for (let i = 0; i < details.length; i++) {
    const d = details[i];
    const px = marginX + i * (perPillW + gap);
    const py = startY;

    // Pill background
    roundRect(ctx, px, py, perPillW, pillH, 14);
    ctx.fillStyle = "#FAF7F4";
    ctx.fill();
    ctx.strokeStyle = "#EDE5DB";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    ctx.fillStyle = "#A89B8E";
    ctx.font = "20px sans-serif";
    ctx.fillText(d.label, px + perPillW / 2, py + 20);

    // Value
    ctx.fillStyle = color;
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(d.value, px + perPillW / 2, py + 40);
  }

  ctx.restore();
}

function drawDateLine(
  ctx: CanvasRenderingContext2D,
  dateStr?: string,
  y = 1180
): void {
  const date = dateStr
    ? new Date(dateStr)
    : new Date();
  const text = date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  ctx.save();
  ctx.fillStyle = "#C8BEB3";
  ctx.font = "22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, W / 2, y);
  ctx.restore();
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  qrImage: HTMLImageElement | null,
  footerY = 1340
): void {

  ctx.save();

  if (qrImage) {
    const qrSize = 140;
    ctx.drawImage(qrImage, W / 2 - qrSize / 2, footerY, qrSize, qrSize);
  } else {
    ctx.strokeStyle = "#E8E0D6";
    ctx.lineWidth = 2;
    ctx.strokeRect(W / 2 - 70, footerY, 140, 140);
    ctx.fillStyle = "#B5A99A";
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("扫码体验", W / 2, footerY + 75);
  }

  // URL
  ctx.fillStyle = "#8B7E74";
  ctx.font = "24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("brain.sanage.xyz", W / 2, footerY + 180);

  // Tagline
  ctx.fillStyle = "#B5A99A";
  ctx.font = "20px sans-serif";
  ctx.fillText("每天 5 分钟，科学训练大脑", W / 2, footerY + 212);

  // Footnote: "基于文献参考标准"
  ctx.fillStyle = "#C8BEB3";
  ctx.font = "italic 18px sans-serif";
  ctx.fillText("基于文献参考标准", W / 2, footerY + 244);

  ctx.restore();
}

/* ─── Main game card composer ─── */

function drawGameCard(
  ctx: CanvasRenderingContext2D,
  data: GameShareData,
  qrImage: HTMLImageElement | null,
  logoImg: HTMLImageElement | null
): void {
  // 1. Background
  ctx.fillStyle = "#FDF8F3";
  ctx.fillRect(0, 0, W, H);

  // 2. Decorative elements
  drawTopArcDecoration(ctx, data.gameColor);
  drawScatteredDots(ctx, data.gameColor);
  drawBottomWave(ctx, data.gameColor);
  drawCornerOrnaments(ctx);
  drawThinTopLine(ctx, data.gameColor);

  // 3. Content
  drawBrandHeader(ctx, logoImg);
  drawGameTitleBadge(ctx, data.gameTitle, data.gameColor);
  drawScoreGauge(ctx, data.score, data.scoreLabel, data.gameColor, data.gaugeProgress);
  drawGradeSeal(ctx, data.tagline, data.gameColor);

  const resolvedGradeLabel = data.gradeLabel || (data.percentile !== undefined ? percentileToGrade(data.percentile).label : undefined);
  if (resolvedGradeLabel) {
    drawGradeBadge(ctx, resolvedGradeLabel, data.gameColor);
  }

  drawDetailPills(ctx, data.details || [], data.gameColor);
  drawDateLine(ctx, data.date);
  drawFooter(ctx, qrImage);
}

/* ─── Report card (kept, enhanced) ─── */

function drawReportCard(
  ctx: CanvasRenderingContext2D,
  data: ReportShareData,
  qrImage: HTMLImageElement | null,
  logoImg: HTMLImageElement | null
): void {
  // Background
  ctx.fillStyle = "#FDF8F3";
  ctx.fillRect(0, 0, W, H);

  drawTopArcDecoration(ctx, "#D4847C");
  drawScatteredDots(ctx, "#D4847C");
  drawBottomWave(ctx, "#D4847C");
  drawCornerOrnaments(ctx);
  drawThinTopLine(ctx, "#D4847C");

  drawBrandHeader(ctx, logoImg);

  // Title
  ctx.save();
  ctx.fillStyle = "#3D2B1F";
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("认知能力评估报告", W / 2, 300);

  // Decorative line under title
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, 330);
  ctx.lineTo(W / 2 + 120, 330);
  ctx.strokeStyle = "#D4847C";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Overall score with gauge
  drawScoreGauge(ctx, data.overallScore, "综合评分", "#D4847C", data.overallScore / 100);

  // Dimension bars
  const startY = 820;
  const barH = 44;
  const gap = 28;
  const maxBarW = 720;

  ctx.save();
  for (let i = 0; i < data.dimensionScores.length; i++) {
    const dim = data.dimensionScores[i];
    const y = startY + i * (barH + gap);

    // Label
    ctx.fillStyle = "#3D2B1F";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(dim.label, 120, y + barH / 2 - 2);

    // Score number
    ctx.fillStyle = dim.color;
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(dim.score), W - 120, y + barH / 2 - 2);

    // Bar background
    roundRect(ctx, 120, y + barH + 6, maxBarW, 10, 5);
    ctx.fillStyle = "#F0EAE3";
    ctx.fill();

    // Bar fill with gradient
    const barGrad = ctx.createLinearGradient(120, 0, 120 + maxBarW, 0);
    barGrad.addColorStop(0, dim.color);
    barGrad.addColorStop(1, withAlpha(dim.color, 0.5));
    roundRect(ctx, 120, y + barH + 6, (dim.score / 100) * maxBarW, 10, 5);
    ctx.fillStyle = barGrad;
    ctx.fill();
  }
  ctx.restore();

  // Summary quote positioned after dimension bars
  const summaryY = startY + data.dimensionScores.length * (barH + gap) + 40;
  const quoteBoxH = drawQuoteBox(ctx, data.summary, "#D4847C", summaryY);

  const quoteBottom = summaryY + quoteBoxH;
  const dateY = Math.min(Math.max(quoteBottom + 60, 1340), H - 380);
  const footerY = Math.min(Math.max(quoteBottom + 180, 1500), H - 220);
  drawDateLine(ctx, undefined, dateY);
  drawFooter(ctx, qrImage, footerY);
}

/* ─── Image loading ─── */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ─── Public API ─── */

/**
 * Generate a share card PNG data URL.
 *
 * @returns Data URL (png) or null if canvas is unavailable
 */
export async function generateShareCard(
  data: ShareCardData
): Promise<string | null> {
  if (typeof document === "undefined") return null;

  const { canvas, ctx } = setupCanvas();

  // Generate QR code
  let qrImage: HTMLImageElement | null = null;
  try {
    const QRCode = await import("qrcode");
    const qrDataUrl = await QRCode.toDataURL("https://brain.sanage.xyz", {
      width: 280,
      margin: 2,
      color: {
        dark: "#3D2B1F",
        light: "#FDF8F3",
      },
    });
    qrImage = await loadImage(qrDataUrl);
  } catch {
    // Fallback: no QR code
  }

  // Load logo
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage("/logo.png");
  } catch {
    // Fallback: no logo
  }

  if (data.type === "game") {
    drawGameCard(ctx, data, qrImage, logoImg);
  } else {
    drawReportCard(ctx, data, qrImage, logoImg);
  }

  return canvas.toDataURL("image/png");
}

/**
 * Trigger a download of the generated card.
 */
export function downloadCard(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy the generated card image to clipboard (best-effort).
 */
export async function copyCardToClipboard(
  dataUrl: string
): Promise<boolean> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}
