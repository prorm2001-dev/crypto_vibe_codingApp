"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DERBY_COINS } from "@/lib/constants";

type CoinPrice = {
  id: string;
  symbol: string;
  name: string;
  color: string;
  price: number;
};

export function MarketOverview() {
  const [coins, setCoins] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/market/prices");
        if (!res.ok) throw new Error("Market unavailable");
        const data = await res.json();
        setCoins(data.coins);
        setError("");
      } catch {
        setError("Market data temporarily unavailable");
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-5 animate-pulse h-64" />
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="section-header mb-4">
        <h2 className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Market
        </h2>
      </div>
      {error ? (
        <p className="text-amber-400 text-sm">{error}</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {coins.map((coin, i) => (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg bg-black/40 px-3 py-2.5 border border-white/5 hover:border-white/10 transition"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: coin.color }}
                />
                <span className="text-xs font-bold text-zinc-300">
                  {coin.symbol}
                </span>
              </div>
              <p className="font-mono text-xs text-emerald-400 font-medium truncate">
                $
                {coin.price.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
