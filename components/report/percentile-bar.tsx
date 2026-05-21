"use client";

import { useEffect, useState } from "react";

interface PercentileBarProps {
  label: string;
  score: number;
  color: string;
  className?: string;
}

export function PercentileBar({
  label,
  score,
  color,
  className = "",
}: PercentileBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedWidth(score), 300);
    return () => clearTimeout(t);
  }, [score]);

  const markers = [
    { label: "平均", value: 50, style: "dashed" as const },
    { label: "良好", value: 75, style: "dashed" as const },
    { label: "优秀", value: 90, style: "solid" as const },
  ];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-[#3D2B1F]">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {score}%
        </span>
      </div>

      {/* Track */}
      <div className="relative h-2.5 bg-[#F5F0EB] rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${animatedWidth}%`,
            backgroundColor: color,
            transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* Markers */}
        {markers.map((m) => (
          <div
            key={m.value}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left: `${m.value}%`,
              backgroundColor: m.value <= score ? "rgba(255,255,255,0.4)" : "#DDD5CC",
              borderLeftStyle: m.style,
            }}
          />
        ))}
      </div>

      {/* Marker labels */}
      <div className="relative h-4 mt-0.5">
        {markers.map((m) => (
          <span
            key={m.value}
            className="absolute text-[10px] text-[#B5A99A]"
            style={{ left: `${m.value}%`, transform: "translateX(-50%)" }}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
