"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CountdownTimer } from "./CountdownTimer";
import { getCoin } from "@/lib/constants";
import { percentChange } from "@/lib/decimal";

type Props = {
  coinId: string;
  startingPrice?: string;
  endTime: number;
  participantCount: number;
  onTick?: () => void;
};

export function ActiveChallengeView({
  coinId,
  startingPrice,
  endTime,
  participantCount,
  onTick,
}: Props) {
  const coin = getCoin(coinId);
  const [livePrice, setLivePrice] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/market/prices");
        if (res.ok) {
          const data = await res.json();
          const c = data.coins.find((x: { id: string }) => x.id === coinId);
          if (c) setLivePrice(c.price);
        }
      } catch {
        /* keep last price */
      }
    };
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [coinId]);

  const pct =
    startingPrice && livePrice !== null
      ? percentChange(startingPrice, String(livePrice))
      : null;
  const isUp = pct !== null && !pct.startsWith("-");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6"
    >
      <div className="text-center">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-5xl mb-2"
        >
          🏇
        </motion.div>
        <h2 className="text-lg sm:text-2xl font-bold flex flex-wrap items-center justify-center gap-2 px-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ background: coin?.color }}
          />
          <span>{coin?.symbol}</span>
          <span className="text-zinc-500 font-normal hidden sm:inline">—</span>
          <span className="text-base sm:text-2xl font-semibold">{coin?.name}</span>
        </h2>
        <p className="text-zinc-400 text-sm">{participantCount} racers</p>
      </div>

      <CountdownTimer label="Race ends in" targetTime={endTime} onComplete={onTick} />

      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
        <div className="rounded-xl bg-black/30 p-2 sm:p-4 min-w-0">
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">Start</p>
          <p className="font-mono text-[10px] sm:text-sm truncate">
            ${startingPrice ?? "—"}
          </p>
        </div>
        <div className="rounded-xl bg-black/30 p-2 sm:p-4 min-w-0">
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">Live</p>
          <motion.p
            key={livePrice}
            initial={{ color: "#34d399" }}
            animate={{ color: "#a7f3d0" }}
            className="font-mono text-[10px] sm:text-sm font-bold truncate"
          >
            ${livePrice?.toLocaleString(undefined, { maximumFractionDigits: 4 }) ?? "—"}
          </motion.p>
        </div>
        <div className="rounded-xl bg-black/30 p-2 sm:p-4 min-w-0">
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">Move</p>
          <p
            className={`font-mono text-[10px] sm:text-sm font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}
          >
            {pct !== null ? `${isUp ? "+" : ""}${pct}%` : "—"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
