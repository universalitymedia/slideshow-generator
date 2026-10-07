import { ImagePlus, Star, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "../api";
import { ITEM_TYPES, type ItemType, type SlideStyle, type StyleItem } from "../slideshow/styles";

const HELP: Record<ItemType, string> = {
  photo: "Photos for this style's slides. Without any, slides use the built-in photos.",
  hook: "Opening lines. If there are any, generating with this style picks its hook from here.",
  tip: "Tips for the middle slides. They are used first, and built-in tips fill any gap.",
  cta: "Closing lines. If there are any, generating with this style picks its CTA from here.",
};

const newId = () => crypto.randomUUID().slice(0, 8);

export function ItemsEditor({ style, onChange }: { style: SlideStyle; onChange: (patch: Partial<SlideStyle>) => void }) {
  const [tab, setTab] = useState<ItemType>("photo");
  const [draftText, setDraftText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const items = style.items.filter((i) => i.type === tab);
  const setItems = (next: StyleItem[]) => onChange({ items: next });
  const edit = (id: string, text: string) => setItems(style.items.map((i) => (i.id === id ? { ...i, text } : i)));
  const remove = (id: string) =>
    onChange({ items: style.items.filter((i) => i.id !== id), previewItemId: style.previewItemId === id ? undefined : style.previewItemId });

  function addText() {
    // One item per line, so a whole list can be pasted at once.
    const lines = draftText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setItems([...style.items, ...lines.map((text): StyleItem => ({ id: newId(), type: tab, text }))]);
    setDraftText("");
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    const added: StyleItem[] = [];
    for (const file of Array.from(files)) {
      try {
        const { url } = await api.upload(file);
        added.push({ id: newId(), type: "photo", url });
      } catch (e) {
        setError(`${file.name}: ${(e as Error).message}`);
      }
    }
    if (added.length) setItems([...style.items, ...added]);
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <div>
      <div className="tabs" role="tablist">
        {ITEM_TYPES.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : ""} onClick={() => { setTab(t.id); setError(""); }}>
            {t.plural} <span className="count">{style.items.filter((i) => i.type === t.id).length}</span>
          </button>
        ))}
      </div>
      <p className="muted small tab-help">{HELP[tab]}</p>
      {error && <p className="auth-error" role="alert">{error}</p>}

      {tab === "photo" ? (
        <>
          <div className="photo-grid">
            {items.map((i) => (
              <figure key={i.id} className={style.previewItemId === i.id ? "on" : ""}>
                <img src={i.url} alt="" loading="lazy" />
                <figcaption>
                  <button className="icon-btn sm" title="Use in the style preview" aria-label="Use in the style preview" onClick={() => onChange({ previewItemId: i.id })}>
                    <Star size={15} fill={style.previewItemId === i.id ? "currentColor" : "none"} />
                  </button>
                  <button className="icon-btn sm" title="Remove" aria-label="Remove photo" onClick={() => remove(i.id)}>
                    <Trash2 size={15} />
                  </button>
                </figcaption>
              </figure>
            ))}
            <label className={`upload ${uploading ? "busy" : ""}`}>
              <ImagePlus size={20} />
              <span>{uploading ? "Uploading…" : "Add photos"}</span>
              <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden disabled={uploading} onChange={(e) => upload(e.target.files)} />
            </label>
          </div>
          <p className="muted small">PNG, JPEG or WebP, up to 8 MB each. Portrait photos work best (9:16). Changes apply when you save.</p>
        </>
      ) : (
        <>
          <ul className="text-items">
            {items.map((i) => (
              <li key={i.id}>
                <textarea value={i.text ?? ""} rows={2} maxLength={600} onChange={(e) => edit(i.id, e.target.value)} aria-label={`${tab} text`} />
                <button className="icon-btn sm" aria-label="Remove" title="Remove" onClick={() => remove(i.id)}>
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
            {!items.length && <li className="muted small">Nothing here yet.</li>}
          </ul>
          <div className="add-text">
            <textarea
              value={draftText}
              rows={3}
              maxLength={6000}
              placeholder={`Add a ${ITEM_TYPES.find((t) => t.id === tab)!.label.toLowerCase()}. One per line to add several.`}
              onChange={(e) => setDraftText(e.target.value)}
              aria-label={`New ${tab}`}
            />
            <button className="btn outline" onClick={addText} disabled={!draftText.trim()}>Add</button>
          </div>
        </>
      )}
    </div>
  );
}
