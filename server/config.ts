import { randomBytes } from "node:crypto";

// .env.local wins over .env. Real environment variables win over both.
for (const f of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(f);
  } catch {}
}

const list = (v?: string) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const production = process.env.NODE_ENV === "production";
// The hosting platform expects the app on 3000. Locally, 8787 keeps clear of other dev servers.
const port = Number(process.env.PORT ?? (production ? 3000 : 8787));

let sessionSecret = process.env.SESSION_SECRET ?? "";
if (!sessionSecret) {
  if (production) throw new Error("SESSION_SECRET is required in production");
  sessionSecret = randomBytes(32).toString("hex");
  console.warn("SESSION_SECRET is not set. Using a random one, so logins reset when the server restarts.");
}

export const config = {
  production,
  port,
  // Where the browser reaches the app. In dev that's the Vite server, which proxies /api and /auth here.
  publicUrl: (process.env.PUBLIC_URL ?? (production ? `http://localhost:${port}` : "http://localhost:5173")).replace(/\/$/, ""),
  sessionSecret,
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID ?? "",
    clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    guildId: process.env.DISCORD_GUILD_ID ?? "",
  },
  adminIds: list(process.env.ADMIN_DISCORD_IDS),
  allowedIds: list(process.env.ALLOWED_DISCORD_IDS),
  // Removed from the allowlist (or the server) but still holding a session? List them here for an instant kick.
  deniedIds: list(process.env.DENIED_DISCORD_IDS),
  // Opt-in only. Without it, nobody but admins, listed ids and guild members can sign in.
  allowAnyone: process.env.ALLOW_ANY_DISCORD === "true",
  // Skips Discord so the UI can be tried locally. Never honoured in production.
  devLogin: !production && process.env.DEV_LOGIN === "true",
  dataDir: process.env.DATA_DIR ?? "data",
};

export const discordConfigured = Boolean(config.discord.clientId && config.discord.clientSecret);
export const redirectUri = `${config.publicUrl}/auth/discord/callback`;
