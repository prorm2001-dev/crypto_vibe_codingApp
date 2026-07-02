export type MarketCoinData = {
  id: string;
  symbol: string;
  name: string;
  color: string;
  price: number;
  change24h: number;
  sparkline7d: number[];
};

export type MarketResponse = {
  coins: MarketCoinData[];
  updatedAt: number;
};
