import type { SessionUser, SessionVia } from "./session.ts";

export interface Policy {
  adminIds: string[];
  allowedIds: string[];
  deniedIds: string[];
  guildId: string;
  allowAnyone: boolean;
  devLogin: boolean;
}

/** Anything that doesn't depend on Discord's servers. Null means "check guild membership next, if configured". */
export function directAccess(id: string, p: Policy): SessionVia | null {
  if (p.deniedIds.includes(id)) return null;
  if (p.adminIds.includes(id)) return "admin";
  if (p.allowedIds.includes(id)) return "list";
  if (p.allowAnyone) return "open";
  return null;
}

/**
 * Checked on every request, so taking someone off the lists (or adding them to DENIED_DISCORD_IDS) ends their
 * session on the next click. Guild sessions can't be re-checked here, so they simply expire after 12 hours.
 */
export function stillAllowed(u: SessionUser, p: Policy): boolean {
  if (p.deniedIds.includes(u.id)) return false;
  switch (u.via) {
    case "admin": return p.adminIds.includes(u.id);
    case "list": return p.allowedIds.includes(u.id) || p.adminIds.includes(u.id);
    case "open": return p.allowAnyone;
    case "guild": return Boolean(p.guildId);
    case "dev": return p.devLogin;
  }
}

/**
 * Browsers send Origin on cross-site POSTs. Anything that changes state must come from our own site: a matching
 * Origin, or, when the browser sends none, Sec-Fetch-Site saying same-origin. No signal at all is rejected.
 */
export function sameSiteRequest(headers: { origin?: string; "sec-fetch-site"?: string }, ownOrigin: string): boolean {
  if (headers.origin) return headers.origin === ownOrigin;
  const site = headers["sec-fetch-site"];
  return site === "same-origin";
}
