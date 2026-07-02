import { COIN_IDS } from "./constants";

const BASE = "https://api.coingecko.com/api/v3";
const CACHE_TTL_MS = 30_000;

let cache: { prices: Record<string, number>; at: number } | null = null;

async function fetchPrices(): Promise<Record<string, number>> {
  const ids = COIN_IDS.join(",");
  const headers: Record<string, string> = { Accept: "application/json" };
  const key = process.env.COINGECKO_API_KEY;
  if (key) headers["x-cg-demo-api-key"] = key;

  const res = await fetch(
    `${BASE}/simple/price?ids=${ids}&vs_currencies=usd&precision=8`,
    { headers, next: { revalidate: 30 } },
  );

  if (!res.ok) {
    throw new Error(`CoinGecko error: ${res.status}`);
  }

  const data = (await res.json()) as Record<string, { usd: number }>;
  const prices: Record<string, number> = {};
  for (const id of COIN_IDS) {
    prices[id] = data[id]?.usd ?? 0;
  }
  return prices;
}

export async function getPrices(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) {
    return cache.prices;
  }
  try {
    const prices = await fetchPrices();
    cache = { prices, at: now };
    return prices;
  } catch {
    if (cache) return cache.prices;
    throw new Error("Market data unavailable");
  }
}

export function priceToString(price: number): string {
  return price.toFixed(8).replace(/\.?0+$/, "") || "0";
}
