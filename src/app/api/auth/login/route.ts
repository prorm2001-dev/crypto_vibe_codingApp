import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminDb } from "@/lib/admin";
import { signToken } from "@/lib/auth";
import { authCookieOptions } from "@/lib/cookies";
import { assertServerEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    assertServerEnv();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const { profiles } = await adminDb.query({
      profiles: { $: { where: { email } } },
    });

    const profile = profiles[0] as
      | {
          id: string;
          username: string;
          email: string;
          passwordHash: string;
          walletBalance: number;
        }
      | undefined;

    if (!profile) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, profile.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({
      userId: profile.id,
      username: profile.username,
      email: profile.email,
    });

    const res = NextResponse.json({
      token,
      user: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        walletBalance: profile.walletBalance,
      },
    });
    res.cookies.set("derby_token", token, authCookieOptions(60 * 60 * 24 * 7));
    return res;
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Login failed";
    const isEnv = message.startsWith("Missing env:");
    return NextResponse.json(
      { error: isEnv ? "Server configuration error" : "Login failed" },
      { status: isEnv ? 503 : 500 },
    );
  }
}
