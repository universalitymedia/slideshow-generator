# Warden Creator Tools

Dashboard of tools for making Warden creator content. First tool: the TikTok **Slideshow Generator**.

```
npm install
npm run dev
```

## Slideshow Generator

Pick who is telling the story, a topic and a slide count (6 to 8, or random), then generate. You get a hook, tips and a CTA as slides, a suggested sound, per-slide copy and image download, and "Download all images" (a zip of PNGs plus `captions.txt`).

- **Content pools:** edit `src/slideshow/content.ts` (hooks, tips, CTAs, sounds, personas, topics).
- **Photos:** drop `.jpg/.png/.webp` files into `src/assets/photos/`. They're cropped to 1080×1920 and used instead of the placeholder scenes. Text is a preview overlay only; downloaded images have none.
- **Adding a tool:** add an entry to `src/tools.ts` and a route in `src/App.tsx`.
