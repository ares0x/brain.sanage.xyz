"use client";

import { useEffect, useState } from "react";

interface ScoreCounterProps {
  target: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function ScoreCounter({
  target,
  duration = 1200,
  className = "",
  suffix = "",
}: ScoreCounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let raf: number;

    const animate = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    // Small delay before starting
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
}
