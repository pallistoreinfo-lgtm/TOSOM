import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createAdminSession,
  isSameOrigin,
  verifyPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 6;

function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const address = clientAddress(request);
  const now = Date.now();
  const current = attempts.get(address);
  if (current && current.resetAt > now && current.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as { password?: string };
    if (!body.password || !verifyPassword(body.password)) {
      attempts.set(address, {
        count: current && current.resetAt > now ? current.count + 1 : 1,
        resetAt: current && current.resetAt > now ? current.resetAt : now + WINDOW_MS,
      });
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    attempts.delete(address);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
