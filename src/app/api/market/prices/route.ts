import { NextResponse } from "next/server";
import { getPrices } from "@/lib/coingecko";
import { DERBY_COINS } from "@/lib/constants";

export async function GET() {
  try {
    const prices = await getPrices();
    const coins = DERBY_COINS.map((c) => ({
      ...c,
      price: prices[c.id] ?? 0,
    }));
    return NextResponse.json({ coins, updatedAt: Date.now() });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 503 },
    );
  }
}
