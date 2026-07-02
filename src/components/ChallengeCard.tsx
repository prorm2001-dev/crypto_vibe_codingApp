"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CountdownTimer } from "./CountdownTimer";
import { CHALLENGE_STATUS, getCoin } from "@/lib/constants";
import type { AppSchema } from "@/instant.schema";
import type { InstaQLEntity } from "@instantdb/react";

export type ChallengeWithRelations = InstaQLEntity<
  AppSchema,
  "challenges",
  { creator: object; participants: { user: object } }
>;

type Props = {
  challenge: ChallengeWithRelations;
  userId?: string;
  onJoin?: (id: string) => void;
  joining?: boolean;
};

export function ChallengeCard({ challenge, userId, onJoin, joining }: Props) {
  const participants = challenge.participants ?? [];
  const isJoined = participants.some((p) => p.user?.id === userId);
  const canJoin =
    challenge.status === CHALLENGE_STATUS.OPEN &&
    Date.now() < challenge.startTime &&
    !isJoined;
  const winner = challenge.winningCoinId
    ? getCoin(challenge.winningCoinId)
    : null;

  const statusColors: Record<string, string> = {
    OPEN: "bg-blue-500/20 text-blue-400",
    ACTIVE: "bg-emerald-500/20 text-emerald-400",
    COMPLETED: "bg-zinc-500/20 text-zinc-400",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-2xl p-4 sm:p-5 hover:border-emerald-500/30 border border-white/5 transition"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-zinc-500 font-mono">
            #{challenge.id.slice(0, 8)}
          </p>
          <p className="text-sm text-zinc-400">
            by @{challenge.creator?.username ?? "unknown"}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[challenge.status] ?? ""}`}
        >
          {challenge.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <p className="text-zinc-500 text-xs">Entry</p>
          <p className="font-semibold text-amber-400">
            ${challenge.entryAmount}
          </p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs">Players</p>
          <p className="font-semibold">{participants.length}</p>
        </div>
      </div>

      {challenge.status === CHALLENGE_STATUS.OPEN && (
        <CountdownTimer
          size="sm"
          label="Starts in"
          targetTime={challenge.startTime}
        />
      )}
      {challenge.status === CHALLENGE_STATUS.ACTIVE && (
        <CountdownTimer
          size="sm"
          label="Ends in"
          targetTime={challenge.endTime}
        />
      )}
      {winner && (
        <p className="text-sm text-emerald-400 mt-3">
          Winner: {winner.symbol} ({winner.name})
        </p>
      )}

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Link
          href={`/challenge/${challenge.id}`}
          className="flex-1 text-center py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition"
        >
          View
        </Link>
        {canJoin && onJoin && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={joining}
            onClick={() => onJoin(challenge.id)}
            className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-sm font-medium disabled:opacity-50"
          >
            {joining ? "..." : "Join"}
          </motion.button>
        )}
        {isJoined && challenge.status === CHALLENGE_STATUS.OPEN && (
          <span className="flex-1 text-center py-2 text-xs text-emerald-400">
            {participants.find((p) => p.user?.id === userId)?.selectedCoinId
              ? "Joined · pick set"
              : "Joined · pick coin"}
          </span>
        )}
      </div>
    </motion.div>
  );
}
