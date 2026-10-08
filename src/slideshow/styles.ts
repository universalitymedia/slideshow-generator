// Style types shared by the client and the server, so keep this file dependency free.

export type SlotKind = "slide" | "cta";

/** One position in a style's format, e.g. Slide 1, Slide 2, CTA. The order of the list is the order of the slideshow. */
export interface FormatSlot {
  id: string;
  kind: SlotKind;
}

/** An uploaded picture that can fill a format position, with the text creators copy for it. */
export interface StyleSlide {
  id: string;
  slotId: string;
  url: string; // always /uploads/<file>
  text: string;
}

/** A caption creators paste into TikTok. `text` is the whole description, hashtags included. */
export interface StyleCaption {
  id: string;
  title: string;
  text: string;
}

/** A sound creators use. `url` is an optional link to the exact sound, otherwise creators get a TikTok search. */
export interface StyleSound {
  id: string;
  title: string;
  artist: string;
  url?: string;
}

export interface SlideStyle {
  id: string;
  name: string;
  blurb: string;
  previews: string[]; // uploaded preview pictures, the first is the main one
  format: FormatSlot[];
  slides: StyleSlide[];
  captions: StyleCaption[];
  sounds: StyleSound[];
}

export const MAX_CAPTIONS = 30;
export const MAX_SOUNDS = 30;
export const MAX_SLOTS = 15;
export const MAX_PREVIEWS = 6;
export const MAX_PICTURES_PER_SLOT = 50;

/** "Slide 1", "Slide 2", "CTA", "Slide 3": slides are numbered in order, CTAs are not. */
export function slotLabels(format: FormatSlot[]): string[] {
  let n = 0;
  return format.map((s) => (s.kind === "cta" ? "CTA" : `Slide ${++n}`));
}

export const defaultFormat = (): FormatSlot[] => [
  { id: "slot-1", kind: "slide" },
  { id: "slot-2", kind: "slide" },
  { id: "slot-3", kind: "slide" },
  { id: "slot-4", kind: "slide" },
  { id: "slot-5", kind: "slide" },
  { id: "slot-6", kind: "cta" },
];

export const newStyleDefaults = (): Omit<SlideStyle, "id"> => ({
  name: "New style",
  blurb: "",
  previews: [],
  format: defaultFormat(),
  slides: [],
  captions: [],
  sounds: [],
});

export const SEED_STYLES: SlideStyle[] = [
  { id: "default", name: "Default", blurb: "Built-in photos and text", previews: [], format: defaultFormat(), slides: [], captions: [], sounds: [] },
];
