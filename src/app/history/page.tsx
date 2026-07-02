"use client";

import { motion } from "framer-motion";
import { db } from "@/lib/db";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { CHALLENGE_STATUS, getCoin } from "@/lib/constants";

export default function HistoryPage() {
  return (
    <AuthProvider>
      <HistoryContent />
    </AuthProvider>
  );
}

function HistoryContent() {
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

  return <HistoryList userId={user.id} />;
}

function HistoryList({ userId }: { userId: string }) {
  const { isLoading, data } = db.useQuery({
    participants: {
      $: {
        where: { "user.id": userId },
        order: { joinedAt: "desc" },
      },
      challenge: { creator: {} },
      user: {},
    },
  });

  const history = data?.participants ?? [];

  return (
    <div className="min-h-screen pb-12">
      <Navbar />
      <main className="page-main max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Challenge History</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full"
            />
          </div>
        ) : history.length === 0 ? (
          <p className="text-zinc-500 glass-panel rounded-xl p-8 text-center">
            No races yet. Head to the dashboard to join one!
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((p, i) => {
              const c = p.challenge;
              if (!c) return null;
              const selected = p.selectedCoinId
                ? getCoin(p.selectedCoinId)
                : null;
              const winner = c.winningCoinId
                ? getCoin(c.winningCoinId)
                : null;
              const duration = Math.round(
                (c.endTime - c.startTime) / 60_000,
              );

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel rounded-xl p-5"
                >
                  <div className="flex flex-wrap justify-between gap-2 mb-3">
                    <div>
                      <p className="font-mono text-xs text-zinc-500">
                        #{c.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-zinc-400">
                        Host: @{c.creator?.username}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.isWinner
                          ? "bg-emerald-500/20 text-emerald-400"
                          : c.status === CHALLENGE_STATUS.COMPLETED
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {c.status === CHALLENGE_STATUS.COMPLETED
                        ? p.isWinner
                          ? "WON"
                          : "LOST"
                        : c.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-sm">
                    <div>
                      <p className="text-zinc-500 text-xs">Your Pick</p>
                      <p>{selected?.symbol ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Winner</p>
                      <p>{winner?.symbol ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Result</p>
                      <p className="font-mono text-xs">
                        {p.percentChange != null ? `${p.percentChange}%` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">Duration</p>
                      <p>{duration} min</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">P/L</p>
                      <p
                        className={
                          (p.profitLoss ?? 0) >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {(p.profitLoss ?? 0) >= 0 ? "+" : ""}$
                        {p.profitLoss ?? 0}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 mt-2">
                    {new Date(p.joinedAt).toLocaleString()}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
