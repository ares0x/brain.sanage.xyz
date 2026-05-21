import type { ReactNode } from "react";

interface ResultItemProps {
  icon?: ReactNode;
  label: string;
  value: string;
  desc?: string;
}

export function ResultItem({ icon, label, value, desc }: ResultItemProps) {
  return (
    <div className="rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] p-3 sm:p-3.5 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        {icon && <span className="text-[#D4847C]">{icon}</span>}
        <div className="text-xs text-[#B5A99A]">{label}</div>
      </div>
      <div className="text-base sm:text-lg font-mono font-bold text-[#3D2B1F]">{value}</div>
      {desc && <div className="text-[10px] text-[#B5A99A] mt-1 leading-relaxed">{desc}</div>}
    </div>
  );
}
