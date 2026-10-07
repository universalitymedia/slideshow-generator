import { ArrowLeft, Check, Save, Trash2, Undo2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { FilterEditor } from "../components/FilterEditor";
import { ItemsEditor } from "../components/ItemsEditor";
import { SlidePreview } from "../components/SlidePreview";
import { go, href } from "../router";
import { previewImage } from "../slideshow/styleUtils";
import { TEXT_LOOKS, TEXT_POSITIONS, type SlideStyle } from "../slideshow/styles";

export function StyleEditor({ id }: { id: string }) {
  const [saved, setSaved] = useState<SlideStyle | null>(null);
  const [draft, setDraft] = useState<SlideStyle | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    api.styles()
      .then((r) => {
        const s = r.styles.find((x) => x.id === id);
        if (!s) return setMissing(true);
        setSaved(s);
        setDraft(s);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (missing) return <div className="page"><h1>Style not found</h1><p className="muted"><a className="link" href={href("/admin")}>Back to styles</a></p></div>;
  if (!draft || !saved) return <div className="page"><p className={error ? "auth-error" : "muted"}>{error || "Loading…"}</p></div>;

  const patch = (p: Partial<SlideStyle>) => { setDraft({ ...draft, ...p }); setJustSaved(false); };

  async function save() {
    setSaving(true);
    setError("");
    try {
      const { style } = await api.saveStyle(draft!);
      setSaved(style);
      setDraft(style);
      setJustSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete "${saved!.name}"? Its photos and text items are deleted too.`)) return;
    try {
      await api.deleteStyle(id);
      go("/admin");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const photos = draft.items.filter((i) => i.type === "photo");
  const image = previewImage(draft);

  return (
    <div className="page wide">
      <a className="back" href={href("/admin")}><ArrowLeft size={15} /> All styles</a>
      <header className="admin-head sticky-head">
        <h1>{draft.name || "Untitled style"}</h1>
        <div className="row">
          <button className="btn ghost" onClick={remove}><Trash2 size={16} /> Delete</button>
          <button className="btn outline" onClick={() => { setDraft(saved); setJustSaved(false); }} disabled={!dirty}><Undo2 size={16} /> Discard</button>
          <button className="btn primary" onClick={save} disabled={!dirty || saving || !draft.name.trim()}>
            {justSaved && !dirty ? <Check size={16} /> : <Save size={16} />} {saving ? "Saving…" : justSaved && !dirty ? "Saved" : "Save changes"}
          </button>
        </div>
      </header>
      {error && <p className="auth-error" role="alert">{error}</p>}

      <div className="editor">
        <div className="editor-main">
          <section className="card panel">
            <h2>Basics</h2>
            <label className="field">
              <span>Name</span>
              <input value={draft.name} maxLength={60} onChange={(e) => patch({ name: e.target.value })} />
            </label>
            <label className="field">
              <span>Description</span>
              <input value={draft.blurb} maxLength={120} placeholder="Shown under the style in the generator" onChange={(e) => patch({ blurb: e.target.value })} />
            </label>
          </section>

          <section className="card panel">
            <h2>Look</h2>
            <div className="field">
              <span>Text style</span>
              <div className="segmented" role="group" aria-label="Text style">
                {TEXT_LOOKS.map((l) => (
                  <button key={l.id} className={draft.text === l.id ? "on" : ""} onClick={() => patch({ text: l.id })}>{l.label}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>Text position</span>
              <div className="segmented" role="group" aria-label="Text position">
                {TEXT_POSITIONS.map((p) => (
                  <button key={p} className={draft.position === p ? "on" : ""} onClick={() => patch({ position: p })}>{p[0].toUpperCase() + p.slice(1)}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>Photo filter</span>
              <FilterEditor value={draft.filter} onChange={(filter) => patch({ filter })} />
              <p className="muted small">The filter is also applied to the images creators download. The text look is a preview only.</p>
            </div>
          </section>

          <section className="card panel">
            <h2>Preview</h2>
            <p className="muted small">What creators see on this style's card before they generate.</p>
            <label className="field">
              <span>Sample text</span>
              <input value={draft.previewText} maxLength={200} onChange={(e) => patch({ previewText: e.target.value })} />
            </label>
            <div className="field">
              <span>Sample photo</span>
              {photos.length ? (
                <div className="photo-pick">
                  {photos.map((p) => {
                    const on = (draft.previewItemId ?? photos[0].id) === p.id;
                    return (
                      <button key={p.id} className={on ? "on" : ""} onClick={() => patch({ previewItemId: p.id })} aria-pressed={on} aria-label="Use this photo for the preview">
                        <img src={p.url} alt="" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="muted small">Add photos under Items to pick one. Until then the built-in sample is used.</p>
              )}
            </div>
          </section>

          <section className="card panel">
            <h2>Items</h2>
            <ItemsEditor style={draft} onChange={patch} />
          </section>
        </div>

        <aside className="editor-side">
          <div className="card side-card">
            <span className="muted small">Live preview</span>
            <SlidePreview image={image} text={draft.previewText} style={draft} />
          </div>
          <div className="card side-card">
            <span className="muted small">In the generator</span>
            <div className="style-card on static">
              <SlidePreview image={image} text={draft.previewText} style={draft} small />
              <span className="style-name">{draft.name}<Check size={14} /></span>
              {draft.blurb && <span className="muted small">{draft.blurb}</span>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
