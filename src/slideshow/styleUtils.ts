import { sampleImage, type ImageSource } from "./images";
import type { SlideStyle, StyleItem } from "./styles";

export const photoSource = (item: StyleItem): ImageSource => ({ kind: "photo", url: item.url!, name: item.url!.split("/").pop()! });

/** The photo shown on a style's preview card: the chosen one, else its first photo, else a built-in sample. */
export function previewImage(style: SlideStyle): ImageSource {
  const photos = style.items.filter((i) => i.type === "photo");
  const chosen = photos.find((i) => i.id === style.previewItemId) ?? photos[0];
  return chosen ? photoSource(chosen) : sampleImage;
}

export const itemsOf = (style: SlideStyle, type: StyleItem["type"]) => style.items.filter((i) => i.type === type);
