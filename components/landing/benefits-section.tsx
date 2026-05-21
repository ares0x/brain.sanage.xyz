"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { AnimatedSection } from "@/components/design/animated-section";
import { SectionDivider } from "@/components/design/section-divider";

interface BenefitsSectionProps {
  benefits: string[];
}

export function BenefitsSection({ benefits }: BenefitsSectionProps) {
  return (
    <section className="py-10 md:py-14">
      <SectionDivider />
      <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-5 pt-10 md:pt-14">
        <AnimatedSection>
          <h3 className="font-serif text-lg md:text-xl font-bold text-[#3D2B1F] mb-6">
            训练收益
          </h3>
        </AnimatedSection>

        <div className="grid gap-3 sm:grid-cols-2">
          {benefits.map((b, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ x: 3 }}
                className="flex items-start gap-3 p-4 rounded-xl border border-[#EDE5DB] bg-white hover:border-[rgba(212,132,124,0.25)] transition-colors group shadow-soft"
              >
                <CheckCircle2 className="w-5 h-5 text-[#8FB8A8] mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-[#5A4A3F] text-sm leading-relaxed">{b}</span>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
