# Universality Tool's

Dashboard of tools for making creator content. First tool: the TikTok **Liftly Slideshow Generator**.

```
npm install
cp .env.example .env.local   # then add your Clerk publishable key
npm run dev
```

## Login (Clerk)

Creators sign in with Clerk before they can see any tool. Set `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local` (Clerk dashboard > API keys). Without it the app shows a setup screen. Clerk app id: `app_3KN1wjZtile0XJn7L5Wa0KRPze9`. Sign-in methods, sign-ups and invitations are configured in the Clerk dashboard. Never put the secret key in this app.

## Liftly Slideshow Generator

Pick who is telling the story, a topic and a slide count (6 to 8, or random), then generate. You get a hook, tips and a CTA as slides, a suggested sound, per-slide copy and image download, and "Download all images" (a zip of PNGs plus `captions.txt`).

- **Content pools:** edit `src/slideshow/content.ts` (hooks, tips, CTAs, sounds, personas, topics).
- **Photos:** drop `.jpg/.png/.webp` files into `src/assets/photos/`. They're cropped to 1080×1920 and used instead of the placeholder scenes. Text is a preview overlay only; downloaded images have none.
- **Adding a tool:** add an entry to `src/tools.ts` and a route in `src/App.tsx`.
