"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { REAL_WORLD_MAPPINGS } from "@/config/game-real-world-mapping";

interface RealWorldMappingProps {
  gameId: string;
}

export function RealWorldMapping({ gameId }: RealWorldMappingProps) {
  const mapping = REAL_WORLD_MAPPINGS[gameId];
  if (!mapping) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#D4A832]" />
        <p className="text-sm font-bold text-[#3D2B1F]">
          这意味着你更容易——
        </p>
      </div>
      <ul className="space-y-2">
        {mapping.scenarios.map((scenario, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-start gap-2 text-sm text-[#8B7E74] leading-relaxed"
          >
            <span className="w-5 h-5 rounded-full bg-[rgba(212,168,50,0.1)] border border-[rgba(212,168,50,0.15)] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-[#D4A832]">
              {index + 1}
            </span>
            {scenario}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
