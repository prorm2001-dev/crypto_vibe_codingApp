import { COIN_IDS } from "./constants";

const CACHE_TTL_MS = 30_000;

let cache: { prices: Record<string, number>; at: number } | null = null;

type CoinGeckoConfig = {
  base: string;
  header: string;
};

const COINGECKO_ENDPOINTS: CoinGeckoConfig[] = [
  {
    base: "https://api.coingecko.com/api/v3",
    header: "x-cg-demo-api-key",
  },
  {
    base: "https://pro-api.coingecko.com/api/v3",
    header: "x-cg-pro-api-key",
  },
];

function parsePrices(data: Record<string, { usd: number }>): Record<string, number> {
  const prices: Record<string, number> = {};
  for (const id of COIN_IDS) {
    prices[id] = data[id]?.usd ?? 0;
  }
  return prices;
}

async function fetchFromEndpoint(
  config: CoinGeckoConfig,
  apiKey?: string,
): Promise<Record<string, number>> {
  const ids = COIN_IDS.join(",");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers[config.header] = apiKey;

  const res = await fetch(
    `${config.base}/simple/price?ids=${ids}&vs_currencies=usd&precision=8`,
    { headers, cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`CoinGecko ${config.base} error: ${res.status}`);
  }

  const data = (await res.json()) as Record<string, { usd: number }>;
  return parsePrices(data);
}

async function fetchPrices(): Promise<Record<string, number>> {
  const apiKey = process.env.COINGECKO_API_KEY?.trim();
  const preferPro = process.env.COINGECKO_USE_PRO === "true";
  const endpoints = preferPro
    ? [...COINGECKO_ENDPOINTS].reverse()
    : COINGECKO_ENDPOINTS;

  let lastError: Error | null = null;

  for (const config of endpoints) {
    try {
      return await fetchFromEndpoint(config, apiKey);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("CoinGecko request failed");
    }
  }

  if (!apiKey) {
    try {
      return await fetchFromEndpoint(COINGECKO_ENDPOINTS[0]);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("CoinGecko request failed");
    }
  }

  throw lastError ?? new Error("Market data unavailable");
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
