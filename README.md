# Universality Tool's

Dashboard of tools for making creator content. First tool: the TikTok **Liftly Slideshow Generator**.

```
npm install
cp .env.example .env.local   # fill in the Discord values, see below
npm run dev                  # app on http://localhost:5173, API on :8787
```

Production: `npm run build`, then `npm start` (the script sets `NODE_ENV=production`; `SESSION_SECRET` and `PUBLIC_URL` must be set). The Node server serves the built app, the API and uploaded photos.

## Login (Discord)

Creators sign in with Discord. There is no third-party auth service: the Node server in `server/` does the OAuth code exchange and issues a signed, HTTP-only session cookie (7 days).

1. Create an app at <https://discord.com/developers/applications>.
2. OAuth2 > Redirects: add `{PUBLIC_URL}/auth/discord/callback` (dev: `http://localhost:5173/auth/discord/callback`).
3. Put the client id and secret in `.env.local` (see `.env.example`). The secret stays on the server.
4. Set `ADMIN_DISCORD_IDS` to the Discord user ids of your admins.
5. Decide who may sign in. With `DISCORD_GUILD_ID` and/or `ALLOWED_DISCORD_IDS` set, only admins, members of that server and listed ids can. With neither set, **any Discord account can sign in**.

For trying the UI without Discord, set `DEV_LOGIN=true`: the login page gets "Dev creator" and "Dev admin" buttons. It is ignored when `NODE_ENV=production`.

## Admin dashboard

Admins get an **Admin > Styles** page in the sidebar. A style is made of:

- **Basics:** a name and description.
- **Preview pictures:** uploaded pictures shown on the style's card in the generator. The starred one is the main picture.
- **Format:** the order of the slideshow, for example `Slide 1, Slide 2, Slide 3, CTA, Slide 4, Slide 5`. Add slides and CTAs, drag them into any order and remove them.
- **Captions:** the title and description (hashtags included) creators paste into TikTok. Creators get one at random and can shuffle.
- **Music:** sounds with an optional link to the exact sound. Without a link, creators get a TikTok search.
- **Slides:** for each position in the format, upload pictures and write the text creators copy for each one. Generating picks one picture per position at random.

A position with no uploaded pictures falls back to a built-in picture and built-in text, and a style with no captions or sounds uses built-in ones, so a new style still produces a full slideshow.

Creators see each picture with its text and a **Copy text** button, can download every picture as uploaded, and get a caption and a sound.

Styles and uploads are stored in `./data` (`DATA_DIR`): `db.json` plus `uploads/`. Back that folder up and keep it on a persistent disk.

## Liftly Slideshow Generator

Pick who is telling the story, a topic and a slide count (6 to 8, or random), then generate. You get a hook, tips and a CTA as slides, a suggested sound, per-slide copy and image download, and "Download all images" (a zip of PNGs plus `captions.txt`).

- **Built-in content:** `src/slideshow/content.ts` (hooks, tips, CTAs, captions, sounds, personas, topics). Used for positions a style has no pictures for, and for captions.
- **Photos:** drop `.jpg/.png/.webp` files into `src/assets/photos/`. They're cropped to 1080×1920 and used instead of the placeholder scenes. Text is a preview overlay only; downloaded images have none.
- **Adding a tool:** add an entry to `src/tools.ts` and a route in `src/App.tsx`.
