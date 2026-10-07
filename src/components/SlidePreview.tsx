import type { SlideStyle } from "../slideshow/styles";
import { previewUrl, type ImageSource } from "../slideshow/images";

/** A 9:16 slide: the photo with the style's filter, plus the text overlay on top. */
export function SlidePreview({ image, text, style, small }: { image: ImageSource; text: string; style: SlideStyle; small?: boolean }) {
  return (
    <div className={`preview ${small ? "small" : ""}`}>
      <div className="bg" style={{ backgroundImage: `url(${previewUrl(image)})`, filter: style.filter }} />
      <div className={`overlay-wrap pos-${style.position}`}>
        <p className={`overlay look-${style.text}`}><span>{text}</span></p>
      </div>
    </div>
  );
}
