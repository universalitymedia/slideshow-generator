import type { ImageSource } from "./images";
import type { SlideStyle, StyleSlide } from "./styles";

export const photoSource = (url: string): ImageSource => ({ kind: "photo", url, name: url.split("/").pop()! });

export const slidesIn = (style: SlideStyle, slotId: string): StyleSlide[] => style.slides.filter((s) => s.slotId === slotId);
