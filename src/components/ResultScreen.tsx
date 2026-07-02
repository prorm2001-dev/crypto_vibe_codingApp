"use client";

import { motion } from "framer-motion";
import { getCoin } from "@/lib/constants";

type Props = {
  winningCoinId?: string;
  selectedCoinId?: string;
  startingPrice?: string;
  endingPrice?: string;
  percentChange?: string;
  isWinner?: boolean;
  profitLoss?: number;
  walletBalance: number;
  participantCount: number;
};

export function ResultScreen({
  winningCoinId,
  selectedCoinId,
  startingPrice,
  endingPrice,
  percentChange,
  isWinner,
  profitLoss,
  walletBalance,
  participantCount,
}: Props) {
  const winner = winningCoinId ? getCoin(winningCoinId) : null;
  const selected = selectedCoinId ? getCoin(selectedCoinId) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-2xl p-4 sm:p-8 text-center space-y-4 sm:space-y-6"
    >
      <motion.div
        animate={isWinner ? { rotate: [0, 5, -5, 0] } : {}}
        transition={{ repeat: isWinner ? Infinity : 0, duration: 0.5 }}
        className="text-6xl"
      >
        {isWinner ? "🏆" : "😔"}
      </motion.div>

      <div>
        <span
          className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 ${
            isWinner
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {isWinner ? "Win" : "Loss"}
        </span>
        <h2
          className={`text-xl sm:text-3xl font-bold ${isWinner ? "text-emerald-400" : "text-zinc-400"}`}
        >
          {isWinner ? "You Won!" : "Better Luck Next Race"}
        </h2>
        <p className="text-zinc-500 text-sm">
          {participantCount} participants competed
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-left">
        <div className="rounded-xl bg-black/30 p-4">
          <p className="text-xs text-zinc-500">Winning Coin</p>
          <p className="font-bold text-emerald-400">
            {winner?.symbol} — {winner?.name}
          </p>
        </div>
        <div className="rounded-xl bg-black/30 p-4">
          <p className="text-xs text-zinc-500">Your Pick</p>
          <p className="font-bold">
            {selected?.symbol} — {selected?.name}
          </p>
        </div>
        <div className="rounded-xl bg-black/30 p-4">
          <p className="text-xs text-zinc-500">Start → End</p>
          <p className="font-mono text-xs sm:text-sm break-all">
            ${startingPrice} → ${endingPrice}
          </p>
        </div>
        <div className="rounded-xl bg-black/30 p-4">
          <p className="text-xs text-zinc-500">Your Movement</p>
          <p className="font-mono text-sm">{percentChange}%</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
        <div>
          <p className="text-xs text-zinc-500">P/L</p>
          <p
            className={`text-xl font-bold ${(profitLoss ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {(profitLoss ?? 0) >= 0 ? "+" : ""}${profitLoss}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Wallet</p>
          <p className="text-xl font-bold text-amber-400">
            ${walletBalance.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
