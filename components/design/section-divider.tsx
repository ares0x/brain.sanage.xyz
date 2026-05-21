"use client";

export function SectionDivider() {
  return (
    <div className="relative h-px w-full my-4 sm:my-6">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E8E0D6] to-transparent" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-[#E8E0D6] bg-[#FDF8F3]" />
    </div>
  );
}
