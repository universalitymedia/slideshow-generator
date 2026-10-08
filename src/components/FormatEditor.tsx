import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { slidesIn } from "../slideshow/styleUtils";
import { MAX_PICTURES_PER_SLOT, MAX_SLOTS, slotLabels, type SlideStyle, type SlotKind } from "../slideshow/styles";
import { Uploader } from "./Uploader";

const newId = () => crypto.randomUUID().slice(0, 8);

/**
 * The order of the slideshow (Slide 1, Slide 2, CTA, Slide 3 ...) and the pictures that can fill each position.
 * Every picture carries the text a creator copies for it.
 */
export function FormatEditor({ style, onChange }: { style: SlideStyle; onChange: (patch: Partial<SlideStyle>) => void }) {
  const { format } = style;
  const labels = slotLabels(format);
  const [selected, setSelected] = useState(format[0]?.id);
  const [error, setError] = useState("");

  const index = Math.max(0, format.findIndex((f) => f.id === selected));
  const slot = format[index];
  const pool = slot ? slidesIn(style, slot.id) : [];

  function add(kind: SlotKind) {
    const next = { id: newId(), kind };
    onChange({ format: [...format, next] });
    setSelected(next.id);
  }

  function move(by: -1 | 1) {
    const to = index + by;
    if (to < 0 || to >= format.length) return;
    const next = [...format];
    [next[index], next[to]] = [next[to], next[index]];
    onChange({ format: next });
  }

  function remove() {
    if (format.length <= 1) return;
    if (pool.length && !window.confirm(`Remove ${labels[index]}? Its ${pool.length} ${pool.length === 1 ? "picture is" : "pictures are"} removed too.`)) return;
    onChange({ format: format.filter((f) => f.id !== slot.id), slides: style.slides.filter((s) => s.slotId !== slot.id) });
    setSelected(format[index === 0 ? 1 : index - 1].id);
  }

  const setText = (id: string, text: string) => onChange({ slides: style.slides.map((s) => (s.id === id ? { ...s, text } : s)) });
  const removeSlide = (id: string) => onChange({ slides: style.slides.filter((s) => s.id !== id) });

  return (
    <div>
      <p className="muted small tab-help">The order creators get. Add as many slides and CTAs as you like, in any order, then pick a position to upload its pictures.</p>

      <div className="format" role="tablist" aria-label="Format">
        {format.map((f, i) => (
          <button key={f.id} role="tab" aria-selected={f.id === slot?.id} className={`slot ${f.kind} ${f.id === slot?.id ? "on" : ""}`} onClick={() => { setSelected(f.id); setError(""); }}>
            {labels[i]}
            <span className="count">{slidesIn(style, f.id).length}</span>
          </button>
        ))}
        <button className="btn outline sm" onClick={() => add("slide")} disabled={format.length >= MAX_SLOTS}><Plus size={14} /> Slide</button>
        <button className="btn outline sm" onClick={() => add("cta")} disabled={format.length >= MAX_SLOTS}><Plus size={14} /> CTA</button>
      </div>

      {slot && (
        <div className="slot-panel">
          <div className="slot-head">
            <h3>{labels[index]}</h3>
            <div className="row">
              <button className="icon-btn sm dark" onClick={() => move(-1)} disabled={index === 0} aria-label="Move earlier" title="Move earlier"><ArrowLeft size={16} /></button>
              <button className="icon-btn sm dark" onClick={() => move(1)} disabled={index === format.length - 1} aria-label="Move later" title="Move later"><ArrowRight size={16} /></button>
              <button className="icon-btn sm dark" onClick={remove} disabled={format.length <= 1} aria-label="Remove this position" title="Remove this position"><Trash2 size={16} /></button>
            </div>
          </div>
          <p className="muted small">
            {pool.length
              ? "Creators get one of these pictures at random, with its text."
              : "No pictures yet. Until you upload some, creators get a built-in picture and text here."}
          </p>
          {error && <p className="auth-error" role="alert">{error}</p>}

          <div className="slide-grid">
            {pool.map((p) => (
              <div key={p.id} className="slide-item">
                <div className="thumb" style={{ backgroundImage: `url(${p.url})` }} role="img" aria-label="" />
                <textarea
                  value={p.text}
                  rows={5}
                  maxLength={600}
                  placeholder="Text creators copy for this picture"
                  aria-label="Text for this picture"
                  onChange={(e) => setText(p.id, e.target.value)}
                />
                <button className="btn ghost sm" onClick={() => removeSlide(p.id)}><Trash2 size={14} /> Remove</button>
              </div>
            ))}
            <Uploader
              label="Add pictures"
              max={MAX_PICTURES_PER_SLOT - pool.length}
              onError={setError}
              onUploaded={(urls) => { setError(""); onChange({ slides: [...style.slides, ...urls.map((url) => ({ id: newId(), slotId: slot.id, url, text: "" }))] }); }}
            />
          </div>
          <p className="muted small">PNG, JPEG or WebP, up to 8 MB each. Portrait pictures (9:16) work best. Changes apply when you save.</p>
        </div>
      )}
    </div>
  );
}
