"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { MarketOverview } from "@/components/MarketOverview";
import { CreateChallengeForm } from "@/components/CreateChallengeForm";
import {
  ChallengeCard,
  type ChallengeWithRelations,
} from "@/components/ChallengeCard";
import { ActiveChallengeView } from "@/components/ActiveChallengeView";
import { MyActiveChallenge } from "@/components/MyActiveChallenge";
import { CHALLENGE_STATUS } from "@/lib/constants";
import { useChallengeTick } from "@/hooks/useChallengeTick";
import { fadeIn } from "@/lib/motion";

export function Dashboard() {
  const { user, apiFetch, refreshUser } = useAuth();
  const [joining, setJoining] = useState<string | null>(null);
  const tick = useChallengeTick(5000);

  const { isLoading, data } = db.useQuery({
    challenges: {
      $: { order: { createdAt: "desc" } },
      creator: {},
      participants: { user: {} },
    },
  });

  useEffect(() => {
    const id = setInterval(refreshUser, 15_000);
    return () => clearInterval(id);
  }, [refreshUser]);

  const challenges = (data?.challenges ?? []) as ChallengeWithRelations[];
  const openChallenges = challenges.filter(
    (c) => c.status === CHALLENGE_STATUS.OPEN,
  );
  const myActive = challenges.find((c) => {
    const isParticipant = c.participants?.some((p) => p.user?.id === user?.id);
    return (
      isParticipant &&
      (c.status === CHALLENGE_STATUS.OPEN ||
        c.status === CHALLENGE_STATUS.ACTIVE)
    );
  });
  const myParticipant = myActive?.participants?.find(
    (p) => p.user?.id === user?.id,
  );
  const completed = challenges.filter(
    (c) =>
      c.status === CHALLENGE_STATUS.COMPLETED &&
      c.participants?.some((p) => p.user?.id === user?.id),
  );

  const join = async (id: string) => {
    setJoining(id);
    try {
      const res = await apiFetch(`/api/challenges/${id}/join`, {
        method: "POST",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      await refreshUser();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Join failed");
    } finally {
      setJoining(null);
    }
  };

  if (isLoading) {
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

  return (
    <div className="min-h-screen pb-12 dashboard-bg">
      <Navbar />
      <main className="page-main max-w-6xl">
        {/* Hero */}
        <motion.header
          {...fadeIn}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
        >
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-emerald-500/80 mb-1">
              Dashboard
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Hey, <span className="text-emerald-400">{user?.username}</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Pick a race. Ride the pump. Win the pot.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-[10px] uppercase tracking-wider text-amber-500/80">
                Wallet
              </p>
              <p className="font-mono font-bold text-amber-400">
                ${user?.walletBalance.toLocaleString()}
              </p>
            </div>
            <CreateChallengeForm onCreated={refreshUser} />
          </div>
        </motion.header>

        {myActive && (
          <div className="mb-6">
            <MyActiveChallenge
              challenge={myActive}
              selectedCoinId={myParticipant?.selectedCoinId}
              onTick={tick}
            />
          </div>
        )}

        {myActive?.status === CHALLENGE_STATUS.ACTIVE &&
          myParticipant?.selectedCoinId && (
            <div className="mb-6">
              <ActiveChallengeView
                coinId={myParticipant.selectedCoinId}
                startingPrice={myParticipant.startingPrice}
                endTime={myActive.endTime}
                participantCount={myActive.participants?.length ?? 0}
                onTick={tick}
              />
            </div>
          )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left column — challenges */}
          <div className="lg:col-span-3 space-y-6">
            <motion.section {...fadeIn}>
              <div className="section-header">
                <h2>Open Challenges</h2>
                <span className="text-xs text-zinc-500">
                  {openChallenges.length} available
                </span>
              </div>
              {openChallenges.length === 0 ? (
                <div className="empty-state">
                  <span className="text-2xl mb-2">🏁</span>
                  <p>No open challenges yet</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Create one to start a race
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {openChallenges.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ChallengeCard
                        challenge={c}
                        userId={user?.id}
                        onJoin={join}
                        joining={joining === c.id}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>

            {completed.length > 0 && (
              <motion.section {...fadeIn}>
                <div className="section-header">
                  <h2>Recent Results</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {completed.slice(0, 4).map((c) => (
                    <ChallengeCard
                      key={c.id}
                      challenge={c}
                      userId={user?.id}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right column — market */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <MarketOverview />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
