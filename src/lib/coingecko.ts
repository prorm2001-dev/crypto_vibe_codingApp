import { COIN_IDS, DERBY_COINS } from "./constants";
import type { MarketCoinData } from "./market-types";

const CACHE_TTL_MS = 30_000;

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

type MarketsRow = {
  id: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: number[] | { price?: number[] };
};

let cache: { data: MarketCoinData[]; at: number } | null = null;

function buildHeaders(apiKey: string | undefined, config: CoinGeckoConfig) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers[config.header] = apiKey;
  return headers;
}

function parseSparkline(row: MarketsRow): number[] {
  const raw = row.sparkline_in_7d;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((n) => Number.isFinite(n));
  if (Array.isArray(raw.price)) return raw.price.filter((n) => Number.isFinite(n));
  return [];
}

function mergeMarketRows(rows: MarketsRow[]): MarketCoinData[] {
  const byId = new Map(rows.map((r) => [r.id, r]));

  return DERBY_COINS.map((coin) => {
    const row = byId.get(coin.id);
    return {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      color: coin.color,
      price: row?.current_price ?? 0,
      change24h: row?.price_change_percentage_24h ?? 0,
      sparkline7d: row ? parseSparkline(row) : [],
    };
  });
}

async function fetchMarketsFromEndpoint(
  config: CoinGeckoConfig,
  apiKey?: string,
): Promise<MarketCoinData[]> {
  const ids = COIN_IDS.join(",");
  const url = `${config.base}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;

  const res = await fetch(url, {
    headers: buildHeaders(apiKey, config),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`CoinGecko ${config.base} error: ${res.status}`);
  }

  const rows = (await res.json()) as MarketsRow[];
  return mergeMarketRows(rows);
}

async function fetchSimplePrices(
  config: CoinGeckoConfig,
  apiKey?: string,
): Promise<MarketCoinData[]> {
  const ids = COIN_IDS.join(",");
  const url = `${config.base}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&precision=8`;

  const res = await fetch(url, {
    headers: buildHeaders(apiKey, config),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`CoinGecko ${config.base} error: ${res.status}`);
  }

  const data = (await res.json()) as Record<
    string,
    { usd: number; usd_24h_change?: number }
  >;

  return DERBY_COINS.map((coin) => ({
    id: coin.id,
    symbol: coin.symbol,
    name: coin.name,
    color: coin.color,
    price: data[coin.id]?.usd ?? 0,
    change24h: data[coin.id]?.usd_24h_change ?? 0,
    sparkline7d: [],
  }));
}

async function fetchMarketData(): Promise<MarketCoinData[]> {
  const apiKey = process.env.COINGECKO_API_KEY?.trim();
  const preferPro = process.env.COINGECKO_USE_PRO === "true";
  const endpoints = preferPro
    ? [...COINGECKO_ENDPOINTS].reverse()
    : COINGECKO_ENDPOINTS;

  let lastError: Error | null = null;

  for (const config of endpoints) {
    try {
      return await fetchMarketsFromEndpoint(config, apiKey);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("CoinGecko request failed");
    }
  }

  for (const config of endpoints) {
    try {
      return await fetchSimplePrices(config, apiKey);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("CoinGecko request failed");
    }
  }

  throw lastError ?? new Error("Market data unavailable");
}

export async function getMarketData(): Promise<MarketCoinData[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }

  try {
    const data = await fetchMarketData();
    cache = { data, at: now };
    return data;
  } catch {
    if (cache) return cache.data;
    throw new Error("Market data unavailable");
  }
}

export async function getPrices(): Promise<Record<string, number>> {
  const data = await getMarketData();
  const prices: Record<string, number> = {};
  for (const coin of data) {
    prices[coin.id] = coin.price;
  }
  return prices;
}

export function priceToString(price: number): string {
  return price.toFixed(8).replace(/\.?0+$/, "") || "0";
}
