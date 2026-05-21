import type { StroopColorDef } from "./types";

export const STROOP_COLORS: StroopColorDef[] = [
  { key: "red", label: "红", hex: "#E05A5A", tailwindClass: "text-[#E05A5A]" },
  { key: "green", label: "绿", hex: "#4AAD7A", tailwindClass: "text-[#4AAD7A]" },
  { key: "blue", label: "蓝", hex: "#5A9DE0", tailwindClass: "text-[#5A9DE0]" },
  { key: "yellow", label: "黄", hex: "#D4A832", tailwindClass: "text-[#D4A832]" },
  { key: "purple", label: "紫", hex: "#A87AD4", tailwindClass: "text-[#A87AD4]" },
];

export const STROOP_CONFIG = {
  totalRounds: 20,
  congruentRatio: 0.25,
  colors: STROOP_COLORS,
} as const;

