"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkline, formatChange, formatPrice } from "@/components/charts/Sparkline";
import { useMarketData } from "@/hooks/useMarketData";
import { DERBY_COINS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

type Props = {
  challengeId: string;
  selectedCoinId?: string;
  disabled?: boolean;
  onSelected?: () => void;
};

export function CoinSelector({
  challengeId,
  selectedCoinId,
  disabled,
  onSelected,
}: Props) {
  const { apiFetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(!selectedCoinId);
  const [picked, setPicked] = useState<string | null>(selectedCoinId ?? null);
  const [error, setError] = useState("");
  const { coins: marketCoins } = useMarketData(30_000);
  const marketById = Object.fromEntries(marketCoins.map((c) => [c.id, c]));

  useEffect(() => {
    if (!selectedCoinId) {
      setIsPickerOpen(true);
      setPicked(null);
      return;
    }
    setPicked(selectedCoinId);
  }, [selectedCoinId]);

  const confirm = async () => {
    if (!picked) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/challenges/${challengeId}/select`, {
        method: "POST",
        body: JSON.stringify({ coinId: picked }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIsPickerOpen(false);
      onSelected?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Selection failed");
    } finally {
      setLoading(false);
    }
  };

  const showLocked = !!selectedCoinId && !isPickerOpen;
  const isChanging = !!selectedCoinId && isPickerOpen;
  const lockedCoin = selectedCoinId
    ? DERBY_COINS.find((c) => c.id === selectedCoinId)
    : null;

  return (
    <AnimatePresence mode="wait">
      {showLocked ? (
        <motion.div
          key="locked"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="glass-panel rounded-2xl p-6 text-center space-y-4"
        >
          <div>
            <p className="text-zinc-400 text-sm mb-2">Your pick</p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
            >
              <span
                className="w-4 h-4 rounded-full"
                style={{ background: lockedCoin?.color }}
              />
              <span className="text-2xl font-bold">{lockedCoin?.symbol}</span>
            </motion.div>
            {!disabled && (
              <p className="text-xs text-zinc-500 mt-3">
                Locked when the race starts — you can still change your pick
              </p>
            )}
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={() => {
                setPicked(selectedCoinId);
                setIsPickerOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-zinc-300 transition"
            >
              <span aria-hidden>←</span>
              Change pick
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="picker"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="glass-panel rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            {isChanging ? (
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition"
              >
                <span aria-hidden>←</span>
                Back
              </button>
            ) : (
              <span className="w-12" />
            )}
            <h3 className="font-semibold text-center flex-1">
              Pick Your Horse 🏇
            </h3>
            <span className="w-12" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {DERBY_COINS.map((coin) => {
              const market = marketById[coin.id];
              const up = (market?.change24h ?? 0) >= 0;
              return (
              <motion.button
                key={coin.id}
                type="button"
                disabled={disabled}
                whileHover={{ scale: disabled ? 1 : 1.05 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
                onClick={() => setPicked(coin.id)}
                className={`p-3 sm:p-4 rounded-xl border transition text-left ${
                  picked === coin.id
                    ? "border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20"
                    : "border-white/10 bg-black/20 hover:border-white/20"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: coin.color }}
                  />
                  {market && (
                    <span
                      className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                        up
                          ? "text-emerald-400 bg-emerald-500/15"
                          : "text-red-400 bg-red-500/15"
                      }`}
                    >
                      {formatChange(market.change24h)}
                    </span>
                  )}
                </div>
                <span className="font-bold block">{coin.symbol}</span>
                {market ? (
                  <>
                    <p className="font-mono text-[10px] text-emerald-400/90 mt-0.5">
                      ${formatPrice(market.price)}
                    </p>
                    <div className="mt-2 flex justify-center">
                      <Sparkline
                        data={market.sparkline7d}
                        color={up ? coin.color : "#f87171"}
                        width={64}
                        height={24}
                        filled={false}
                        animate={false}
                      />
                    </div>
                  </>
                ) : (
                  <span className="block text-xs text-zinc-500">{coin.name}</span>
                )}
              </motion.button>
            );
            })}
          </div>
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <button
            onClick={confirm}
            disabled={!picked || loading || disabled}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold disabled:opacity-40"
          >
            {loading
              ? "Saving..."
              : isChanging
                ? "Update Selection"
                : "Confirm Selection"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
