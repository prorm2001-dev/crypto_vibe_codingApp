"use client";

import { motion } from "framer-motion";
import { DERBY_COINS } from "@/lib/constants";

const ORBS = [
  { color: "rgba(16,185,129,0.15)", x: "15%", y: "20%", size: 320 },
  { color: "rgba(139,92,246,0.12)", x: "75%", y: "60%", size: 400 },
  { color: "rgba(6,182,212,0.1)", x: "50%", y: "10%", size: 280 },
];

const COIN_POSITIONS = [
  { left: "8%", top: "18%", delay: 0 },
  { left: "82%", top: "12%", delay: 0.4 },
  { left: "72%", top: "72%", delay: 0.8 },
  { left: "18%", top: "78%", delay: 1.2 },
  { left: "45%", top: "8%", delay: 0.6 },
  { left: "90%", top: "45%", delay: 1.0 },
  { left: "5%", top: "48%", delay: 1.4 },
  { left: "55%", top: "85%", delay: 0.2 },
];

export function LoginBackground({
  intensity = "full",
}: {
  intensity?: "full" | "subtle";
}) {
  const coinOpacity = intensity === "full" ? [0.4, 0.85, 0.4] : [0.2, 0.45, 0.2];
  const orbOpacity = intensity === "full" ? [0.6, 1, 0.6] : [0.35, 0.55, 0.35];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid opacity-[0.15]" />

      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: orbOpacity,
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle race track arc */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M -50 400 Q 300 100 600 400 T 1250 400"
          fill="none"
          stroke="url(#trackGrad)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {DERBY_COINS.map((coin, i) => {
        const pos = COIN_POSITIONS[i];
        return (
          <motion.div
            key={coin.id}
            className="absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/5 bg-black/20 backdrop-blur-sm"
            style={{
              left: pos.left,
              top: pos.top,
              boxShadow: `0 0 20px ${coin.color}22`,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: coinOpacity,
              y: [0, -18, 0],
              x: [0, i % 2 === 0 ? 8 : -8, 0],
              scale: 1,
            }}
            transition={{
              opacity: { duration: 4 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: pos.delay },
              x: { duration: 6 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: pos.delay },
              scale: { duration: 0.5, delay: 0.1 * i },
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: coin.color }}
            />
            <span
              className="text-[11px] font-bold tracking-wide"
              style={{ color: coin.color }}
            >
              {coin.symbol}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
