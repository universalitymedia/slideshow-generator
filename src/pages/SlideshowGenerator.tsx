import { zipSync } from "fflate";
import { ChevronDown, Copy, Download, ExternalLink, Images, Music2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { CaptionCard } from "../components/CaptionCard";
import { StylePicker } from "../components/StylePicker";
import { SlideCard } from "../components/SlideCard";
import type { PersonaId, TopicId } from "../slideshow/content";
import {
  generate,
  personaLabel,
  pickCaption,
  personasFor,
  soundUrl,
  topicLabel,
  topicsFor,
  type Options,
  type Slideshow,
} from "../slideshow/generate";
import { renderBlob, usingRealPhotos } from "../slideshow/images";
import { newSeed } from "../slideshow/rng";
import { DEFAULT_STYLE, type SlideStyle } from "../slideshow/styles";
import { TOOLS } from "../tools";

const tool = TOOLS[0];
const SLIDE_CHOICES: Options["slides"][] = ["random", 6, 7, 8];

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const seedId = (seed: number) => seed.toString(16).padStart(8, "0");

export function SlideshowGenerator() {
  const [opts, setOpts] = useState<Options>({ persona: "any", topic: "any", slides: "random" });
  const [show, setShow] = useState<Slideshow | null>(null);
  const [style, setStyle] = useState<SlideStyle>(DEFAULT_STYLE);
  const [busy, setBusy] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Only offer combinations that have at least one hook.
  const topics = useMemo(() => topicsFor(opts.persona), [opts.persona]);
  const personas = useMemo(() => personasFor(opts.topic), [opts.topic]);

  const run = () => setShow(generate(newSeed(), opts));
  const allText = () => show!.slides.map((s) => s.text).join("\n\n");

  async function copyAll() {
    await navigator.clipboard.writeText(allText());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }

  async function downloadAll() {
    if (!show) return;
    setBusy(true);
    try {
      const files: Record<string, Uint8Array> = {};
      for (const [i, s] of show.slides.entries()) {
        files[`slide-${String(i + 1).padStart(2, "0")}.png`] = new Uint8Array(await (await renderBlob(s.image, style.filter)).arrayBuffer());
      }
      files["captions.txt"] = new TextEncoder().encode(allText());
      save(new Blob([zipSync(files, { level: 0 }) as BlobPart], { type: "application/zip" }), `slideshow-${seedId(show.seed)}.zip`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page wide">
      <header className="tool-header">
        <span className="tile lg"><tool.icon size={22} /></span>
        <div>
          <h1>{tool.title}</h1>
          <p className="muted">{tool.description}</p>
        </div>
      </header>

      <section className="card panel">
        <div className="panel-head">
          <div>
            <h2>Style</h2>
            <p className="muted small">Pick a look. Each preview shows exactly how your slides will be styled.</p>
          </div>
          <button className="btn primary" onClick={run}>
            <Sparkles size={16} /> {show ? "Regenerate" : "Generate slideshow"}
          </button>
        </div>

        <StylePicker value={style} onChange={setStyle} />

        <details className="more">
          <summary><ChevronDown size={16} /> Story options</summary>
          <div className="controls">
            <label className="field">
              <span>Told by</span>
              <select value={opts.persona} onChange={(e) => setOpts({ ...opts, persona: e.target.value as PersonaId | "any" })}>
                <option value="any">Anyone</option>
                {personas.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </label>

            <label className="field">
              <span>Topic</span>
              <select value={opts.topic} onChange={(e) => setOpts({ ...opts, topic: e.target.value as TopicId | "any" })}>
                <option value="any">Any theme</option>
                {topics.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>

            <div className="field">
              <span>Slides</span>
              <div className="segmented" role="group" aria-label="Slides">
                {SLIDE_CHOICES.map((n) => (
                  <button key={n} className={opts.slides === n ? "on" : ""} onClick={() => setOpts({ ...opts, slides: n })}>
                    {n === "random" ? "Random" : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </details>
      </section>

      {!show ? (
        <section className="empty">
          <span className="tile lg round"><Images size={22} /></span>
          <h3>No slideshow yet</h3>
          <p className="muted">Leave theme and slides on random for a surprise, or pick them, then hit Generate.</p>
        </section>
      ) : (
        <>
          <section className="card sound">
            <span className="tile"><Music2 size={20} /></span>
            <div>
              <strong>{show.sound.title}</strong>
              <p className="muted">{show.sound.artist}</p>
            </div>
            <a className="btn outline push" href={soundUrl(show.sound)} target="_blank" rel="noreferrer">
              Open on TikTok <ExternalLink size={14} />
            </a>
          </section>

          <section className="result-head">
            <span className="chip solid">{personaLabel(show.persona)}</span>
            <span className="chip">{topicLabel(show.topic)}</span>
            <span className="muted small">
              {show.slides.length} slides · #{seedId(show.seed)} ·{" "}
              {usingRealPhotos ? "Text is a preview: the photos download without it, with the style's filter applied." : "Placeholder scenes. Add photos to src/assets/photos to use your own."}
            </span>
            <div className="push row">
              <button className="btn outline" onClick={downloadAll} disabled={busy}>
                <Download size={16} /> {busy ? "Preparing…" : "Download all images"}
              </button>
              <button className="btn ghost" onClick={copyAll}>
                <Copy size={16} /> {copiedAll ? "Copied" : "Copy all text"}
              </button>
            </div>
          </section>

          <section className="slides">
            {show.slides.map((s, i) => (
              <SlideCard
                key={`${show.seed}-${i}`}
                slide={s}
                style={style}
                index={i}
                onCopy={() => navigator.clipboard.writeText(s.text)}
                onDownload={async () => save(await renderBlob(s.image, style.filter), `slide-${String(i + 1).padStart(2, "0")}.png`)}
              />
            ))}
          </section>

          <CaptionCard
            caption={show.caption}
            onShuffle={() => setShow({ ...show, caption: pickCaption(Math.random, show.topic, show.caption) })}
          />
        </>
      )}
    </div>
  );
}

