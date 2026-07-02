"use client";

import { useCallback, useEffect } from "react";

export function useChallengeTick(intervalMs = 5000) {
  const tick = useCallback(() => {
    fetch("/api/challenges/tick", { method: "POST" });
  }, []);

  useEffect(() => {
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs]);

  return tick;
}
