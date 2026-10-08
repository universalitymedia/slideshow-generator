import { describe, expect, it } from "vitest";

process.env.SESSION_SECRET = "test-secret";
const { parseCookies, sessionMaxAgeMs, sign, verify } = await import("../server/session.ts");

describe("session cookie", () => {
  const user = { id: "42", name: "Ada", avatar: "", via: "list" as const };

  it("round-trips a signed session", () => {
    expect(verify(sign(user))).toEqual(user);
  });
  it("rejects a tampered session", () => {
    const [body, sig] = sign(user).split(".");
    const forged = Buffer.from(JSON.stringify({ ...user, id: "1", exp: 9999999999 })).toString("base64url");
    expect(verify(`${forged}.${sig}`)).toBeNull();
    expect(verify(`${body}.AAAA`)).toBeNull();
    expect(verify(undefined)).toBeNull();
  });
  it("keeps server-member sessions shorter than listed ones", () => {
    expect(sessionMaxAgeMs("guild")).toBeLessThan(sessionMaxAgeMs("list"));
  });
  it("ignores malformed cookie values instead of throwing", () => {
    expect(parseCookies("a=%E0%A4%A; b=ok")).toEqual({ b: "ok" });
  });
});
