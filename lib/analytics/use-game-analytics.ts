"use client";

import { useEffect, useRef } from "react";
import { gaEvent } from "./google-analytics";

export function useGameAnalytics(gameName: string, phase: string) {
  const phaseRef = useRef(phase);

  useEffect(() => {
    const prevPhase = phaseRef.current;

    if (prevPhase !== "playing" && phase === "playing") {
      gaEvent("game_start", { game_name: gameName });
    }

    if (prevPhase === "playing" && phase === "ended") {
      gaEvent("game_complete", { game_name: gameName });
    }

    phaseRef.current = phase;
  }, [phase, gameName]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (phaseRef.current === "playing") {
        gaEvent("game_abandon", { game_name: gameName });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [gameName]);
}
