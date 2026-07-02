export const INITIAL_WALLET_BALANCE = 10000;

export const CHALLENGE_STATUS = {
  OPEN: "OPEN",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
} as const;

export const PARTICIPANT_STATUS = {
  JOINED: "JOINED",
  SELECTED: "SELECTED",
  INACTIVE: "INACTIVE",
  WON: "WON",
  LOST: "LOST",
} as const;

export type ChallengeStatus =
  (typeof CHALLENGE_STATUS)[keyof typeof CHALLENGE_STATUS];

export const DERBY_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", color: "#F7931A" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", color: "#627EEA" },
  { id: "solana", symbol: "SOL", name: "Solana", color: "#9945FF" },
  { id: "cardano", symbol: "ADA", name: "Cardano", color: "#0033AD" },
  { id: "ripple", symbol: "XRP", name: "XRP", color: "#23292F" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", color: "#C2A633" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", color: "#E6007A" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", color: "#375BD2" },
] as const;

export const COIN_IDS = DERBY_COINS.map((c) => c.id);

export function getCoin(id: string) {
  return DERBY_COINS.find((c) => c.id === id);
}
