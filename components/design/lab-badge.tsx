"use client";

import { cn } from "@/lib/utils";

interface LabBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function LabBadge({ children, className, variant = "default" }: LabBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide",
        variant === "default" && "bg-[rgba(212,132,124,0.1)] text-[#C97B7B] border border-[rgba(212,132,124,0.15)]",
        variant === "outline" && "border border-[rgba(212,132,124,0.25)] text-[#C97B7B]",
        variant === "ghost" && "text-[#B5A99A]",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#D4847C] animate-gentle-pulse" />
      {children}
    </span>
  );
}
