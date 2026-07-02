import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminDb } from "@/lib/admin";
import { signToken } from "@/lib/auth";
import { authCookieOptions } from "@/lib/cookies";
import { assertServerEnv } from "@/lib/env";
import { id } from "@/lib/challenge-engine";
import { INITIAL_WALLET_BALANCE } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    assertServerEnv();
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const { profiles: existing } = await adminDb.query({
      profiles: {
        $: {
          where: {
            or: [{ username }, { email }],
          },
        },
      },
    });

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 },
      );
    }

    const userId = id();
    const passwordHash = await bcrypt.hash(password, 10);

    await adminDb.transact(
      adminDb.tx.profiles[userId].update({
        username,
        email,
        passwordHash,
        walletBalance: INITIAL_WALLET_BALANCE,
        createdAt: Date.now(),
      }),
    );

    const token = await signToken({ userId, username, email });

    const res = NextResponse.json({
      token,
      user: { id: userId, username, email, walletBalance: INITIAL_WALLET_BALANCE },
    });
    res.cookies.set("derby_token", token, authCookieOptions(60 * 60 * 24 * 7));
    return res;
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Registration failed";
    const isEnv = message.startsWith("Missing env:");
    return NextResponse.json(
      { error: isEnv ? "Server configuration error" : "Registration failed" },
      { status: isEnv ? 503 : 500 },
    );
  }
}
