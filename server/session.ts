import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "./config.ts";

/** Why this person was let in. Decides how long the session lasts and how it is re-checked. */
export type SessionVia = "admin" | "list" | "guild" | "open" | "dev";

export interface SessionUser {
  id: string; // Discord user id
  name: string;
  avatar: string; // full URL
  via: SessionVia;
}

interface Payload extends SessionUser {
  exp: number;
}

const HOUR = 60 * 60;
const WEEK = 7 * 24 * HOUR;
/** Server membership can't be re-checked without the user, so those sessions are short and renew by a quick silent login. */
const LIFETIME: Record<SessionVia, number> = { admin: WEEK, list: WEEK, open: WEEK, dev: WEEK, guild: 12 * HOUR };
export const sessionMaxAgeMs = (via: SessionVia) => LIFETIME[via] * 1000;
const mac = (data: string) => createHmac("sha256", config.sessionSecret).update(data).digest("base64url");

/** Stateless signed cookie value: base64url(json).signature */
export function sign(user: SessionUser): string {
  const body = Buffer.from(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + LIFETIME[user.via] } satisfies Payload)).toString("base64url");
  return `${body}.${mac(body)}`;
}

export function verify(value: string | undefined): SessionUser | null {
  if (!value) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(mac(body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (p.exp < Date.now() / 1000) return null;
    return { id: p.id, name: p.name, avatar: p.avatar, via: p.via in LIFETIME ? p.via : "guild" };
  } catch {
    return null;
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i <= 0) continue;
    const raw = part.slice(i + 1).trim();
    try {
      out[part.slice(0, i).trim()] = decodeURIComponent(raw);
    } catch {
      // A malformed cookie value is ignored instead of failing the request.
    }
  }
  return out;
}
