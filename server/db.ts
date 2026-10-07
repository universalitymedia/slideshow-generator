import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SEED_STYLES, type SlideStyle } from "../src/slideshow/styles.ts";
import { config } from "./config.ts";

// Small JSON file store. Fine for a handful of admins editing a handful of styles.
const dbFile = join(config.dataDir, "db.json");
export const uploadsDir = join(config.dataDir, "uploads");
mkdirSync(uploadsDir, { recursive: true });

interface Db {
  styles: SlideStyle[];
}

function load(): Db {
  if (existsSync(dbFile)) return JSON.parse(readFileSync(dbFile, "utf8"));
  const db: Db = { styles: structuredClone(SEED_STYLES) };
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
export const getStyle = (id: string) => db.styles.find((s) => s.id === id);
export const newId = () => randomUUID().slice(0, 8);

export function saveStyle(style: SlideStyle) {
  const i = db.styles.findIndex((s) => s.id === style.id);
  if (i >= 0) db.styles[i] = style;
  else db.styles.push(style);
  persist(db);
  collectGarbage();
}

export function removeStyle(id: string): boolean {
  const before = db.styles.length;
  db.styles = db.styles.filter((s) => s.id !== id);
  if (db.styles.length === before) return false;
  persist(db);
  collectGarbage();
  return true;
}

/** Delete uploads no style references. Recent files are kept: they may be waiting for the admin to hit Save. */
function collectGarbage() {
  const used = new Set(db.styles.flatMap((s) => s.items.map((i) => i.url?.split("/").pop())));
  for (const f of readdirSync(uploadsDir)) {
    if (used.has(f)) continue;
    const path = join(uploadsDir, f);
    if (Date.now() - statSync(path).mtimeMs > 10 * 60 * 1000) unlinkSync(path);
  }
}
