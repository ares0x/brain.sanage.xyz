"use client";

import { motion } from "framer-motion";

/* ------------------------------------------------------------------
   Stroop Test — Color Confusion Theme
   Floating soft color blobs suggesting the clash between word & ink
   ------------------------------------------------------------------ */
export function StroopDecoration() {
  const blobs = [
    { color: "#E05A5A", x: "8%", y: "15%", size: 72, delay: 0, duration: 5 },
    { color: "#4AAD7A", x: "85%", y: "20%", size: 56, delay: 0.8, duration: 6 },
    { color: "#5A9DE0", x: "75%", y: "75%", size: 64, delay: 1.5, duration: 5.5 },
    { color: "#D4A832", x: "12%", y: "70%", size: 48, delay: 2.2, duration: 6.5 },
    { color: "#A87AD4", x: "50%", y: "85%", size: 40, delay: 0.4, duration: 7 },
  ];

  return (
    <>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            background: b.color,
            opacity: 0.06,
          }}
          animate={{
            y: [0, -14, 0],
            x: [0, 8, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------
   Schulte Grid — Grid / Order Theme
   Faint grid lines that fade at edges, suggesting visual search space
   ------------------------------------------------------------------ */
export function SchulteDecoration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        className="w-full h-full opacity-[0.04]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="schulte-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5A9DE0" strokeWidth="0.8" />
          </pattern>
          <radialGradient id="schulte-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="70%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#schulte-grid)" />
        <rect width="100%" height="100%" fill="url(#schulte-fade)" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------
   N-Back — Memory / Echo Theme
   Concentric rings expanding outward like memory echoes
   ------------------------------------------------------------------ */
export function NbackDecoration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: 120 + i * 90,
            height: 120 + i * 90,
            borderColor: `rgba(168,122,212,${0.06 - i * 0.012})`,
          }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{
            duration: 4 + i * 0.8,
            delay: i * 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Reaction Time — Speed / Spark Theme
   Diagonal motion streaks suggesting velocity
   ------------------------------------------------------------------ */
export function ReactionTimeDecoration() {
  const streaks = [
    { x: "-10%", y: "60%", width: 140, rotate: -35, delay: 0 },
    { x: "70%", y: "-5%", width: 100, rotate: -35, delay: 0.7 },
    { x: "30%", y: "85%", width: 80, rotate: -35, delay: 1.4 },
    { x: "85%", y: "50%", width: 60, rotate: -35, delay: 2.1 },
  ];

  return (
    <>
      {streaks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px] rounded-full"
          style={{
            left: s.x,
            top: s.y,
            width: s.width,
            rotate: s.rotate,
            background: "linear-gradient(90deg, transparent, rgba(212,168,50,0.12), transparent)",
          }}
          animate={{ opacity: [0, 1, 0], x: [0, 60, 120] }}
          transition={{
            duration: 2.5,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------
   Attention Span — Focus / Target Theme
   Subtle target rings with pulsing center dot
   ------------------------------------------------------------------ */
export function AttentionDecoration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Outer rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: 180 + i * 70,
            height: 180 + i * 70,
            borderColor: `rgba(143,184,168,${0.07 - i * 0.015})`,
          }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Center crosshair lines */}
      <div className="absolute w-full h-[1px] bg-[rgba(143,184,168,0.04)]" />
      <div className="absolute h-full w-[1px] bg-[rgba(143,184,168,0.04)]" />
    </div>
  );
}

/* ------------------------------------------------------------------
   Digit Span — Sequence / Steps Theme
   Soft ascending bars suggesting increasing capacity
   ------------------------------------------------------------------ */
export function DigitSpanDecoration() {
  const bars = [
    { height: 16, x: "15%", opacity: 0.04 },
    { height: 28, x: "28%", opacity: 0.05 },
    { height: 40, x: "41%", opacity: 0.06 },
    { height: 52, x: "54%", opacity: 0.05 },
    { height: 64, x: "67%", opacity: 0.04 },
    { height: 44, x: "80%", opacity: 0.03 },
  ];

  return (
    <div className="absolute inset-0 flex items-end justify-center pb-4">
      {bars.map((b, i) => (
        <motion.div
          key={i}
          className="absolute bottom-[15%] w-[3px] rounded-full"
          style={{
            left: b.x,
            height: b.height,
            background: "#A87AD4",
            opacity: b.opacity,
          }}
          animate={{ height: [b.height, b.height * 1.3, b.height] }}
          transition={{
            duration: 3 + i * 0.3,
            delay: i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Task Switching — Switch / Transition Theme
   Alternating vertical bars suggesting rule set changes
   ------------------------------------------------------------------ */
export function TaskSwitchingDecoration() {
  const bars = [
    { x: "12%", height: 20, color: "#5A9DE0", delay: 0 },
    { x: "28%", height: 32, color: "#A87AD4", delay: 0.5 },
    { x: "44%", height: 24, color: "#D4A832", delay: 1 },
    { x: "60%", height: 36, color: "#5A9DE0", delay: 1.5 },
    { x: "76%", height: 28, color: "#A87AD4", delay: 2 },
    { x: "92%", height: 18, color: "#D4A832", delay: 2.5 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {bars.map((b, i) => (
        <motion.div
          key={i}
          className="absolute bottom-[20%] w-[3px] rounded-full"
          style={{
            left: b.x,
            height: b.height,
            background: b.color,
            opacity: 0.05,
          }}
          animate={{ opacity: [0.03, 0.08, 0.03], height: [b.height, b.height * 1.4, b.height] }}
          transition={{
            duration: 2.5,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Flanker — Focus / Direction Theme
   Horizontal motion streaks suggesting directional attention
   ------------------------------------------------------------------ */
export function FlankerDecoration() {
  const streaks = [
    { x: "5%", y: "40%", width: 80, rotate: 0, delay: 0, color: "rgba(90,157,224,0.08)" },
    { x: "80%", y: "60%", width: 60, rotate: 180, delay: 0.8, color: "rgba(90,157,224,0.06)" },
    { x: "20%", y: "70%", width: 50, rotate: 0, delay: 1.6, color: "rgba(90,157,224,0.07)" },
    { x: "70%", y: "25%", width: 45, rotate: 180, delay: 2.4, color: "rgba(90,157,224,0.05)" },
  ];

  return (
    <>
      {streaks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute h-[3px] rounded-full"
          style={{
            left: s.x,
            top: s.y,
            width: s.width,
            rotate: s.rotate,
            background: s.color,
          }}
          animate={{ opacity: [0.3, 0.8, 0.3], x: s.rotate === 0 ? [0, 20, 0] : [0, -20, 0] }}
          transition={{
            duration: 3,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------
   Go / No-Go — Stop / Go Theme
   Alternating green and red pulsing circles suggesting inhibition
   ------------------------------------------------------------------ */
export function GoNogoDecoration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 80 + i * 50,
            height: 80 + i * 50,
            background:
              i % 2 === 0
                ? `rgba(74,173,122,${0.04 - i * 0.008})`
                : `rgba(201,123,123,${0.04 - i * 0.008})`,
          }}
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2.5,
            delay: i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Breathing 4-7-8 — Calm / Flow Theme
   Gentle expanding/contracting circles suggesting breath rhythm
   ------------------------------------------------------------------ */
export function BreathingDecoration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: 100 + i * 60,
            height: 100 + i * 60,
            borderColor: `rgba(107,167,168,${0.08 - i * 0.02})`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            delay: i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Soft radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 30%, rgba(107,167,168,0.03) 70%)",
        }}
      />
    </div>
  );
}
