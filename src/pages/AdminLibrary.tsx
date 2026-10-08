import { Check, Save, Undo2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { CaptionsEditor } from "../components/CaptionsEditor";
import { SoundsEditor } from "../components/SoundsEditor";
import type { Library } from "../slideshow/styles";

/** The shared captions or music, used by every style that has none of its own. */
export function AdminLibrary({ kind }: { kind: "captions" | "sounds" }) {
  const [saved, setSaved] = useState<Library | null>(null);
  const [draft, setDraft] = useState<Library | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setSaved(null);
    setDraft(null);
    api.library().then((r) => { setSaved(r.library); setDraft(r.library); }).catch((e) => setError(e.message));
  }, [kind]);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const title = kind === "captions" ? "Captions" : "Music";

  async function save() {
    setSaving(true);
    setError("");
    try {
      const { library } = await api.saveLibrary(draft!);
      setSaved(library);
      setDraft(library);
      setJustSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="admin-head sticky-head">
        <div>
          <h1>{title}</h1>
          <p className="muted">Shared by every style that has no {kind === "captions" ? "captions" : "music"} of its own.</p>
        </div>
        <div className="row">
          <button className="btn outline" onClick={() => { setDraft(saved); setJustSaved(false); }} disabled={!dirty}><Undo2 size={16} /> Discard</button>
          <button className="btn primary" onClick={save} disabled={!dirty || saving}>
            {justSaved && !dirty ? <Check size={16} /> : <Save size={16} />} {saving ? "Saving…" : justSaved && !dirty ? "Saved" : "Save changes"}
          </button>
        </div>
      </header>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {!draft && !error && <p className="muted">Loading…</p>}

      {draft && (
        <section className="card panel">
          {kind === "captions" ? (
            <CaptionsEditor
              captions={draft.captions}
              onChange={(captions) => { setDraft({ ...draft, captions }); setJustSaved(false); }}
              help="A title and a description (hashtags included) creators paste into TikTok. Creators get one at random and can shuffle to another."
            />
          ) : (
            <SoundsEditor
              sounds={draft.sounds}
              onChange={(sounds) => { setDraft({ ...draft, sounds }); setJustSaved(false); }}
              help="Add the link to the exact sound if you have it. Without a link, creators get a TikTok search for the title."
            />
          )}
        </section>
      )}
    </div>
  );
}
