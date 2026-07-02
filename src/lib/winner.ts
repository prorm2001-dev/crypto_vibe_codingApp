import { comparePercent } from "./decimal";

/** Pick coin with highest positive % change; ties broken alphabetically. */
export function pickWinningCoin(
  coinChanges: Map<string, string>,
  coinIds: readonly string[],
): string {
  const positive = coinIds.filter(
    (id) => comparePercent(coinChanges.get(id) ?? "0", "0") > 0,
  );
  const pool = positive.length > 0 ? positive : [...coinIds];

  let bestCoin = pool[0];
  let bestPct = coinChanges.get(bestCoin) ?? "0";

  for (const coinId of pool) {
    const pct = coinChanges.get(coinId) ?? "0";
    if (comparePercent(pct, bestPct) > 0) {
      bestPct = pct;
      bestCoin = coinId;
    } else if (comparePercent(pct, bestPct) === 0 && coinId < bestCoin) {
      bestCoin = coinId;
    }
  }

  return bestCoin;
}
