import { previewUrl, type ImageSource } from "../slideshow/images";

/** A 9:16 picture. The pictures carry their own look, so nothing is drawn on top. */
export function SlidePreview({ image }: { image: ImageSource }) {
  return <div className="preview" style={{ backgroundImage: `url(${previewUrl(image)})` }} role="img" aria-label="" />;
}
