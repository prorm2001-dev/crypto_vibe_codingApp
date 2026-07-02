"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  targetTime: number;
  label?: string;
  onComplete?: () => void;
  size?: "sm" | "lg";
};

export function CountdownTimer({
  targetTime,
  label,
  onComplete,
  size = "lg",
}: Props) {
  const [remaining, setRemaining] = useState(
    Math.max(0, targetTime - Date.now()),
  );

  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
  }, [targetTime]);

  useEffect(() => {
    const tick = () => {
      const r = Math.max(0, targetTime - Date.now());
      setRemaining(r);
      if (r === 0 && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime, onComplete]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const urgent = remaining < 60000 && remaining > 0;

  const digitClass =
    size === "lg"
      ? "text-3xl sm:text-5xl md:text-6xl font-bold tabular-nums"
      : "text-xl sm:text-2xl font-bold tabular-nums";

  const boxClass =
    size === "lg"
      ? "glass-panel px-3 py-2 sm:px-4 sm:py-3 rounded-xl"
      : "glass-panel px-2.5 py-2 sm:px-4 sm:py-3 rounded-xl";

  return (
    <div className="text-center">
      {label && (
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 mb-2 px-2">
          {label}
        </p>
      )}
      <motion.div
        animate={urgent ? { scale: [1, 1.02, 1] } : { opacity: 1 }}
        transition={{ repeat: urgent ? Infinity : 0, duration: 1 }}
        className={`flex items-center justify-center gap-1.5 sm:gap-2 ${urgent ? "text-amber-400" : "text-emerald-400"}`}
      >
        <div className={boxClass}>
          <span className={digitClass}>{String(mins).padStart(2, "0")}</span>
          <span className="text-[10px] sm:text-xs block text-zinc-500">MIN</span>
        </div>
        <span className={`${digitClass} text-zinc-600 pb-4`}>:</span>
        <div className={boxClass}>
          <span className={digitClass}>{String(secs).padStart(2, "0")}</span>
          <span className="text-[10px] sm:text-xs block text-zinc-500">SEC</span>
        </div>
      </motion.div>
    </div>
  );
}
