import { randomUUID } from "node:crypto";
import {
  MAX_CAPTIONS, MAX_PICTURES_PER_SLOT, MAX_PREVIEWS, MAX_SLOTS, MAX_SOUNDS,
  type FormatSlot, type Library, type SlideStyle, type StyleCaption, type StyleSlide, type StyleSound,
} from "../src/slideshow/styles.ts";

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

const obj = (r: unknown) => (r && typeof r === "object" ? r : {}) as Record<string, unknown>;

/** Rows left completely empty in the editor are dropped instead of rejected. */
export function parseCaptions(raw: unknown): StyleCaption[] {
  if (!Array.isArray(raw)) return bad("captions must be a list");
  if (raw.length > MAX_CAPTIONS) return bad(`A style can have at most ${MAX_CAPTIONS} captions`);
  const seen = new Set<string>();
  return raw.flatMap((r) => {
    const o = obj(r);
    const title = str(o.title, "Caption title", 100);
    const text = str(o.text, "Caption description", 2000);
    if (!title && !text) return [];
    if (!text) bad("Every caption needs a description");
    return [{ id: uniqueId(o.id, seen), title, text }];
  });
}

export function parseSounds(raw: unknown): StyleSound[] {
  if (!Array.isArray(raw)) return bad("sounds must be a list");
  if (raw.length > MAX_SOUNDS) return bad(`A style can have at most ${MAX_SOUNDS} sounds`);
  const seen = new Set<string>();
  return raw.flatMap((r) => {
    const o = obj(r);
    const title = str(o.title, "Sound title", 120);
    const artist = str(o.artist, "Artist", 120);
    const link = str(o.url, "Sound link", 300);
    if (!title && !artist && !link) return [];
    if (!title) bad("Every sound needs a title");
    let url: string | undefined;
    if (link) {
      try {
        const u = new URL(link);
        if (u.protocol !== "https:") throw new Error();
        url = u.href;
      } catch {
        bad(`"${link}" is not a valid https link`);
      }
    }
    return [{ id: uniqueId(o.id, seen), title, artist, ...(url ? { url } : {}) }];
  });
}

export function parseLibrary(body: unknown): Omit<Library, "rev"> {
  const b = obj(body);
  return { captions: parseCaptions(b.captions ?? []), sounds: parseSounds(b.sounds ?? []) };
}

export function parseStyle(body: unknown, id: string): Omit<SlideStyle, "rev"> {
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
    captions: parseCaptions(b.captions ?? []),
    sounds: parseSounds(b.sounds ?? []),
  };
}

const MAX_SIDE = 10000; // pixels
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** PNG: signature, an IHDR chunk first with sane dimensions, and an IEND chunk closing the file. */
function validPng(b: Buffer): boolean {
  if (b.length < 45 || !b.subarray(0, 8).equals(PNG_SIGNATURE)) return false;
  if (b.readUInt32BE(8) !== 13 || b.subarray(12, 16).toString("latin1") !== "IHDR") return false;
  const w = b.readUInt32BE(16);
  const h = b.readUInt32BE(20);
  if (!w || !h || w > MAX_SIDE || h > MAX_SIDE) return false;
  // IEND is a fixed 12 bytes: length 0, "IEND", and its CRC.
  return b.subarray(b.length - 8, b.length - 4).toString("latin1") === "IEND";
}

/** JPEG: walk the marker segments up to the frame header (dimensions), and require the end-of-image marker. */
function validJpeg(b: Buffer): boolean {
  if (b.length < 20 || b[0] !== 0xff || b[1] !== 0xd8) return false;
  let end = b.length;
  while (end > 2 && b[end - 1] === 0) end--; // some encoders pad the file
  if (b[end - 2] !== 0xff || b[end - 1] !== 0xd9) return false;
  let i = 2;
  while (i + 4 <= end) {
    if (b[i] !== 0xff) return false;
    const marker = b[i + 1];
    if (marker === 0xff) { i++; continue; } // fill byte
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; } // no length
    const len = b.readUInt16BE(i + 2);
    if (len < 2 || i + 2 + len > end) return false;
    const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame) {
      if (len < 8) return false;
      const h = b.readUInt16BE(i + 5);
      const w = b.readUInt16BE(i + 7);
      return w > 0 && h > 0 && w <= MAX_SIDE && h <= MAX_SIDE;
    }
    if (marker === 0xda) return false; // image data started with no frame header
    i += 2 + len;
  }
  return false;
}

/** WebP: a RIFF container whose declared size matches the file, holding a VP8, VP8L or VP8X chunk. */
function validWebp(b: Buffer): boolean {
  if (b.length < 30 || b.subarray(0, 4).toString("latin1") !== "RIFF" || b.subarray(8, 12).toString("latin1") !== "WEBP") return false;
  if (b.readUInt32LE(4) + 8 !== b.length && b.readUInt32LE(4) + 9 !== b.length) return false; // RIFF pads odd sizes
  return ["VP8 ", "VP8L", "VP8X"].includes(b.subarray(12, 16).toString("latin1"));
}

const IMAGE_TYPES: ["png" | "jpg" | "webp", (b: Buffer) => boolean][] = [
  ["png", validPng],
  ["jpg", validJpeg],
  ["webp", validWebp],
];

/** Decide the file type from the bytes, not from what the client claims. SVG is deliberately not allowed. */
export function imageExtension(buf: Buffer): "png" | "jpg" | "webp" {
  const hit = IMAGE_TYPES.find(([, valid]) => valid(buf));
  if (!hit) throw new HttpError(415, "Upload a PNG, JPEG or WebP image (the file looks damaged or is another type)");
  return hit[0];
}
