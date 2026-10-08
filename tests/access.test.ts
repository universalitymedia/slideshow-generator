import { describe, expect, it } from "vitest";
import { directAccess, sameSiteRequest, stillAllowed, type Policy } from "../server/access.ts";
import type { SessionUser } from "../server/session.ts";

const policy = (over: Partial<Policy> = {}): Policy => ({ adminIds: ["1"], allowedIds: ["2"], deniedIds: [], guildId: "", allowAnyone: false, devLogin: false, ...over });
const user = (id: string, via: SessionUser["via"]): SessionUser => ({ id, name: "x", avatar: "", via });

describe("directAccess", () => {
  it("lets admins and listed ids in, and nobody else by default", () => {
    expect(directAccess("1", policy())).toBe("admin");
    expect(directAccess("2", policy())).toBe("list");
    expect(directAccess("3", policy())).toBeNull();
  });
  it("only lets anyone in when explicitly allowed", () => {
    expect(directAccess("3", policy({ allowAnyone: true }))).toBe("open");
  });
  it("refuses denied ids even if they are admins", () => {
    expect(directAccess("1", policy({ deniedIds: ["1"] }))).toBeNull();
  });
});

describe("stillAllowed", () => {
  it("ends a session once the person leaves the allowlist", () => {
    expect(stillAllowed(user("2", "list"), policy())).toBe(true);
    expect(stillAllowed(user("2", "list"), policy({ allowedIds: [] }))).toBe(false);
  });
  it("ends a session for denied ids whatever the reason they got in", () => {
    for (const via of ["admin", "list", "open", "guild"] as const) {
      expect(stillAllowed(user("1", via), policy({ deniedIds: ["1"], allowAnyone: true, guildId: "g", allowedIds: ["1"] }))).toBe(false);
    }
  });
  it("ends open sessions when open sign-in is turned off", () => {
    expect(stillAllowed(user("9", "open"), policy())).toBe(false);
  });
  it("ends guild sessions when the server restriction is removed", () => {
    expect(stillAllowed(user("9", "guild"), policy({ guildId: "g" }))).toBe(true);
    expect(stillAllowed(user("9", "guild"), policy())).toBe(false);
  });
  it("ignores dev sessions unless dev login is on", () => {
    expect(stillAllowed(user("1", "dev"), policy())).toBe(false);
    expect(stillAllowed(user("1", "dev"), policy({ devLogin: true }))).toBe(true);
  });
});

describe("sameSiteRequest", () => {
  const own = "https://tools.example.com";
  it("accepts a matching Origin and rejects another one", () => {
    expect(sameSiteRequest({ origin: own }, own)).toBe(true);
    expect(sameSiteRequest({ origin: "https://evil.example" }, own)).toBe(false);
  });
  it("rejects a request that carries no Origin and no same-origin signal", () => {
    expect(sameSiteRequest({}, own)).toBe(false);
    expect(sameSiteRequest({ "sec-fetch-site": "cross-site" }, own)).toBe(false);
    expect(sameSiteRequest({ "sec-fetch-site": "none" }, own)).toBe(false);
  });
  it("accepts a missing Origin when the browser says same-origin", () => {
    expect(sameSiteRequest({ "sec-fetch-site": "same-origin" }, own)).toBe(true);
  });
});
