"use client";

import { useEffect, useRef, useState } from "react";
import type { MarketCoinData, MarketResponse } from "@/lib/market-types";

export type PriceFlash = "up" | "down" | null;

export function useMarketData(intervalMs = 30_000) {
  const [coins, setCoins] = useState<MarketCoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [flashes, setFlashes] = useState<Record<string, PriceFlash>>({});
  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/market/prices");
        if (!res.ok) throw new Error("Market unavailable");
        const data = (await res.json()) as MarketResponse;
        if (cancelled) return;

        const nextFlashes: Record<string, PriceFlash> = {};
        const nextPrices: Record<string, number> = {};

        for (const c of data.coins) {
          nextPrices[c.id] = c.price;
          const old = prevPrices.current[c.id];
          if (old !== undefined && old !== c.price) {
            nextFlashes[c.id] = c.price > old ? "up" : "down";
          }
        }

        prevPrices.current = nextPrices;
        setFlashes(nextFlashes);
        if (Object.keys(nextFlashes).length > 0) {
          setTimeout(() => {
            if (!cancelled) setFlashes({});
          }, 700);
        }

        setCoins(data.coins);
        setUpdatedAt(data.updatedAt);
        setError("");
      } catch {
        if (!cancelled) setError("Market data temporarily unavailable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const id = setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  const topMover =
    coins.length > 0
      ? [...coins].sort((a, b) => b.change24h - a.change24h)[0]
      : null;

  return { coins, loading, error, updatedAt, topMover, flashes };
}

export function priceFlashClass(id: string, flashes: Record<string, PriceFlash>) {
  if (flashes[id] === "up") return "price-flash-up";
  if (flashes[id] === "down") return "price-flash-down";
  return "";
}
