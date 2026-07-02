"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { db } from "@/lib/db";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { CountdownTimer } from "@/components/CountdownTimer";
import { CoinSelector } from "@/components/CoinSelector";
import { ActiveChallengeView } from "@/components/ActiveChallengeView";
import { ResultScreen } from "@/components/ResultScreen";
import { ChallengeFlowStepper } from "@/components/ChallengeFlowStepper";
import { CHALLENGE_STATUS } from "@/lib/constants";
import { useChallengeTick } from "@/hooks/useChallengeTick";
import { fadeIn } from "@/lib/motion";

export default function ChallengePage() {
  return (
    <AuthProvider>
      <ChallengeContent />
    </AuthProvider>
  );
}

function ChallengeContent() {
  const { id } = useParams<{ id: string }>();
  const { user, apiFetch, refreshUser } = useAuth();
  const tick = useChallengeTick(5000);

  const { isLoading, data } = db.useQuery({
    challenges: {
      $: { where: { id } },
      creator: {},
      participants: { user: {} },
    },
  });

  useEffect(() => {
    if (data?.challenges?.[0]?.status === "COMPLETED") {
      refreshUser();
    }
  }, [data?.challenges, refreshUser]);

  const challenge = data?.challenges?.[0];
  const participant = challenge?.participants?.find(
    (p) => p.user?.id === user?.id,
  );
  const isJoined = !!participant;

  const join = async () => {
    const res = await apiFetch(`/api/challenges/${id}/join`, { method: "POST" });
    const d = await res.json();
    if (!res.ok) alert(d.error);
    else await refreshUser();
  };

  if (isLoading || !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-2 border-emerald-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const canJoin =
    challenge.status === CHALLENGE_STATUS.OPEN &&
    Date.now() < challenge.startTime &&
    !isJoined;

  return (
    <div className="min-h-screen pb-12">
      <Navbar />
      <main className="page-main max-w-2xl space-y-4 sm:space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition"
        >
          <span aria-hidden>←</span>
          Back to Dashboard
        </Link>

        <motion.div {...fadeIn} className="glass-panel rounded-2xl p-6 space-y-4">
          <p className="text-xs text-zinc-500 font-mono">#{challenge.id.slice(0, 8)}</p>
          <h1 className="text-xl sm:text-2xl font-bold">Crypto Derby Race</h1>
          <p className="text-zinc-400 text-xs sm:text-sm break-words">
            Host: @{challenge.creator?.username} · Entry: ${challenge.entryAmount} ·{" "}
            {challenge.participants?.length ?? 0} players
          </p>
          <ChallengeFlowStepper status={challenge.status} />
        </motion.div>

        {canJoin && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={join}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-bold"
          >
            Join Challenge (${challenge.entryAmount})
          </motion.button>
        )}

        {challenge.status === CHALLENGE_STATUS.OPEN && isJoined && (
          <>
            <CountdownTimer
              label="Race starts in — pick your coin!"
              targetTime={challenge.startTime}
              onComplete={tick}
            />
            <CoinSelector
              challengeId={challenge.id}
              selectedCoinId={participant?.selectedCoinId}
              disabled={Date.now() >= challenge.startTime}
            />
          </>
        )}

        {challenge.status === CHALLENGE_STATUS.ACTIVE && participant?.selectedCoinId && (
          <ActiveChallengeView
            coinId={participant.selectedCoinId}
            startingPrice={participant.startingPrice}
            endTime={challenge.endTime}
            participantCount={challenge.participants?.length ?? 0}
            onTick={tick}
          />
        )}

        {challenge.status === CHALLENGE_STATUS.COMPLETED && participant && (
          <ResultScreen
            winningCoinId={challenge.winningCoinId}
            selectedCoinId={participant.selectedCoinId}
            startingPrice={participant.startingPrice}
            endingPrice={participant.endingPrice}
            percentChange={participant.percentChange}
            isWinner={participant.isWinner}
            profitLoss={participant.profitLoss}
            walletBalance={user?.walletBalance ?? 0}
            participantCount={challenge.participants?.length ?? 0}
          />
        )}
      </main>
    </div>
  );
}
