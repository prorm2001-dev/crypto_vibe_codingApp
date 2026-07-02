import { id } from "@instantdb/admin";
import { adminDb } from "./admin";
import { getPrices, priceToString } from "./coingecko";
import {
  CHALLENGE_STATUS,
  COIN_IDS,
  PARTICIPANT_STATUS,
} from "./constants";
import { percentChange } from "./decimal";
import { pickWinningCoin } from "./winner";
import { linkEntity } from "./links";

type ChallengeRow = {
  id: string;
  status: string;
  startTime: number;
  endTime: number;
  entryAmount: number;
  winningCoinId?: string;
  lockedPrices?: string;
  participants?: ParticipantRow[];
};

type ParticipantRow = {
  id: string;
  selectedCoinId?: string;
  startingPrice?: string;
  endingPrice?: string;
  percentChange?: string;
  isWinner?: boolean;
  profitLoss?: number;
  status: string;
  user?: { id: string; walletBalance?: number } | { id: string; walletBalance?: number }[];
};

function parseLockedPrices(raw?: string): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function processChallengeTransitions() {
  const now = Date.now();
  const { challenges } = await adminDb.query({
    challenges: {
      $: {
        where: {
          or: [
            { status: CHALLENGE_STATUS.OPEN },
            { status: CHALLENGE_STATUS.ACTIVE },
          ],
        },
      },
      participants: { user: {} },
    },
  });

  for (const challenge of challenges as ChallengeRow[]) {
    if (challenge.status === CHALLENGE_STATUS.OPEN && now >= challenge.startTime) {
      await activateChallenge(challenge);
    } else if (
      challenge.status === CHALLENGE_STATUS.ACTIVE &&
      now >= challenge.endTime
    ) {
      await completeChallenge(challenge);
    }
  }
}

async function activateChallenge(challenge: ChallengeRow) {
  const participants = challenge.participants ?? [];

  if (participants.length === 0) {
    await adminDb.transact(
      adminDb.tx.challenges[challenge.id].update({
        status: CHALLENGE_STATUS.COMPLETED,
      }),
    );
    return;
  }

  const prices = await getPrices();
  const locked: Record<string, string> = {};
  for (const coinId of COIN_IDS) {
    locked[coinId] = priceToString(prices[coinId] ?? 0);
  }

  const txs: Parameters<typeof adminDb.transact>[0] = [];

  for (const p of participants) {
    let coinId = p.selectedCoinId;
    if (!coinId) {
      coinId = COIN_IDS[Math.floor(Math.random() * COIN_IDS.length)];
      txs.push(
        adminDb.tx.participants[p.id].update({
          selectedCoinId: coinId,
          status: PARTICIPANT_STATUS.INACTIVE,
        }),
      );
    }
    const startPrice = locked[coinId];
    txs.push(
      adminDb.tx.participants[p.id].update({
        startingPrice: startPrice,
        status: PARTICIPANT_STATUS.SELECTED,
      }),
    );
  }

  txs.push(
    adminDb.tx.challenges[challenge.id].update({
      status: CHALLENGE_STATUS.ACTIVE,
      lockedPrices: JSON.stringify(locked),
    }),
  );

  await adminDb.transact(txs);
}

async function completeChallenge(challenge: ChallengeRow) {
  const prices = await getPrices();
  const participants = challenge.participants ?? [];
  const locked = parseLockedPrices(challenge.lockedPrices);

  const coinChanges = new Map<string, string>();
  for (const coinId of COIN_IDS) {
    const start =
      locked[coinId] ??
      participants.find((p) => p.selectedCoinId === coinId)?.startingPrice ??
      priceToString(prices[coinId] ?? 0);
    const end = priceToString(prices[coinId] ?? 0);
    coinChanges.set(coinId, percentChange(start, end));
  }

  const bestCoin = pickWinningCoin(coinChanges, COIN_IDS);

  const winners = participants.filter((p) => p.selectedCoinId === bestCoin);
  const prizePool = challenge.entryAmount * participants.length;
  const payoutPerWinner =
    winners.length > 0 ? Math.floor(prizePool / winners.length) : 0;

  const txs: Parameters<typeof adminDb.transact>[0] = [];

  for (const p of participants) {
    const coinId = p.selectedCoinId ?? COIN_IDS[0];
    const endPrice = priceToString(prices[coinId] ?? 0);
    const start = p.startingPrice ?? locked[coinId] ?? endPrice;
    const pct = percentChange(start, endPrice);
    const isWinner = p.selectedCoinId === bestCoin;
    const profitLoss = isWinner
      ? payoutPerWinner - challenge.entryAmount
      : -challenge.entryAmount;

    txs.push(
      adminDb.tx.participants[p.id].update({
        endingPrice: endPrice,
        percentChange: pct,
        isWinner,
        profitLoss,
        status: isWinner ? PARTICIPANT_STATUS.WON : PARTICIPANT_STATUS.LOST,
      }),
    );

    if (isWinner && payoutPerWinner > 0) {
      const user = linkEntity(p.user);
      if (user?.id) {
        txs.push(
          adminDb.tx.profiles[user.id].update({
            walletBalance: (user.walletBalance ?? 0) + payoutPerWinner,
          }),
        );
      }
    }
  }

  txs.push(
    adminDb.tx.challenges[challenge.id].update({
      status: CHALLENGE_STATUS.COMPLETED,
      winningCoinId: bestCoin,
    }),
  );

  await adminDb.transact(txs);
}

export async function userHasActiveChallenge(userId: string): Promise<boolean> {
  const { participants } = await adminDb.query({
    participants: {
      $: { where: { "user.id": userId } },
      challenge: {},
    },
  });

  return (participants as { challenge?: { status: string } | { status: string }[] }[]).some((p) => {
    const c = p.challenge;
    const status = Array.isArray(c) ? c[0]?.status : c?.status;
    return status === CHALLENGE_STATUS.OPEN || status === CHALLENGE_STATUS.ACTIVE;
  });
}

export { id };
