# Universality Tools

Dashboard of tools for making creator content. First tool: the TikTok **Liftly Slideshow Generator**.

```
npm install
cp .env.example .env.local   # fill in the Discord values, see below
npm run dev                  # app on http://localhost:5173, API on :8787
```

Production: `npm run build` (type checks, builds the app into `dist/` and compiles the server into `dist-server/`), then `npm start` (plain `node`, with `NODE_ENV=production`; `SESSION_SECRET` and `PUBLIC_URL` must be set). The Node server serves the built app, the API and uploaded pictures.

`npm test` runs the tests and `npm run typecheck` the type checks. CI (`.github/workflows/ci.yml`) runs the tests and the build on every pull request.

## Login (Discord)

Creators sign in with Discord. There is no third-party auth service: the Node server in `server/` does the OAuth code exchange and issues a signed, HTTP-only session cookie.

1. Create an app at <https://discord.com/developers/applications>.
2. OAuth2 > Redirects: add `{PUBLIC_URL}/auth/discord/callback` (dev: `http://localhost:5173/auth/discord/callback`).
3. Put the client id and secret in `.env.local` (see `.env.example`). The secret stays on the server.
4. Set `ADMIN_DISCORD_IDS` to the Discord user ids of your admins.
5. Decide who may sign in. Admins always can. Add `DISCORD_GUILD_ID` (members of that server) and/or `ALLOWED_DISCORD_IDS` (a list) to let creators in. With neither set, **only admins can sign in**. `ALLOW_ANY_DISCORD=true` opens it to every Discord account, and is off unless you set it.
6. Removing someone: take them off `ALLOWED_DISCORD_IDS` or `ADMIN_DISCORD_IDS` (or add them to `DENIED_DISCORD_IDS`) and restart. Their session ends on their next request. Sessions of people let in through the server last 12 hours (Discord membership can't be re-checked in between, and signing in again is a single click), others 7 days.

Uploaded pictures are only served to signed-in users.

For trying the UI without Discord, set `DEV_LOGIN=true`: the login page gets "Dev creator" and "Dev admin" buttons. It is ignored when `NODE_ENV=production`.

## Admin dashboard

Admins get an **Admin > Styles** page in the sidebar. A style is made of:

- **Basics:** a name and description.
- **Preview pictures:** uploaded pictures shown on the style's card in the generator. The starred one is the main picture.
- **Format:** the order of the slideshow, for example `Slide 1, Slide 2, Slide 3, CTA, Slide 4, Slide 5`. Add slides and CTAs, drag them into any order and remove them.
- **Shared Captions and Music:** under **Admin > Styles** in the sidebar there are **Captions** and **Music** pages. They hold the library every style uses unless it has its own. The built-in captions and sounds are copied there the first time, so you can edit or remove them. A style that has its own captions or music (below) uses those instead.
- **Captions:** the title and description (hashtags included) creators paste into TikTok. Creators get one at random and can shuffle.
- **Music:** sounds with an optional link to the exact sound. Without a link, creators get a TikTok search.
- **Slides:** for each position in the format, upload pictures and write the text creators copy for each one. Generating picks one picture per position at random.

A position with no uploaded pictures falls back to a built-in picture and built-in text, and a style with no captions or sounds uses built-in ones, so a new style still produces a full slideshow.

Creators see each picture with its text and a **Copy text** button, can download every picture as uploaded, and get a caption and a sound.

Styles and uploads are stored in `./data` (`DATA_DIR`): `db.json` plus `uploads/`. Back that folder up and keep it on a persistent disk. Run a single server process: `db.json` is not locked across processes.

Every style and the shared library carry a revision. If two admins edit the same thing, the second save is refused with a message to reload, instead of overwriting the first. Uploads nobody has saved into a style are cleaned up after 7 days, and a save that points at a picture that is gone is refused with a clear message.

## Liftly Slideshow Generator

Pick a style and generate. You get one slide per position in the style's format, each with a picture and the text to copy, a suggested sound, and a TikTok caption. Every picture can be copied or downloaded on its own, and "Download all images" gives a zip with the pictures as uploaded (PNG, JPEG or WebP, plus PNGs for the built-in scenes), `captions.txt` (the TikTok title and description) and `slide-text.txt` (the text for each picture).

- **Built-in content:** `src/slideshow/content.ts` (hooks, tips, CTAs, captions, sounds, personas, topics). Used for positions a style has no pictures for, and for captions. If a format has more tip positions than there are tips, the tips start over.
- **Photos:** drop `.jpg/.png/.webp` files into `src/assets/photos/`. They're cropped to 1080×1920 and used instead of the placeholder scenes. Text is a preview overlay only; downloaded images have none.
- **Adding a tool:** add an entry to `src/tools.ts` and a route in `src/App.tsx`.
