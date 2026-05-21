"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { generateCognitiveReport } from "@/lib/cognitive-report";
import type { GameRecord } from "@/lib/storage";
import type { CognitiveDimension } from "@/lib/cognitive-report/types";

const DIMENSION_META: Record<
  CognitiveDimension,
  { label: string; color: string }
> = {
  attention: { label: "注意力", color: "#5A9DE0" },
  memory: { label: "记忆力", color: "#A87AD4" },
  processingSpeed: { label: "处理速度", color: "#D4A832" },
  executiveFunction: { label: "执行功能", color: "#D4847C" },
  emotionalRegulation: { label: "情绪调节", color: "#6BA7A8" },
};

interface TrendPoint {
  date: string;
  displayDate: string;
  overallScore: number;
  attention?: number;
  memory?: number;
  processingSpeed?: number;
  executiveFunction?: number;
  emotionalRegulation?: number;
}

function calculateTrendData(records: GameRecord[]): TrendPoint[] {
  if (records.length === 0) return [];

  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);

  // Group by day
  const dayGroups = new Map<string, GameRecord[]>();
  for (const r of sorted) {
    const d = new Date(r.timestamp);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().split("T")[0];
    if (!dayGroups.has(key)) dayGroups.set(key, []);
    dayGroups.get(key)!.push(r);
  }

  // Sort days
  const sortedDays = Array.from(dayGroups.keys()).sort();

  // Accumulate and generate reports
  const trendData: TrendPoint[] = [];
  const accumulated: GameRecord[] = [];

  for (const date of sortedDays) {
    const dayRecords = dayGroups.get(date)!;
    accumulated.push(...dayRecords);
    const report = generateCognitiveReport(accumulated);
    if (report) {
      const point: TrendPoint = {
        date,
        displayDate: formatShortDate(date),
        overallScore: report.overallScore,
      };
      for (const dim of report.dimensions) {
        point[dim.dimension] = dim.score;
      }
      trendData.push(point);
    }
  }

  return trendData;
}

function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-[#EDE5DB] shadow-lg px-3 py-2.5">
      <p className="text-xs text-[#8B7E74] mb-1.5">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => {
          const dim = entry.dataKey as CognitiveDimension;
          const meta = DIMENSION_META[dim];
          if (!meta || entry.value == null) return null;
          return (
            <div key={dim} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-[#3D2B1F]">{meta.label}</span>
              <span className="text-xs font-bold ml-auto" style={{ color: entry.color }}>
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrendChart({ records }: { records: GameRecord[] }) {
  const data = useMemo(() => calculateTrendData(records), [records]);
  const [hidden, setHidden] = useState<Set<CognitiveDimension>>(new Set());

  if (data.length < 2) {
    return (
      <div className="bg-[#FAF7F4] rounded-xl border border-[#EDE5DB] p-6 text-center">
        <p className="text-sm text-[#8B7E74]">
          多训练几天，就能看到你的能力变化趋势了
        </p>
      </div>
    );
  }

  // Determine which dimensions appear in the data
  const presentDimensions = (Object.keys(DIMENSION_META) as CognitiveDimension[]).filter(
    (dim) => data.some((d) => d[dim] != null)
  );

  const toggleDimension = (dim: CognitiveDimension) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(dim)) next.delete(dim);
      else next.add(dim);
      return next;
    });
  };

  // Show only up to 8 labels on x-axis
  const tickInterval = Math.max(1, Math.floor(data.length / 8));

  return (
    <div>
      {/* Legend toggles */}
      <div className="flex flex-wrap gap-2 mb-3">
        {presentDimensions.map((dim) => {
          const meta = DIMENSION_META[dim];
          const isHidden = hidden.has(dim);
          return (
            <button
              key={dim}
              onClick={() => toggleDimension(dim)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                isHidden
                  ? "bg-[#F5F0EB] text-[#B5A99A]"
                  : "bg-white border border-[#EDE5DB] text-[#3D2B1F]"
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isHidden ? "#B5A99A" : meta.color,
                }}
              />
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EB" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: "#B5A99A" }}
              tickLine={false}
              axisLine={{ stroke: "#EDE5DB" }}
              interval={tickInterval}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#B5A99A" }}
              tickLine={false}
              axisLine={{ stroke: "#EDE5DB" }}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            {presentDimensions.map((dim) => {
              const meta = DIMENSION_META[dim];
              return (
                <Line
                  key={dim}
                  type="monotone"
                  dataKey={dim}
                  stroke={meta.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: meta.color }}
                  hide={hidden.has(dim)}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
