import { Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import { PreviewStack } from "../components/PreviewStack";
import { go, href } from "../router";
import type { SlideStyle } from "../slideshow/styles";

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function AdminStyles() {
  const [styles, setStyles] = useState<SlideStyle[] | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.styles().then((r) => setStyles(r.styles)).catch((e) => setError(e.message));
  }, []);

  async function create() {
    setCreating(true);
    try {
      const { style } = await api.createStyle();
      go(`/admin/styles/${style.id}`);
    } catch (e) {
      setError((e as Error).message);
      setCreating(false);
    }
  }

  return (
    <div className="page wide">
      <header className="admin-head">
        <div>
          <h1>Styles</h1>
          <p className="muted">What creators can pick in the generator. Edit a style's look, preview and items.</p>
        </div>
        <button className="btn primary" onClick={create} disabled={creating}>
          <Plus size={16} /> New style
        </button>
      </header>

      {error && <p className="auth-error" role="alert">{error}</p>}
      {!styles && !error && <p className="muted">Loading…</p>}

      <div className="admin-grid">
        {styles?.map((s) => (
          <a key={s.id} className="card admin-style" href={href(`/admin/styles/${s.id}`)}>
            <PreviewStack urls={s.previews} />
            <div className="admin-style-body">
              <strong>{s.name}</strong>
              {s.blurb && <p className="muted small">{s.blurb}</p>}
              <p className="muted small">
                {count(s.format.length, "position")} · {count(s.slides.length, "picture")} · {count(s.captions.length, "caption")} · {count(s.sounds.length, "sound")}
              </p>
            </div>
            <span className="btn outline sm"><Pencil size={14} /> Edit</span>
          </a>
        ))}
      </div>
    </div>
  );
}
