import { NextResponse } from "next/server";
import { processChallengeTransitions } from "@/lib/challenge-engine";

export async function POST() {
  try {
    await processChallengeTransitions();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Tick failed" }, { status: 500 });
  }
}
