import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";
import { newStyleDefaults } from "../src/slideshow/styles.ts";
import { config, discordConfigured, redirectUri } from "./config.ts";
import { createStyle, getLibrary, getStyle, listStyles, newId, removeStyle, saveLibrary, saveStyle, uploadsDir } from "./db.ts";
import { HttpError, imageExtension, parseLibrary, parseStyle } from "./validate.ts";
import { directAccess, sameSiteRequest, stillAllowed, type Policy } from "./access.ts";
import { parseCookies, sessionMaxAgeMs, sign, verify, type SessionUser } from "./session.ts";

const app = express();
app.disable("x-powered-by");
const secure = config.publicUrl.startsWith("https://");

const isAdmin = (u: SessionUser) => config.adminIds.includes(u.id);
const policy: Policy = { ...config, guildId: config.discord.guildId };

function setCookie(res: Response, name: string, value: string, maxAgeMs: number) {
  res.append("Set-Cookie", `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(maxAgeMs / 1000)}${secure ? "; Secure" : ""}`);
}

// Reject any state-changing request that can't be shown to come from our own site.
const ownOrigin = new URL(config.publicUrl).origin;
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (!sameSiteRequest({ origin: req.headers.origin, "sec-fetch-site": req.headers["sec-fetch-site"] as string | undefined }, ownOrigin)) {
    return void res.status(403).json({ error: "Cross-site request blocked" });
  }
  next();
});

app.use((req, res, next) => {
  const user = verify(parseCookies(req.headers.cookie).session);
  // A session for someone who has since lost access is dropped right away, not left to run out.
  if (user && !stillAllowed(user, policy)) {
    setCookie(res, "session", "", 0);
    res.locals.user = null;
  } else {
    res.locals.user = user;
  }
  next();
});

const requireUser = (_req: Request, res: Response, next: NextFunction) =>
  res.locals.user ? next() : void res.status(401).json({ error: "Sign in first" });
const requireAdmin = (_req: Request, res: Response, next: NextFunction) =>
  res.locals.user && isAdmin(res.locals.user) ? next() : void res.status(res.locals.user ? 403 : 401).json({ error: "Admins only" });

// ---------- Auth ----------

app.get("/api/config", (_req, res) => {
  res.json({ discord: discordConfigured, devLogin: config.devLogin });
});

app.get("/api/me", (_req, res) => {
  const u = res.locals.user as SessionUser | null;
  res.json({ user: u ? { id: u.id, name: u.name, avatar: u.avatar, isAdmin: isAdmin(u) } : null });
});

app.get("/auth/discord", (_req, res) => {
  if (!discordConfigured) return void res.redirect("/?login_error=not_configured");
  const state = randomBytes(16).toString("hex");
  setCookie(res, "oauth_state", state, 10 * 60 * 1000);
  const q = new URLSearchParams({
    client_id: config.discord.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.discord.guildId ? "identify guilds" : "identify",
    state,
    // No prompt parameter: Discord shows the consent screen the first time and skips it once the app is authorized.
  });
  res.redirect(`https://discord.com/oauth2/authorize?${q}`);
});

app.get("/auth/discord/callback", async (req, res) => {
  const fail = (code: string) => {
    setCookie(res, "oauth_state", "", 0);
    res.redirect(`/?login_error=${code}`);
  };
  const { code, state, error } = req.query as Record<string, string | undefined>;
  const expected = parseCookies(req.headers.cookie).oauth_state;
  if (error) return fail(error === "access_denied" ? "denied" : "failed");
  if (!code || !state || !expected || state !== expected) return fail("state");

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.discord.clientId,
        client_secret: config.discord.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });
    if (!tokenRes.ok) return fail("token");
    const { access_token } = (await tokenRes.json()) as { access_token: string };
    const auth = { authorization: `Bearer ${access_token}` };

    const me = (await (await fetch("https://discord.com/api/users/@me", { headers: auth })).json()) as {
      id: string; username: string; global_name?: string | null; avatar?: string | null; discriminator?: string;
    };
    if (!me.id) return fail("profile");

    const base = {
      id: me.id,
      name: me.global_name || me.username,
      avatar: me.avatar
        ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=64`
        : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(me.id) >> 22n) % 6n)}.png`,
    };

    let via = directAccess(me.id, policy);
    if (!via && config.discord.guildId && !config.deniedIds.includes(me.id)) {
      const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", { headers: auth });
      const guilds = guildsRes.ok ? ((await guildsRes.json()) as { id: string }[]) : [];
      if (Array.isArray(guilds) && guilds.some((g) => g.id === config.discord.guildId)) via = "guild";
    }
    if (!via) return fail("not_allowed");
    const user: SessionUser = { ...base, via };

    setCookie(res, "oauth_state", "", 0);
    setCookie(res, "session", sign(user), sessionMaxAgeMs(via));
    res.redirect("/");
  } catch (e) {
    console.error("Discord login failed", e);
    fail("failed");
  }
});

// Local testing only: signs in as a fake user. Disabled in production and unless DEV_LOGIN=true.
if (config.devLogin) {
  app.get("/auth/dev", (req, res) => {
    const admin = req.query.admin === "1";
    const id = admin ? (config.adminIds[0] ?? "0") : "1";
    setCookie(res, "session", sign({ id, name: admin ? "Dev Admin" : "Dev Creator", avatar: "", via: "dev" }), sessionMaxAgeMs("dev"));
    res.redirect("/");
  });
}

app.post("/auth/logout", (_req, res) => {
  setCookie(res, "session", "", 0);
  res.json({ ok: true });
});

// ---------- Styles ----------

app.get("/api/styles", requireUser, (_req, res) => {
  res.json({ styles: listStyles() });
});

app.get("/api/library", requireUser, (_req, res) => {
  res.json({ library: getLibrary() });
});

app.put("/api/admin/library", requireAdmin, express.json({ limit: "1mb" }), (req, res) => {
  const library = saveLibrary(parseLibrary(req.body), req.body?.rev);
  res.json({ library });
});

app.post("/api/admin/styles", requireAdmin, express.json({ limit: "1mb" }), (req, res) => {
  const style = createStyle(parseStyle({ ...newStyleDefaults(), ...(req.body ?? {}) }, newId()));
  res.status(201).json({ style });
});

app.put("/api/admin/styles/:id", requireAdmin, express.json({ limit: "1mb" }), (req, res) => {
  const id = String(req.params.id);
  if (!getStyle(id)) throw new HttpError(404, "Style not found");
  const style = saveStyle(parseStyle(req.body, id), req.body?.rev);
  res.json({ style });
});

app.delete("/api/admin/styles/:id", requireAdmin, (req, res) => {
  if (listStyles().length <= 1) throw new HttpError(400, "Keep at least one style");
  if (!removeStyle(String(req.params.id))) throw new HttpError(404, "Style not found");
  res.json({ ok: true });
});

// Raw image bytes in the request body. A non-form content type forces a CORS preflight, so other sites can't post here.
app.post("/api/admin/uploads", requireAdmin, express.raw({ type: () => true, limit: "8mb" }), (req, res) => {
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) throw new HttpError(400, "Empty upload");
  const ext = imageExtension(req.body);
  const name = `${randomUUID()}.${ext}`;
  writeFileSync(join(uploadsDir, name), req.body);
  res.status(201).json({ url: `/uploads/${name}` });
});

// Pictures are for signed-in creators only. File names are random, but a link must not work for outsiders.
app.use(
  "/uploads",
  requireUser,
  express.static(uploadsDir, {
    index: false,
    cacheControl: false,
    setHeaders: (r) => {
      r.setHeader("Cache-Control", "private, max-age=604800, immutable");
      r.setHeader("X-Content-Type-Options", "nosniff");
    },
  }),
);

// ---------- Built app (production) ----------

const dist = resolve("dist");
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get("/", (_req, res) => res.sendFile(join(dist, "index.html")));
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) return void res.status(err.status).json({ error: err.message });
  const status = (err as { status?: number }).status;
  if (status === 413) return void res.status(413).json({ error: "File is too large (max 8 MB)" });
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(config.port, () => {
  console.log(`Server on http://localhost:${config.port} (app URL ${config.publicUrl})`);
  if (!discordConfigured) console.warn("Discord login is not configured: set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET.");
  if (!config.adminIds.length) console.warn("No admins: set ADMIN_DISCORD_IDS to a comma separated list of Discord user ids.");
  if (config.allowAnyone) console.warn("ALLOW_ANY_DISCORD is on: anyone with a Discord account can sign in.");
  else if (!config.allowedIds.length && !config.discord.guildId) console.warn("Only admins can sign in. Set DISCORD_GUILD_ID or ALLOWED_DISCORD_IDS to let creators in.");
});
