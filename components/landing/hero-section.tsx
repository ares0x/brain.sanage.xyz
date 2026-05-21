"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { LabBadge } from "@/components/design/lab-badge";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  decoration?: ReactNode;
}

export function HeroSection({ title, subtitle, description, decoration }: HeroSectionProps) {
  return (
    <section className="relative pt-8 pb-6 md:pt-12 md:pb-8 overflow-hidden">
      {/* Background decoration layer */}
      {decoration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {decoration}
        </div>
      )}

      <div className="relative mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <LabBadge className="mb-3">{subtitle}</LabBadge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="font-serif text-2xl md:text-3xl font-bold tracking-tight mb-3 text-[#3D2B1F]"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="text-base text-[#8B7E74] leading-relaxed max-w-md mx-auto"
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
}
