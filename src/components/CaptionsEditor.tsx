import { Plus, Trash2 } from "lucide-react";
import { MAX_CAPTIONS, type SlideStyle, type StyleCaption } from "../slideshow/styles";

const newId = () => crypto.randomUUID().slice(0, 8);

export function CaptionsEditor({ style, onChange }: { style: SlideStyle; onChange: (patch: Partial<SlideStyle>) => void }) {
  const { captions } = style;
  const edit = (id: string, patch: Partial<StyleCaption>) => onChange({ captions: captions.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  return (
    <div>
      <p className="muted small tab-help">
        What creators paste into TikTok: a bold title and a description. Put the hashtags in the description. Creators get one at random and can shuffle to another. With none here, built-in captions are used.
      </p>
      <ul className="rows">
        {captions.map((c, i) => (
          <li key={c.id} className="row-card">
            <div className="row-head">
              <strong className="small">Caption {i + 1}</strong>
              <button className="icon-btn sm dark" onClick={() => onChange({ captions: captions.filter((x) => x.id !== c.id) })} aria-label={`Remove caption ${i + 1}`} title="Remove">
                <Trash2 size={15} />
              </button>
            </div>
            <label className="field">
              <span>Title <span className="muted small">{c.title.length}/100</span></span>
              <input value={c.title} maxLength={100} placeholder="The bold line above the post" onChange={(e) => edit(c.id, { title: e.target.value })} />
            </label>
            <label className="field">
              <span>Description <span className="muted small">{c.text.length}/2000</span></span>
              <textarea value={c.text} rows={4} maxLength={2000} placeholder="The text under the title, hashtags included" onChange={(e) => edit(c.id, { text: e.target.value })} />
            </label>
          </li>
        ))}
        {!captions.length && <li className="muted small">No captions yet.</li>}
      </ul>
      <button className="btn outline" onClick={() => onChange({ captions: [...captions, { id: newId(), title: "", text: "" }] })} disabled={captions.length >= MAX_CAPTIONS}>
        <Plus size={16} /> Add caption
      </button>
    </div>
  );
}
