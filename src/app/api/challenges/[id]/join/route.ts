import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { getAuthFromRequest } from "@/lib/auth";
import { id, userHasActiveChallenge } from "@/lib/challenge-engine";
import { CHALLENGE_STATUS, PARTICIPANT_STATUS } from "@/lib/constants";
import { linkId } from "@/lib/links";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: challengeId } = await params;

  try {
    const { challenges } = await adminDb.query({
      challenges: {
        $: { where: { id: challengeId } },
        participants: { user: {} },
        creator: {},
      },
    });

    const challenge = challenges[0] as
      | {
          id: string;
          status: string;
          startTime: number;
          entryAmount: number;
          participants?: { id: string; user?: { id: string }[] }[];
        }
      | undefined;

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    if (challenge.status !== CHALLENGE_STATUS.OPEN) {
      return NextResponse.json(
        { error: "Challenge is not open for joining" },
        { status: 400 },
      );
    }

    if (Date.now() >= challenge.startTime) {
      return NextResponse.json(
        { error: "Participation period has ended" },
        { status: 400 },
      );
    }

    const alreadyJoined = challenge.participants?.some(
      (p) => linkId(p.user) === auth.userId,
    );
    if (alreadyJoined) {
      return NextResponse.json(
        { error: "Already joined this challenge" },
        { status: 400 },
      );
    }

    if (await userHasActiveChallenge(auth.userId)) {
      return NextResponse.json(
        { error: "You can only participate in one active challenge at a time" },
        { status: 400 },
      );
    }

    const { profiles } = await adminDb.query({
      profiles: { $: { where: { id: auth.userId } } },
    });
    const profile = profiles[0] as { walletBalance: number } | undefined;
    if (!profile || profile.walletBalance < challenge.entryAmount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 },
      );
    }

    const participantId = id();
    await adminDb.transact([
      adminDb.tx.participants[participantId]
        .update({
          status: PARTICIPANT_STATUS.JOINED,
          joinedAt: Date.now(),
        })
        .link({ challenge: challengeId, user: auth.userId }),
      adminDb.tx.profiles[auth.userId].update({
        walletBalance: profile.walletBalance - challenge.entryAmount,
      }),
    ]);

    return NextResponse.json({ participantId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to join challenge" }, { status: 500 });
  }
}
