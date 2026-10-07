import { Check, Copy, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import { HASHTAGS } from "../slideshow/content";
import type { Caption } from "../slideshow/content";
import { captionDescription } from "../slideshow/generate";

function Block({ label, hint, count, button, value, children }: {
  label: string;
  hint: string;
  count: number;
  button: string;
  value: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="caption-block">
      <div className="caption-block-head">
        <span><strong>{label}</strong> <span className="muted small">{hint} · {count} characters</span></span>
        <button className="btn outline sm" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : button}
        </button>
      </div>
      <p>{children}</p>
    </div>
  );
}

export function CaptionCard({ caption, onShuffle }: { caption: Caption; onShuffle: () => void }) {
  const description = captionDescription(caption);
  return (
    <section className="card caption">
      <div className="caption-head">
        <span className="tile"><Send size={20} /></span>
        <div>
          <strong>Caption</strong>
          <p className="muted">Last step: paste these two into TikTok, then post.</p>
        </div>
        <button className="btn ghost push" onClick={onShuffle}><RefreshCw size={14} /> Shuffle caption</button>
      </div>

      <Block label="TITLE" hint="the bold line above your post" count={caption.title.length} button="Copy title" value={caption.title}>
        {caption.title}
      </Block>
      <Block label="DESCRIPTION" hint="the text under it, hashtags included" count={description.length} button="Copy description" value={description}>
        {caption.text} <span className="muted">{HASHTAGS[caption.topic].join(" ")}</span>
      </Block>
    </section>
  );
}
