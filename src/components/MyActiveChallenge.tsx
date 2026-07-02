"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CountdownTimer } from "./CountdownTimer";
import { ChallengeFlowStepper } from "./ChallengeFlowStepper";
import { CHALLENGE_STATUS, getCoin } from "@/lib/constants";
import type { ChallengeWithRelations } from "./ChallengeCard";
import { fadeIn } from "@/lib/motion";

type Props = {
  challenge: ChallengeWithRelations;
  selectedCoinId?: string;
  onTick?: () => void;
};

export function MyActiveChallenge({
  challenge,
  selectedCoinId,
  onTick,
}: Props) {
  const coin = selectedCoinId ? getCoin(selectedCoinId) : null;
  const isOpen = challenge.status === CHALLENGE_STATUS.OPEN;
  const target = isOpen ? challenge.startTime : challenge.endTime;
  const label = isOpen
    ? "Pick your coin before start"
    : "Race ends in";

  return (
    <motion.section {...fadeIn} className="glass-panel rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold">My Active Challenge</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
          {challenge.status}
        </span>
      </div>

      <ChallengeFlowStepper status={challenge.status} />

      <CountdownTimer
        label={label}
        targetTime={target}
        size="sm"
        onComplete={onTick}
      />

      {coin ? (
        <p className="text-sm text-center text-zinc-400">
          Your pick:{" "}
          <span className="text-emerald-400 font-semibold">{coin.symbol}</span>
          {isOpen && (
            <span className="text-zinc-500"> · change before start</span>
          )}
        </p>
      ) : isOpen ? (
        <p className="text-sm text-center text-amber-400/90 animate-pulse">
          No coin selected yet — choose before the race starts
        </p>
      ) : null}

      <Link
        href={`/challenge/${challenge.id}`}
        className="block text-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm transition"
      >
        {isOpen && !selectedCoinId
          ? "Select Coin →"
          : isOpen && selectedCoinId
            ? "Change Pick →"
            : "View Race →"}
      </Link>
    </motion.section>
  );
}
