import { randomUUID } from "node:crypto";
import { ITEM_TYPES, TEXT_LOOKS, TEXT_POSITIONS, type ItemType, type SlideStyle, type StyleItem } from "../src/slideshow/styles.ts";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const bad = (msg: string): never => {
  throw new HttpError(400, msg);
};

const str = (v: unknown, field: string, max: number, required = false): string => {
  if (v === undefined || v === null) v = "";
  if (typeof v !== "string") return bad(`${field} must be text`);
  const s = v.trim();
  if (required && !s) return bad(`${field} is required`);
  if (s.length > max) return bad(`${field} is too long (max ${max} characters)`);
  return s;
};

// Only CSS filter functions the editor can produce, so a style can't smuggle arbitrary CSS into a page.
const FILTER = /^(none|(?:(?:brightness|contrast|saturate|sepia|grayscale)\(\d+(?:\.\d+)?\)\s?)+)$/;
const PHOTO_URL = /^\/uploads\/[0-9a-f-]{36}\.(png|jpg|webp)$/;
const MAX_ITEMS = 500;

function parseItem(raw: unknown, seen: Set<string>): StyleItem {
  if (!raw || typeof raw !== "object") return bad("Invalid item");
  const r = raw as Record<string, unknown>;
  const type = r.type as ItemType;
  if (!ITEM_TYPES.some((t) => t.id === type)) return bad("Unknown item type");
  let id = typeof r.id === "string" && /^[A-Za-z0-9-]{1,40}$/.test(r.id) ? r.id : randomUUID().slice(0, 8);
  if (seen.has(id)) id = randomUUID().slice(0, 8);
  seen.add(id);
  if (type === "photo") {
    if (typeof r.url !== "string" || !PHOTO_URL.test(r.url)) return bad("Invalid photo");
    return { id, type, url: r.url };
  }
  return { id, type, text: str(r.text, "Item text", 600, true) };
}

export function parseStyle(body: unknown, id: string): SlideStyle {
  if (!body || typeof body !== "object") return bad("Invalid style");
  const b = body as Record<string, unknown>;
  const text = b.text as SlideStyle["text"];
  const position = b.position as SlideStyle["position"];
  if (!TEXT_LOOKS.some((l) => l.id === text)) bad("Unknown text look");
  if (!TEXT_POSITIONS.includes(position)) bad("Unknown text position");
  const filter = str(b.filter, "Filter", 200) || "none";
  if (!FILTER.test(filter)) bad("Invalid filter");
  if (!Array.isArray(b.items)) bad("items must be a list");
  if ((b.items as unknown[]).length > MAX_ITEMS) bad(`A style can have at most ${MAX_ITEMS} items`);
  const seen = new Set<string>();
  const items = (b.items as unknown[]).map((i) => parseItem(i, seen));
  const previewItemId = typeof b.previewItemId === "string" && items.some((i) => i.id === b.previewItemId && i.type === "photo") ? b.previewItemId : undefined;
  return {
    id,
    name: str(b.name, "Name", 60, true),
    blurb: str(b.blurb, "Description", 120),
    text,
    position,
    filter,
    previewText: str(b.previewText, "Preview text", 200) || "1. Turn location off for your camera",
    previewItemId,
    items,
  };
}

const MAGIC: [string, "png" | "jpg" | "webp", (b: Buffer) => boolean][] = [
  ["image/png", "png", (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))],
  ["image/jpeg", "jpg", (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff],
  ["image/webp", "webp", (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP"],
];

/** Decide the file type from the bytes, not from what the client claims. SVG is deliberately not allowed. */
export function imageExtension(buf: Buffer): "png" | "jpg" | "webp" {
  const hit = MAGIC.find(([, , test]) => test(buf));
  if (!hit) throw new HttpError(415, "Upload a PNG, JPEG or WebP image");
  return hit[1];
}
