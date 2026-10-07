import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "./config.ts";

export interface SessionUser {
  id: string; // Discord user id
  name: string;
  avatar: string; // full URL
}

interface Payload extends SessionUser {
  exp: number;
}

const WEEK = 7 * 24 * 60 * 60;
const mac = (data: string) => createHmac("sha256", config.sessionSecret).update(data).digest("base64url");

/** Stateless signed cookie value: base64url(json).signature */
export function sign(user: SessionUser): string {
  const body = Buffer.from(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + WEEK } satisfies Payload)).toString("base64url");
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
    return { id: p.id, name: p.name, avatar: p.avatar };
  } catch {
    return null;
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export const SESSION_MAX_AGE_MS = WEEK * 1000;
