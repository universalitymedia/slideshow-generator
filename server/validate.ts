import { randomUUID } from "node:crypto";
import { MAX_PICTURES_PER_SLOT, MAX_PREVIEWS, MAX_SLOTS, type FormatSlot, type SlideStyle, type StyleSlide } from "../src/slideshow/styles.ts";

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

const UPLOAD_URL = /^\/uploads\/[0-9a-f-]{36}\.(png|jpg|webp)$/;
const ID = /^[A-Za-z0-9-]{1,40}$/;

const upload = (v: unknown): string => (typeof v === "string" && UPLOAD_URL.test(v) ? v : bad("Invalid picture"));

function uniqueId(raw: unknown, seen: Set<string>): string {
  let id = typeof raw === "string" && ID.test(raw) ? raw : randomUUID().slice(0, 8);
  if (seen.has(id)) id = randomUUID().slice(0, 8);
  seen.add(id);
  return id;
}

function parseFormat(raw: unknown): FormatSlot[] {
  if (!Array.isArray(raw) || raw.length === 0) return bad("The format needs at least one slide");
  if (raw.length > MAX_SLOTS) return bad(`The format can have at most ${MAX_SLOTS} positions`);
  const seen = new Set<string>();
  return raw.map((r) => {
    const o = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
    if (o.kind !== "slide" && o.kind !== "cta") bad("Unknown format position");
    return { id: uniqueId(o.id, seen), kind: o.kind as FormatSlot["kind"] };
  });
}

function parseSlides(raw: unknown, format: FormatSlot[]): StyleSlide[] {
  if (!Array.isArray(raw)) return bad("slides must be a list");
  const slotIds = new Set(format.map((f) => f.id));
  const perSlot = new Map<string, number>();
  const seen = new Set<string>();
  const out: StyleSlide[] = [];
  for (const r of raw) {
    const o = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
    // A picture whose position was removed from the format is dropped. Its file is cleaned up later.
    if (typeof o.slotId !== "string" || !slotIds.has(o.slotId)) continue;
    const n = (perSlot.get(o.slotId) ?? 0) + 1;
    if (n > MAX_PICTURES_PER_SLOT) bad(`A position can have at most ${MAX_PICTURES_PER_SLOT} pictures`);
    perSlot.set(o.slotId, n);
    out.push({ id: uniqueId(o.id, seen), slotId: o.slotId, url: upload(o.url), text: str(o.text, "Slide text", 600) });
  }
  return out;
}

export function parseStyle(body: unknown, id: string): SlideStyle {
  if (!body || typeof body !== "object") return bad("Invalid style");
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.previews)) bad("previews must be a list");
  if ((b.previews as unknown[]).length > MAX_PREVIEWS) bad(`A style can have at most ${MAX_PREVIEWS} preview pictures`);
  const format = parseFormat(b.format);
  return {
    id,
    name: str(b.name, "Name", 60, true),
    blurb: str(b.blurb, "Description", 120),
    previews: (b.previews as unknown[]).map(upload),
    format,
    slides: parseSlides(b.slides, format),
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
