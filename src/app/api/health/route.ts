import { NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { getServerEnv } from "@/lib/env";
import { getPrices } from "@/lib/coingecko";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = getServerEnv();
  const checks: Record<string, string> = {};

  try {
    await adminDb.query({ profiles: { $: { limit: 1 } } });
    checks.instantDb = "ok";
  } catch (e) {
    checks.instantDb = e instanceof Error ? e.message : "error";
  }

  try {
    await getPrices();
    checks.coingecko = "ok";
  } catch (e) {
    checks.coingecko = e instanceof Error ? e.message : "error";
  }

  const ok =
    env.missing.length === 0 &&
    checks.instantDb === "ok" &&
    checks.coingecko === "ok";

  return NextResponse.json({
    ok,
    env: {
      configured: env.missing.length === 0,
      missing: env.missing,
      instantAppIdSet: !!env.instantAppId,
      note:
        env.missing.length > 0
          ? "Add missing vars in Vercel → Settings → Environment Variables, then redeploy."
          : undefined,
    },
    checks,
  });
}
