import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    profiles: i.entity({
      username: i.string().unique().indexed(),
      email: i.string().unique().indexed(),
      passwordHash: i.string(),
      walletBalance: i.number().indexed(),
      createdAt: i.number().indexed(),
    }),
    challenges: i.entity({
      status: i.string().indexed(),
      startTime: i.number().indexed(),
      endTime: i.number().indexed(),
      entryAmount: i.number(),
      winningCoinId: i.string().optional(),
      lockedPrices: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
    participants: i.entity({
      selectedCoinId: i.string().optional(),
      startingPrice: i.string().optional(),
      endingPrice: i.string().optional(),
      percentChange: i.string().optional(),
      isWinner: i.boolean().optional(),
      profitLoss: i.number().optional(),
      status: i.string().indexed(),
      joinedAt: i.number().indexed(),
    }),
  },
  links: {
    challengeCreator: {
      forward: { on: "challenges", has: "one", label: "creator" },
      reverse: { on: "profiles", has: "many", label: "createdChallenges" },
    },
    challengeParticipants: {
      forward: { on: "challenges", has: "many", label: "participants" },
      reverse: { on: "participants", has: "one", label: "challenge" },
    },
    participantProfile: {
      forward: { on: "participants", has: "one", label: "user" },
      reverse: { on: "profiles", has: "many", label: "participations" },
    },
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
  },
  rooms: {},
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
