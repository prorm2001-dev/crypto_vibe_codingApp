import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const isProd = process.env.NODE_ENV === "production";

export function authCookieOptions(maxAge: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge,
    path: "/",
  };
}
