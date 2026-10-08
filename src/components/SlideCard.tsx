import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import type { Slide } from "../slideshow/generate";
import { SlidePreview } from "./SlidePreview";

export function SlideCard({
  slide,
  index,
  onCopy,
  onDownload,
}: {
  slide: Slide;
  index: number;
  onCopy: () => Promise<void>;
  onDownload: () => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <article className="card slide">
      <SlidePreview image={slide.image} />
      <div className="slide-meta">
        <span className="num">{String(index + 1).padStart(2, "0")}</span>
        <span className={`badge ${slide.kind}`}>{slide.label}</span>
      </div>
      {slide.text ? <p className="slide-text">{slide.text}</p> : <p className="slide-text muted">No text for this picture.</p>}
      <div className="slide-actions">
        <button className="btn outline sm" onClick={copy} disabled={!slide.text}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy text"}
        </button>
        <button className="btn ghost sm" onClick={onDownload}>
          <Download size={14} /> Image
        </button>
      </div>
    </article>
  );
}
