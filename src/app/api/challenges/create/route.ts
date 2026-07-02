import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { getAuthFromRequest } from "@/lib/auth";
import { id, userHasActiveChallenge } from "@/lib/challenge-engine";
import { CHALLENGE_STATUS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { startTime, endTime, entryAmount } = await req.json();
    const start = Number(startTime);
    const end = Number(endTime);
    const entry = Number(entryAmount);

    if (!start || !end || !entry) {
      return NextResponse.json(
        { error: "Start time, end time, and entry amount are required" },
        { status: 400 },
      );
    }

    if (start <= Date.now() + 60_000) {
      return NextResponse.json(
        { error: "Start time must be at least 1 minute in the future" },
        { status: 400 },
      );
    }

    if (end <= start + 120_000) {
      return NextResponse.json(
        { error: "Challenge must last at least 2 minutes" },
        { status: 400 },
      );
    }

    if (entry < 10 || entry > 5000) {
      return NextResponse.json(
        { error: "Entry amount must be between 10 and 5000" },
        { status: 400 },
      );
    }

    const { profiles } = await adminDb.query({
      profiles: { $: { where: { id: auth.userId } } },
    });
    const profile = profiles[0] as { walletBalance: number } | undefined;
    if (!profile || profile.walletBalance < entry) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 },
      );
    }

    if (await userHasActiveChallenge(auth.userId)) {
      return NextResponse.json(
        { error: "You can only participate in one active challenge at a time" },
        { status: 400 },
      );
    }

    const challengeId = id();
    const participantId = id();

    await adminDb.transact([
      adminDb.tx.challenges[challengeId]
        .update({
          status: CHALLENGE_STATUS.OPEN,
          startTime: start,
          endTime: end,
          entryAmount: entry,
          createdAt: Date.now(),
        })
        .link({ creator: auth.userId }),
      adminDb.tx.participants[participantId]
        .update({
          status: "JOINED",
          joinedAt: Date.now(),
        })
        .link({ challenge: challengeId, user: auth.userId }),
      adminDb.tx.profiles[auth.userId].update({
        walletBalance: profile.walletBalance - entry,
      }),
    ]);

    return NextResponse.json({ challengeId });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 },
    );
  }
}
