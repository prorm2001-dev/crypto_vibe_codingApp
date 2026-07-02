import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminDb } from "@/lib/admin";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
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
    res.cookies.set("derby_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
