import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { getAuthFromRequest } from "@/lib/auth";
import { CHALLENGE_STATUS, COIN_IDS, PARTICIPANT_STATUS } from "@/lib/constants";
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
  const { coinId } = await req.json();

  if (!coinId || !COIN_IDS.includes(coinId)) {
    return NextResponse.json({ error: "Invalid coin selection" }, { status: 400 });
  }

  try {
    const { challenges } = await adminDb.query({
      challenges: {
        $: { where: { id: challengeId } },
        participants: { user: {} },
      },
    });

    const challenge = challenges[0] as
      | {
          status: string;
          startTime: number;
          participants?: {
            id: string;
            selectedCoinId?: string;
            user?: { id: string }[];
          }[];
        }
      | undefined;

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    if (challenge.status !== CHALLENGE_STATUS.OPEN) {
      return NextResponse.json(
        { error: "Coin selection is only allowed while challenge is open" },
        { status: 400 },
      );
    }

    if (Date.now() >= challenge.startTime) {
      return NextResponse.json(
        { error: "Coin selection period has ended" },
        { status: 400 },
      );
    }

    const participant = challenge.participants?.find(
      (p) => linkId(p.user) === auth.userId,
    );

    if (!participant) {
      return NextResponse.json(
        { error: "You must join the challenge first" },
        { status: 400 },
      );
    }

    await adminDb.transact(
      adminDb.tx.participants[participant.id].update({
        selectedCoinId: coinId,
        status: PARTICIPANT_STATUS.SELECTED,
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to select coin" },
      { status: 500 },
    );
  }
}
