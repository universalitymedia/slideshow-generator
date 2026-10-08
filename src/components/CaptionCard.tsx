import { Check, Copy, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import { copyText } from "../clipboard";
import type { PostCaption } from "../slideshow/generate";

function Block({ label, hint, count, button, value, children }: {
  label: string;
  hint: string;
  count: number;
  button: string;
  value: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  async function copy() {
    try {
      await copyText(value);
      setFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setFailed(true);
    }
  }
  return (
    <div className="caption-block">
      <div className="caption-block-head">
        <span><strong>{label}</strong> <span className="muted small">{hint} · {count} characters</span></span>
        <button className="btn outline sm" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : failed ? "Copy failed, select it by hand" : button}
        </button>
      </div>
      <p>{children}</p>
    </div>
  );
}

/** Hashtags in the description are shown muted. */
function withMutedHashtags(text: string) {
  return text.split(/(#[\p{L}\p{N}_]+)/u).map((part, i) => (i % 2 ? <span key={i} className="muted">{part}</span> : part));
}

export function CaptionCard({ caption, onShuffle }: { caption: PostCaption; onShuffle: () => void }) {
  const description = caption.description;
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
        {withMutedHashtags(description)}
      </Block>
    </section>
  );
}
