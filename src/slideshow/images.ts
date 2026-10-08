import type { Rand } from "./rng";
import { mulberry32, shuffle } from "./rng";

export const SLIDE_W = 1080;
export const SLIDE_H = 1920;

export type ImageSource =
  | { kind: "photo"; url: string; name: string }
  | { kind: "scene"; seed: number; name: string };

// Drop real photos into src/assets/photos and they replace the placeholder scenes.
const photos = import.meta.glob<string>("/src/assets/photos/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});

const photoSources: ImageSource[] = Object.entries(photos).map(([path, url]) => ({
  kind: "photo",
  url,
  name: path.split("/").pop()!,
}));

const SCENE_NAMES = ["Golden hour", "Café window", "Night street", "Elevator", "Park", "Kitchen", "Rooftop", "Train"];
const sceneSources: ImageSource[] = SCENE_NAMES.map((name, i) => ({ kind: "scene", seed: 1000 + i * 77, name }));

export const usingRealPhotos = photoSources.length > 0;

/** Distinct images for one slideshow. Repeats only if the pool is smaller than the slideshow. */
/** Built-in pictures for positions a style has no uploads for: folder photos if any, else placeholder scenes. */
export function imagePool(rand: Rand, count: number): ImageSource[] {
  const pool = usingRealPhotos ? photoSources : sceneSources;
  const shuffled = shuffle(rand, pool);
  return Array.from({ length: count }, (_, i) => shuffled[i % shuffled.length]);
}

function hsl(h: number, s: number, l: number, a = 1) {
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}% / ${a})`;
}

function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const r = mulberry32(seed);
  const hue = r() * 360;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, hsl(hue, 45, 28));
  sky.addColorStop(0.55, hsl(hue + 30, 55, 52));
  sky.addColorStop(1, hsl(hue + 60, 40, 22));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * (0.2 + r() * 0.6), h * (0.15 + r() * 0.3), 0, w * 0.5, h * 0.3, w * 0.9);
  glow.addColorStop(0, hsl(hue + 20, 90, 80, 0.8));
  glow.addColorStop(1, hsl(hue + 20, 90, 80, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Soft skyline of rounded blocks with lit windows.
  const base = h * 0.78;
  let x = -w * 0.05;
  while (x < w) {
    const bw = w * (0.1 + r() * 0.14);
    const bh = h * (0.12 + r() * 0.3);
    ctx.fillStyle = hsl(hue + 40, 30, 12 + r() * 10);
    ctx.beginPath();
    ctx.roundRect(x, base - bh, bw, bh + h, w * 0.012);
    ctx.fill();
    ctx.fillStyle = hsl(45, 90, 70, 0.6);
    for (let wy = base - bh + h * 0.02; wy < base - h * 0.02; wy += h * 0.035) {
      for (let wx = x + bw * 0.12; wx < x + bw * 0.85; wx += w * 0.035) {
        if (r() > 0.6) ctx.fillRect(wx, wy, w * 0.018, h * 0.016);
      }
    }
    x += bw + w * 0.01;
  }

  const ground = ctx.createLinearGradient(0, base, 0, h);
  ground.addColorStop(0, hsl(hue + 50, 25, 18));
  ground.addColorStop(1, hsl(hue + 50, 30, 8));
  ctx.fillStyle = ground;
  ctx.fillRect(0, base, w, h - base);
}

/** Paint a source onto a canvas of the given size, cropping photos to cover. */
export async function paint(source: ImageSource, w: number, h: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  if (source.kind === "scene") {
    drawScene(ctx, w, h, source.seed);
    return canvas;
  }
  const img = new Image();
  img.src = source.url;
  await img.decode();
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  return canvas;
}

const previewCache = new Map<string, string>();

/** A small URL the preview card can use as a background. Photos are used directly. */
export function previewUrl(source: ImageSource): string {
  if (source.kind === "photo") return source.url;
  const key = String(source.seed);
  let url = previewCache.get(key);
  if (!url) {
    const c = document.createElement("canvas");
    c.width = 270;
    c.height = 480;
    drawScene(c.getContext("2d")!, 270, 480, source.seed);
    url = c.toDataURL("image/jpeg", 0.85);
    previewCache.set(key, url);
  }
  return url;
}

async function renderBlob(source: ImageSource): Promise<Blob> {
  const canvas = await paint(source, SLIDE_W, SLIDE_H);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode image"))), "image/png"),
  );
}

/** The file to download for a slide: an uploaded picture is sent as uploaded, a placeholder scene is rendered as a PNG. */
export async function imageFile(source: ImageSource): Promise<{ blob: Blob; ext: string }> {
  if (source.kind === "scene") return { blob: await renderBlob(source), ext: "png" };
  const res = await fetch(source.url);
  if (!res.ok) throw new Error("Could not load the picture");
  return { blob: await res.blob(), ext: source.url.split(".").pop()!.split("?")[0] || "png" };
}
