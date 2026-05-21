"use client";

import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedSection } from "@/components/design/animated-section";
import { SectionDivider } from "@/components/design/section-divider";

interface FAQ {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faq: FAQ[];
}

export function FaqSection({ faq }: FaqSectionProps) {
  return (
    <section className="py-10 md:py-14">
      <SectionDivider />
      <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl px-5 pt-10 md:pt-14">
        <AnimatedSection>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[rgba(212,168,50,0.1)] border border-[rgba(212,168,50,0.18)] flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-[#D4A832]" />
            </div>
            <h3 className="font-serif text-lg md:text-xl font-bold text-[#3D2B1F]">
              常见问题
            </h3>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <Accordion className="w-full">
            {faq.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-b border-[#EDE5DB]"
              >
                <AccordionTrigger className="text-left text-[#3D2B1F] hover:text-[#5A4A3F] hover:no-underline py-4 text-sm md:text-base font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#8B7E74] leading-relaxed pb-4 text-sm">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
}
