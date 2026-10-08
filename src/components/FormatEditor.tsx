import { ArrowLeft, ArrowRight, GripVertical, Plus, Trash2 } from "lucide-react";
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
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const index = Math.max(0, format.findIndex((f) => f.id === selected));
  const slot = format[index];
  const pool = slot ? slidesIn(style, slot.id) : [];

  function add(kind: SlotKind) {
    const next = { id: newId(), kind };
    onChange({ format: [...format, next] });
    setSelected(next.id);
  }

  /** Move the position `fromId` to where `toId` is. Used by both drag and drop and the arrow buttons. */
  function reorder(fromId: string, toId: string) {
    const from = format.findIndex((f) => f.id === fromId);
    const to = format.findIndex((f) => f.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...format];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange({ format: next });
  }

  const move = (by: -1 | 1) => format[index + by] && reorder(slot.id, format[index + by].id);

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
      <p className="muted small tab-help">The order creators get. Drag a position to move it, or select one and use the arrows. Add as many slides and CTAs as you like, then pick a position to upload its pictures.</p>

      <div className="format" role="tablist" aria-label="Format">
        {format.map((f, i) => (
          <button
            key={f.id}
            role="tab"
            draggable
            aria-selected={f.id === slot?.id}
            className={`slot kind-${f.kind} ${f.id === slot?.id ? "on" : ""} ${dragId === f.id ? "dragging" : ""} ${overId === f.id && dragId !== f.id ? "over" : ""}`}
            onClick={() => { setSelected(f.id); setError(""); }}
            onDragStart={(e) => { setDragId(f.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", f.id); }}
            onDragOver={(e) => { if (dragId) { e.preventDefault(); setOverId(f.id); } }}
            onDrop={(e) => { e.preventDefault(); if (dragId) reorder(dragId, f.id); setDragId(null); setOverId(null); }}
            onDragEnd={() => { setDragId(null); setOverId(null); }}
          >
            <GripVertical size={14} className="grip" aria-hidden="true" />
            <span className="slot-label">{labels[i]}</span>
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
              <button className="btn outline sm" onClick={() => move(-1)} disabled={index === 0} aria-label="Move earlier"><ArrowLeft size={14} /> Earlier</button>
              <button className="btn outline sm" onClick={() => move(1)} disabled={index === format.length - 1} aria-label="Move later">Later <ArrowRight size={14} /></button>
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
