"use client";

import { motion } from "framer-motion";
import { db } from "@/lib/db";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { CHALLENGE_STATUS } from "@/lib/constants";
import { fadeIn } from "@/lib/motion";

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  );
}

function ProfileContent() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return <ProfileDetails userId={user.id} authUser={user} />;
}

function ProfileDetails({
  userId,
  authUser,
}: {
  userId: string;
  authUser: { username: string; email: string; walletBalance: number };
}) {
  const { isLoading, data } = db.useQuery({
    profiles: {
      $: { where: { id: userId } },
      participations: { challenge: {} },
      createdChallenges: {},
    },
  });

  const profile = data?.profiles?.[0];
  const participations = profile?.participations ?? [];
  const created = profile?.createdChallenges ?? [];

  const completed = participations.filter(
    (p) => p.challenge?.status === CHALLENGE_STATUS.COMPLETED,
  );
  const wins = completed.filter((p) => p.isWinner).length;
  const losses = completed.filter((p) => p.isWinner === false).length;
  const totalPnL = completed.reduce((sum, p) => sum + (p.profitLoss ?? 0), 0);
  const winRate =
    completed.length > 0
      ? Math.round((wins / completed.length) * 100)
      : 0;

  return (
    <div className="min-h-screen pb-12">
      <Navbar />
      <main className="page-main max-w-2xl space-y-4 sm:space-y-6">
        <motion.div {...fadeIn} className="glass-panel rounded-2xl p-5 sm:p-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center text-3xl border border-emerald-500/20"
          >
            🏇
          </motion.div>
          <h1 className="text-2xl font-bold">@{authUser.username}</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 break-all px-2">{authUser.email}</p>
          {profile?.createdAt && (
            <p className="text-xs text-zinc-600 mt-2">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          )}
        </motion.div>

        <motion.div
          {...fadeIn}
          className="glass-panel rounded-2xl p-6"
        >
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
            Wallet
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-amber-400 font-mono">
            ${authUser.walletBalance.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-600 mt-1">Virtual balance</p>
        </motion.div>

        <motion.div
          {...fadeIn}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "Races", value: participations.length },
            { label: "Wins", value: wins },
            { label: "Win Rate", value: `${winRate}%` },
            { label: "Hosted", value: created.length },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-bold">{isLoading ? "—" : stat.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div {...fadeIn} className="glass-panel rounded-2xl p-6">
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
            Performance
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Total P/L</span>
              <span
                className={`font-mono font-semibold ${
                  totalPnL >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {totalPnL >= 0 ? "+" : ""}${totalPnL}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Completed Races</span>
              <span>{completed.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Losses</span>
              <span>{losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">User ID</span>
              <span className="font-mono text-xs text-zinc-600">
                {userId.slice(0, 8)}…
              </span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
