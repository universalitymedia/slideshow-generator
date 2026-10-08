import { ArrowLeft, Check, Save, Star, Trash2, Undo2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { CaptionsEditor } from "../components/CaptionsEditor";
import { FormatEditor } from "../components/FormatEditor";
import { PreviewStack } from "../components/PreviewStack";
import { SoundsEditor } from "../components/SoundsEditor";
import { Uploader } from "../components/Uploader";
import { go, href } from "../router";
import { MAX_PREVIEWS, type SlideStyle } from "../slideshow/styles";

export function StyleEditor({ id }: { id: string }) {
  const [saved, setSaved] = useState<SlideStyle | null>(null);
  const [draft, setDraft] = useState<SlideStyle | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
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
    if (!window.confirm(`Delete "${saved!.name}"? Its pictures are deleted too.`)) return;
    try {
      await api.deleteStyle(id);
      go("/admin");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const makeMain = (url: string) => patch({ previews: [url, ...draft.previews.filter((u) => u !== url)] });

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
            <h2>Preview pictures</h2>
            <p className="muted small">What creators see on this style's card before they generate. The starred picture is the main one.</p>
            {uploadError && <p className="auth-error" role="alert">{uploadError}</p>}
            <div className="photo-grid">
              {draft.previews.map((url, i) => (
                <figure key={url} className={i === 0 ? "on" : ""}>
                  <img src={url} alt="" loading="lazy" />
                  <figcaption>
                    <button className="icon-btn sm" title="Make this the main picture" aria-label="Make this the main picture" onClick={() => makeMain(url)}>
                      <Star size={15} fill={i === 0 ? "currentColor" : "none"} />
                    </button>
                    <button className="icon-btn sm" title="Remove" aria-label="Remove preview picture" onClick={() => patch({ previews: draft.previews.filter((u) => u !== url) })}>
                      <Trash2 size={15} />
                    </button>
                  </figcaption>
                </figure>
              ))}
              <Uploader
                label="Add previews"
                max={MAX_PREVIEWS - draft.previews.length}
                onError={setUploadError}
                onUploaded={(urls) => { setUploadError(""); patch({ previews: [...draft.previews, ...urls] }); }}
              />
            </div>
          </section>

          <section className="card panel">
            <h2>Format and slides</h2>
            <FormatEditor style={draft} onChange={patch} />
          </section>

          <section className="card panel">
            <h2>Captions</h2>
            <CaptionsEditor style={draft} onChange={patch} />
          </section>

          <section className="card panel">
            <h2>Music</h2>
            <SoundsEditor style={draft} onChange={patch} />
          </section>
        </div>

        <aside className="editor-side">
          <div className="card side-card">
            <span className="muted small">In the generator</span>
            <div className="style-card on static">
              <PreviewStack urls={draft.previews} />
              <span className="style-name">{draft.name}<Check size={14} /></span>
              {draft.blurb && <span className="muted small">{draft.blurb}</span>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
