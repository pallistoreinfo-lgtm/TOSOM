import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "tosom_admin_session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 8;

type Session = { exp: number; role: "admin" };

function sessionSecret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters.");
  }
  return value;
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function createAdminSession() {
  const payload: Session = {
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyAdminSession(token?: string | null) {
  if (!token) return false;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;

  const expected = sign(encoded);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Session;
    return payload.role === "admin" && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export async function isAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

export function verifyPassword(password: string) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || configured.length < 12) {
    throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
  }
  const salt = sessionSecret().slice(0, 32);
  const providedHash = scryptSync(password, salt, 64);
  const configuredHash = scryptSync(configured, salt, 64);
  return timingSafeEqual(providedHash, configuredHash);
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}
