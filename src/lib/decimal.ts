/** Price math using integer nano-units (8 decimal places) to avoid float drift */
const SCALE = 100_000_000n;

export function priceToMicro(price: string | number): bigint {
  const str = typeof price === "number" ? price.toFixed(12) : String(price);
  const [whole, frac = ""] = str.split(".");
  const padded = (frac + "00000000").slice(0, 8);
  return BigInt(whole) * SCALE + BigInt(padded);
}

export function microToPrice(micro: bigint): string {
  const negative = micro < 0n;
  const abs = negative ? -micro : micro;
  const whole = abs / SCALE;
  const frac = (abs % SCALE).toString().padStart(8, "0").replace(/0+$/, "");
  const value = frac ? `${whole}.${frac}` : whole.toString();
  return negative ? `-${value}` : value;
}

/** Returns percent as string with up to 2 decimal places */
export function percentChange(start: string, end: string): string {
  const startMicro = priceToMicro(start);
  if (startMicro === 0n) return "0";
  const endMicro = priceToMicro(end);
  const pctTimes100 = ((endMicro - startMicro) * 10000n) / startMicro;
  const sign = pctTimes100 < 0n ? "-" : "";
  const abs = pctTimes100 < 0n ? -pctTimes100 : pctTimes100;
  const whole = abs / 100n;
  const frac = (abs % 100n).toString().padStart(2, "0").replace(/0+$/, "");
  return frac ? `${sign}${whole}.${frac}` : `${sign}${whole}`;
}

export function comparePercent(a: string, b: string): number {
  const parse = (s: string) => {
    const neg = s.startsWith("-");
    const [w, f = ""] = s.replace("-", "").split(".");
    const val = BigInt(w) * 100n + BigInt((f + "00").slice(0, 2));
    return neg ? -val : val;
  };
  const av = parse(a);
  const bv = parse(b);
  if (av > bv) return 1;
  if (av < bv) return -1;
  return 0;
}
