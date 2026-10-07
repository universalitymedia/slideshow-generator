import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import type { Slide } from "../slideshow/generate";
import type { SlideStyle } from "../slideshow/styles";
import { SlidePreview } from "./SlidePreview";

const LABEL = { hook: "Hook", tip: "Tip", cta: "CTA" } as const;

export function SlideCard({
  slide,
  index,
  style,
  onCopy,
  onDownload,
}: {
  slide: Slide;
  index: number;
  style: SlideStyle;
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
      <SlidePreview image={slide.image} text={slide.text} style={style} />
      <div className="slide-meta">
        <span className="num">{String(index + 1).padStart(2, "0")}</span>
        <span className={`badge ${slide.kind}`}>{LABEL[slide.kind]}</span>
      </div>
      <p className="slide-text">{slide.text}</p>
      <div className="slide-actions">
        <button className="btn outline sm" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy text"}
        </button>
        <button className="btn ghost sm" onClick={onDownload}>
          <Download size={14} /> Image
        </button>
      </div>
    </article>
  );
}
