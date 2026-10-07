// Style types and the built-in styles. Imported by both the client and the server, so keep it dependency free.

export type TextLook = "highlight" | "outline" | "shadow" | "bar" | "inverse";
export type TextPosition = "top" | "center" | "bottom";
export type ItemType = "photo" | "hook" | "tip" | "cta";

export const TEXT_LOOKS: { id: TextLook; label: string }[] = [
  { id: "highlight", label: "Highlight" },
  { id: "outline", label: "Outline" },
  { id: "shadow", label: "Shadow" },
  { id: "bar", label: "Bar" },
  { id: "inverse", label: "Inverse" },
];
export const TEXT_POSITIONS: TextPosition[] = ["top", "center", "bottom"];
export const ITEM_TYPES: { id: ItemType; label: string; plural: string }[] = [
  { id: "photo", label: "Photo", plural: "Photos" },
  { id: "hook", label: "Hook", plural: "Hooks" },
  { id: "tip", label: "Tip", plural: "Tips" },
  { id: "cta", label: "CTA", plural: "CTAs" },
];

/** One piece of content that belongs to a style: an uploaded photo, or a line of slide text. */
export interface StyleItem {
  id: string;
  type: ItemType;
  text?: string; // hook, tip, cta
  url?: string; // photo, always /uploads/<file>
}

export interface SlideStyle {
  id: string;
  name: string;
  blurb: string;
  text: TextLook;
  position: TextPosition;
  filter: string; // CSS filter syntax, used for the preview and baked into exported PNGs
  previewText: string;
  previewItemId?: string; // a photo item shown in the style's preview card
  items: StyleItem[];
}

const SAMPLE = "1. Turn location off for your camera";

export const SEED_STYLES: SlideStyle[] = [
  { id: "classic", name: "Classic", blurb: "White highlight behind black text", text: "highlight", position: "center", filter: "none", previewText: SAMPLE, items: [] },
  { id: "outline", name: "Bold outline", blurb: "Big white text with a black outline", text: "outline", position: "center", filter: "contrast(1.05) saturate(1.15)", previewText: SAMPLE, items: [] },
  { id: "film", name: "Soft film", blurb: "Warm, faded photo with soft shadow text", text: "shadow", position: "bottom", filter: "sepia(0.25) saturate(0.9) contrast(0.95) brightness(1.03)", previewText: SAMPLE, items: [] },
  { id: "night", name: "Night", blurb: "Dimmed photo with a dark caption bar", text: "bar", position: "bottom", filter: "brightness(0.7) saturate(0.7) contrast(1.1)", previewText: SAMPLE, items: [] },
  { id: "mono", name: "Mono", blurb: "Black and white with inverted label text", text: "inverse", position: "top", filter: "grayscale(1) contrast(1.1)", previewText: SAMPLE, items: [] },
];

export const NEW_STYLE: Omit<SlideStyle, "id"> = {
  name: "New style",
  blurb: "",
  text: "highlight",
  position: "center",
  filter: "none",
  previewText: SAMPLE,
  items: [],
};

// Filter builder: the editor edits these numbers, and they compose into the CSS filter string.
export const FILTER_FIELDS = [
  { key: "brightness", label: "Brightness", min: 0.3, max: 1.7, step: 0.01, def: 1 },
  { key: "contrast", label: "Contrast", min: 0.5, max: 1.7, step: 0.01, def: 1 },
  { key: "saturate", label: "Saturation", min: 0, max: 2, step: 0.01, def: 1 },
  { key: "sepia", label: "Sepia", min: 0, max: 1, step: 0.01, def: 0 },
  { key: "grayscale", label: "Black and white", min: 0, max: 1, step: 0.01, def: 0 },
] as const;

export type FilterValues = Record<(typeof FILTER_FIELDS)[number]["key"], number>;

export function parseFilter(filter: string): FilterValues {
  const out = Object.fromEntries(FILTER_FIELDS.map((f) => [f.key, f.def])) as FilterValues;
  for (const m of filter.matchAll(/([a-z-]+)\(([0-9.]+)\)/g)) {
    if (m[1] in out) out[m[1] as keyof FilterValues] = Number(m[2]);
  }
  return out;
}

export function composeFilter(v: FilterValues): string {
  const parts = FILTER_FIELDS.filter((f) => Math.abs(v[f.key] - f.def) > 0.001).map((f) => `${f.key}(${Number(v[f.key].toFixed(2))})`);
  return parts.length ? parts.join(" ") : "none";
}
