import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CAPTIONS, HASHTAGS, SOUNDS } from "../src/slideshow/content.ts";
import { defaultFormat, SEED_STYLES, type Library, type SlideStyle } from "../src/slideshow/styles.ts";
import { config } from "./config.ts";
import { HttpError } from "./validate.ts";

// Small JSON file store. Fine for a handful of admins editing a handful of styles.
const dbFile = join(config.dataDir, "db.json");
export const uploadsDir = join(config.dataDir, "uploads");
mkdirSync(uploadsDir, { recursive: true });

interface Db {
  styles: SlideStyle[];
  library: Library;
}

/** The built-in captions and sounds, as editable rows. Used the first time the library is needed. */
const seedLibrary = (): Library => ({
  rev: 1,
  captions: CAPTIONS.map((c, i) => ({ id: `cap-${i + 1}`, title: c.title, text: `${c.text} ${HASHTAGS[c.topic].join(" ")}` })),
  sounds: SOUNDS.map((s, i) => ({ id: `snd-${i + 1}`, title: s.title, artist: s.artist, ...(s.url ? { url: s.url } : {}) })),
});

/** Libraries seeded before links were copied get them now, for rows still untouched (same id and title, no link). */
function backfillSoundLinks(library: Library): boolean {
  let changed = false;
  for (const row of library.sounds) {
    const n = /^snd-(\d+)$/.exec(row.id)?.[1];
    const builtIn = n ? SOUNDS[Number(n) - 1] : undefined;
    if (builtIn?.url && !row.url && row.title === builtIn.title) {
      row.url = builtIn.url;
      changed = true;
    }
  }
  return changed;
}

/** Styles saved before formats existed keep their name and description and get the default format. */
function load(): Db {
  if (existsSync(dbFile)) {
    const raw = JSON.parse(readFileSync(dbFile, "utf8")) as { styles: Partial<SlideStyle>[]; library?: Partial<Library> & Pick<Library, "captions" | "sounds"> };
    let changed = !raw.library;
    const styles = raw.styles.map((s) => {
      if (Array.isArray(s.format)) {
        if (s.captions && s.sounds && typeof s.rev === "number") return s as SlideStyle;
        changed = true;
        return { ...s, rev: s.rev ?? 1, captions: s.captions ?? [], sounds: s.sounds ?? [] } as SlideStyle;
      }
      changed = true;
      return { id: s.id!, rev: 1, name: s.name ?? "Style", blurb: s.blurb ?? "", previews: [], format: defaultFormat(), slides: [], captions: [], sounds: [] } satisfies SlideStyle;
    });
    if (raw.library && typeof raw.library.rev !== "number") changed = true;
    const library: Library = raw.library ? { ...raw.library, rev: raw.library.rev ?? 1 } : seedLibrary();
    if (backfillSoundLinks(library)) changed = true;
    const db: Db = { styles, library };
    if (changed) persist(db);
    return db;
  }
  const db: Db = { styles: structuredClone(SEED_STYLES), library: seedLibrary() };
  persist(db);
  return db;
}

function persist(db: Db) {
  const tmp = `${dbFile}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(db, null, 2));
  renameSync(tmp, dbFile);
}

const db = load();

export const listStyles = () => db.styles;
export const getLibrary = () => db.library;
/** Both saves below refuse a write based on an out-of-date copy, so one admin can't silently undo another's work. */
const stale = (what: string) => new HttpError(409, `Someone else saved this ${what} while you were editing. Reload the page to get their changes, then make your edit again.`);

export function saveLibrary(library: Omit<Library, "rev">, expectedRev: unknown): Library {
  if (expectedRev !== db.library.rev) throw stale("list");
  db.library = { ...library, rev: db.library.rev + 1 };
  persist(db);
  return db.library;
}
export const getStyle = (id: string) => db.styles.find((s) => s.id === id);
export const newId = () => randomUUID().slice(0, 8);

/** A style may only point at files that exist: a picture the cleanup already removed must be uploaded again. */
function assertUploadsExist(style: Omit<SlideStyle, "rev">) {
  const missing = [...style.previews, ...style.slides.map((s) => s.url)].filter((u) => !existsSync(join(uploadsDir, u.split("/").pop()!)));
  if (missing.length) throw new HttpError(409, `${missing.length === 1 ? "A picture is" : `${missing.length} pictures are`} no longer on the server. Remove ${missing.length === 1 ? "it" : "them"} and upload again, then save.`);
}

export function createStyle(style: Omit<SlideStyle, "rev">): SlideStyle {
  assertUploadsExist(style);
  const created = { ...style, rev: 1 };
  db.styles.push(created);
  persist(db);
  collectGarbage();
  return created;
}

export function saveStyle(style: Omit<SlideStyle, "rev">, expectedRev: unknown): SlideStyle {
  const i = db.styles.findIndex((s) => s.id === style.id);
  if (i < 0) throw new HttpError(404, "Style not found");
  if (expectedRev !== db.styles[i].rev) throw stale("style");
  assertUploadsExist(style);
  const saved = { ...style, rev: db.styles[i].rev + 1 };
  db.styles[i] = saved;
  persist(db);
  collectGarbage();
  return saved;
}

export function removeStyle(id: string): boolean {
  const before = db.styles.length;
  db.styles = db.styles.filter((s) => s.id !== id);
  if (db.styles.length === before) return false;
  persist(db);
  collectGarbage();
  return true;
}

/** How long an upload nobody references is kept. Long enough that no editing session can outlive it. */
const UNSAVED_UPLOAD_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

/** Delete uploads no style references. Recent files are kept: they may be waiting for the admin to hit Save. */
function collectGarbage() {
  const used = new Set(db.styles.flatMap((s) => [...s.previews, ...s.slides.map((i) => i.url)].map((u) => u.split("/").pop())));
  for (const f of readdirSync(uploadsDir)) {
    if (used.has(f)) continue;
    const path = join(uploadsDir, f);
    if (Date.now() - statSync(path).mtimeMs > UNSAVED_UPLOAD_GRACE_MS) unlinkSync(path);
  }
}
