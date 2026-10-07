// Visual styles for a slideshow. `text` and `position` shape the text preview;
// `filter` is applied to the photo itself, so it also ends up in the downloaded images.

export type TextLook = "highlight" | "outline" | "shadow" | "bar" | "inverse";
export type TextPosition = "top" | "center" | "bottom";

export interface SlideStyle {
  id: string;
  name: string;
  blurb: string;
  text: TextLook;
  position: TextPosition;
  filter: string; // CSS filter syntax, used for both the preview and the exported PNG
}

export const STYLES: SlideStyle[] = [
  { id: "classic", name: "Classic", blurb: "White highlight behind black text", text: "highlight", position: "center", filter: "none" },
  { id: "outline", name: "Bold outline", blurb: "Big white text with a black outline", text: "outline", position: "center", filter: "contrast(1.05) saturate(1.15)" },
  { id: "film", name: "Soft film", blurb: "Warm, faded photo with soft shadow text", text: "shadow", position: "bottom", filter: "sepia(0.25) saturate(0.9) contrast(0.95) brightness(1.03)" },
  { id: "night", name: "Night", blurb: "Dimmed photo with a dark caption bar", text: "bar", position: "bottom", filter: "brightness(0.7) saturate(0.7) contrast(1.1)" },
  { id: "mono", name: "Mono", blurb: "Black and white with inverted label text", text: "inverse", position: "top", filter: "grayscale(1) contrast(1.1)" },
];

export const DEFAULT_STYLE = STYLES[0];
