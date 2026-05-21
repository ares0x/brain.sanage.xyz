"use client";

import { useEffect, useState } from "react";
import type { DimensionScore } from "@/lib/cognitive-report";

interface RadarChartProps {
  dimensions: DimensionScore[];
  size?: number;
  className?: string;
}

export function RadarChart({
  dimensions,
  size = 280,
  className = "",
}: RadarChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const padding = 32;
  const center = size / 2;
  const maxRadius = size / 2 - padding;
  const count = dimensions.length;

  if (count === 0) return null;

  // Compute vertex positions for each dimension
  const vertices = dimensions.map((dim, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const r = (dim.score / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      labelX: center + (maxRadius + 18) * Math.cos(angle),
      labelY: center + (maxRadius + 18) * Math.sin(angle),
      angle,
      color: dim.color,
      label: dim.label,
      score: dim.score,
    };
  });

  // Grid circles at 20, 40, 60, 80, 100
  const gridLevels = [20, 40, 60, 80, 100];

  // Animated polygon path
  const polygonPoints = vertices
    .map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`)
    .join(" ");

  // For animation: scale vertices from center
  const animatedVertices = vertices.map((v) => ({
    ...v,
    x: center + (v.x - center) * (animated ? 1 : 0),
    y: center + (v.y - center) * (animated ? 1 : 0),
  }));

  const animatedPolygon = animatedVertices
    .map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      {/* Background grid circles */}
      {gridLevels.map((level) => {
        const r = (level / 100) * maxRadius;
        return (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="#EDE5DB"
            strokeWidth={1}
            strokeDasharray={level === 100 ? undefined : "3,3"}
          />
        );
      })}

      {/* Grid axes */}
      {vertices.map((v, i) => (
        <line
          key={`axis-${i}`}
          x1={center}
          y1={center}
          x2={center + maxRadius * Math.cos(v.angle)}
          y2={center + maxRadius * Math.sin(v.angle)}
          stroke="#EDE5DB"
          strokeWidth={1}
        />
      ))}

      {/* Data polygon fill */}
      <polygon
        points={animatedPolygon}
        fill="rgba(212, 132, 124, 0.08)"
        stroke="#D4847C"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{
          transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />

      {/* Data points */}
      {animatedVertices.map((v, i) => (
        <g key={`point-${i}`}>
          <circle
            cx={v.x}
            cy={v.y}
            r={5}
            fill={v.color}
            stroke="#fff"
            strokeWidth={2}
            style={{
              transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transitionDelay: `${i * 80}ms`,
            }}
          />
          {/* Score label near point */}
          <text
            x={v.x}
            y={v.y - 10}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill={v.color}
            style={{
              opacity: animated ? 1 : 0,
              transition: "opacity 0.6s ease",
              transitionDelay: `${800 + i * 80}ms`,
            }}
          >
            {v.score}
          </text>
        </g>
      ))}

      {/* Dimension labels */}
      {vertices.map((v, i) => {
        const isTop = v.labelY < center;
        const isLeft = v.labelX < center;
        let anchor: "start" | "middle" | "end" = "middle";
        let dx = 0;
        if (isLeft && Math.abs(v.labelX - center) > 10) {
          anchor = "end";
          dx = -4;
        } else if (!isLeft && Math.abs(v.labelX - center) > 10) {
          anchor = "start";
          dx = 4;
        }
        return (
          <text
            key={`label-${i}`}
            x={v.labelX + dx}
            y={v.labelY + (isTop ? -4 : 12)}
            textAnchor={anchor}
            fontSize={11}
            fontWeight={500}
            fill="#3D2B1F"
            style={{
              opacity: animated ? 1 : 0,
              transition: "opacity 0.6s ease",
              transitionDelay: `${600 + i * 80}ms`,
            }}
          >
            {v.label}
          </text>
        );
      })}
    </svg>
  );
}
