"use client";

import { motion } from "framer-motion";
import { CHALLENGE_STATUS } from "@/lib/constants";

const STEPS = [
  { key: CHALLENGE_STATUS.OPEN, label: "Open", desc: "Join & pick coin" },
  { key: CHALLENGE_STATUS.ACTIVE, label: "Active", desc: "Live race" },
  { key: CHALLENGE_STATUS.COMPLETED, label: "Done", desc: "Results" },
] as const;

export function ChallengeFlowStepper({ status }: { status: string }) {
  const currentIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <div
                className={`absolute right-1/2 top-3 w-full h-px -translate-y-1/2 ${
                  done || active ? "bg-emerald-500/50" : "bg-white/10"
                }`}
                style={{ width: "calc(100% - 12px)", left: "calc(-50% + 6px)" }}
              />
            )}
            <motion.div
              initial={false}
              animate={{
                scale: active ? 1.1 : 1,
                backgroundColor: done
                  ? "rgba(16,185,129,0.3)"
                  : active
                    ? "rgba(16,185,129,0.2)"
                    : "rgba(255,255,255,0.05)",
              }}
              transition={{ duration: 0.3 }}
              className={`relative z-10 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                done || active
                  ? "border-emerald-500/60 text-emerald-400"
                  : "border-white/10 text-zinc-600"
              }`}
            >
              {done ? "✓" : i + 1}
            </motion.div>
            <p
              className={`text-[10px] mt-1.5 font-medium uppercase tracking-wide ${
                active ? "text-emerald-400" : "text-zinc-500"
              }`}
            >
              {step.label}
            </p>
            <p className="text-[9px] text-zinc-600 hidden sm:block">{step.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
