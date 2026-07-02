"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  Sparkline,
  formatChange,
  formatPrice,
} from "@/components/charts/Sparkline";
import { priceFlashClass, useMarketData } from "@/hooks/useMarketData";
import type { MarketCoinData } from "@/lib/market-types";

function ChangeBadge({ change }: { change: number }) {
  const up = change >= 0;
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
        up
          ? "text-emerald-400 bg-emerald-500/15"
          : "text-red-400 bg-red-500/15"
      }`}
    >
      {formatChange(change)}
    </span>
  );
}

function CoinRow({
  coin,
  rank,
  flashClass,
  selected,
  onSelect,
}: {
  coin: MarketCoinData;
  rank: number;
  flashClass: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const up = coin.change24h >= 0;
  const barWidth = Math.min(Math.abs(coin.change24h) * 8, 100);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full text-left rounded-xl border p-3 transition ${
        selected
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-white/5 bg-black/40 hover:border-white/15"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] text-zinc-600 font-mono w-4">#{rank}</span>
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: coin.color }}
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-zinc-200">{coin.symbol}</p>
            <p className="text-[10px] text-zinc-500 truncate">{coin.name}</p>
          </div>
        </div>
        <ChangeBadge change={coin.change24h} />
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-mono text-sm font-semibold text-emerald-400 truncate ${flashClass}`}>
            ${formatPrice(coin.price)}
          </p>
          <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden w-20">
            <motion.div
              className={`h-full rounded-full ${up ? "bg-emerald-500" : "bg-red-500"}`}
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
        <Sparkline
          data={coin.sparkline7d}
          color={up ? coin.color : "#f87171"}
          width={72}
          height={32}
        />
      </div>
    </motion.button>
  );
}

export function MarketOverview() {
  const { coins, loading, error, topMover, flashes } = useMarketData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = [...coins].sort((a, b) => b.change24h - a.change24h);
  const selected = sorted.find((c) => c.id === selectedId) ?? sorted[0];

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-5 space-y-3">
        <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="section-header mb-0">
        <h2 className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Market
        </h2>
        <span className="text-[10px] text-zinc-600">30s refresh</span>
      </div>

      {error ? (
        <p className="text-amber-400 text-sm">{error}</p>
      ) : (
        <>
          {topMover && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent p-3"
            >
              <p className="text-[10px] uppercase tracking-widest text-amber-500/80 mb-1">
                🏆 Top mover (24h)
              </p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: topMover.color }}
                  />
                  <span className="font-bold">{topMover.symbol}</span>
                  <ChangeBadge change={topMover.change24h} />
                </div>
                <Sparkline
                  data={topMover.sparkline7d}
                  color={topMover.color}
                  width={100}
                  height={40}
                />
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-white/8 bg-black/30 p-4 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: selected.color }}
                    />
                    <span className="font-semibold">{selected.name}</span>
                    <ChangeBadge change={selected.change24h} />
                  </div>
                  <p className="font-mono text-emerald-400 font-bold">
                    ${formatPrice(selected.price)}
                  </p>
                </div>
                <Sparkline
                  data={selected.sparkline7d}
                  color={selected.color}
                  width={280}
                  height={72}
                  filled
                  className="w-full"
                />
                <p className="text-[10px] text-zinc-600 mt-2 text-center">
                  7-day trend · tap a coin below to explore
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
            {sorted.map((coin, i) => (
              <CoinRow
                key={coin.id}
                coin={coin}
                rank={i + 1}
                flashClass={priceFlashClass(coin.id, flashes)}
                selected={selected?.id === coin.id}
                onSelect={() => setSelectedId(coin.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
