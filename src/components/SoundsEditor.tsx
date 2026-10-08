import { Plus, Trash2 } from "lucide-react";
import { MAX_SOUNDS, type SlideStyle, type StyleSound } from "../slideshow/styles";

const newId = () => crypto.randomUUID().slice(0, 8);

export function SoundsEditor({ style, onChange }: { style: SlideStyle; onChange: (patch: Partial<SlideStyle>) => void }) {
  const { sounds } = style;
  const edit = (id: string, patch: Partial<StyleSound>) => onChange({ sounds: sounds.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  return (
    <div>
      <p className="muted small tab-help">
        Sounds creators can use with this style. Creators get one at random. Add the link to the exact sound if you have it, otherwise creators get a TikTok search for the title. With none here, built-in sounds are used.
      </p>
      <ul className="rows">
        {sounds.map((s, i) => (
          <li key={s.id} className="row-card">
            <div className="row-head">
              <strong className="small">Sound {i + 1}</strong>
              <button className="icon-btn sm dark" onClick={() => onChange({ sounds: sounds.filter((x) => x.id !== s.id) })} aria-label={`Remove sound ${i + 1}`} title="Remove">
                <Trash2 size={15} />
              </button>
            </div>
            <div className="two-cols">
              <label className="field">
                <span>Title</span>
                <input value={s.title} maxLength={120} placeholder="Song or sound name" onChange={(e) => edit(s.id, { title: e.target.value })} />
              </label>
              <label className="field">
                <span>Artist</span>
                <input value={s.artist} maxLength={120} placeholder="Artist or creator" onChange={(e) => edit(s.id, { artist: e.target.value })} />
              </label>
            </div>
            <label className="field">
              <span>Link <span className="muted small">optional</span></span>
              <input type="url" value={s.url ?? ""} maxLength={300} placeholder="https://www.tiktok.com/music/…" onChange={(e) => edit(s.id, { url: e.target.value })} />
            </label>
          </li>
        ))}
        {!sounds.length && <li className="muted small">No sounds yet.</li>}
      </ul>
      <button className="btn outline" onClick={() => onChange({ sounds: [...sounds, { id: newId(), title: "", artist: "", url: "" }] })} disabled={sounds.length >= MAX_SOUNDS}>
        <Plus size={16} /> Add sound
      </button>
    </div>
  );
}
