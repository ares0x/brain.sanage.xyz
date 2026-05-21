"use client";

import { BookOpen } from "lucide-react";
import { AnimatedSection } from "@/components/design/animated-section";

interface ScienceSectionProps {
  title: string;
  paragraphs: string[];
}

export function ScienceSection({ title, paragraphs }: ScienceSectionProps) {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-5">
        <AnimatedSection>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(143,184,168,0.12)] border border-[rgba(143,184,168,0.2)] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#8FB8A8]" />
            </div>
            <h3 className="font-serif text-lg md:text-xl font-bold text-[#3D2B1F]">
              {title}
            </h3>
          </div>
        </AnimatedSection>

        <div className="space-y-3">
          {paragraphs.map((p, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <p className="text-[#8B7E74] leading-relaxed text-sm md:text-base sm:pl-11">
                {p}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
