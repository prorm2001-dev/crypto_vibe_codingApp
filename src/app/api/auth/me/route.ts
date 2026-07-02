import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin";
import { getAuthFromRequest } from "@/lib/auth";
import { authCookieOptions } from "@/lib/cookies";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { profiles } = await adminDb.query({
    profiles: { $: { where: { id: auth.userId } } },
  });

  const profile = profiles[0] as
    | { id: string; username: string; email: string; walletBalance: number }
    | undefined;

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      walletBalance: profile.walletBalance,
    },
  });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("derby_token", "", authCookieOptions(0));
  return res;
}
