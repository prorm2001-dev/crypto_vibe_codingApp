import { NextResponse } from "next/server";
import { getMarketData } from "@/lib/coingecko";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coins = await getMarketData();
    return NextResponse.json({ coins, updatedAt: Date.now() });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 503 },
    );
  }
}
