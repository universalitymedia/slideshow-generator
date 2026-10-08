import { zipSync } from "fflate";
import { ChevronDown, Copy, Download, ExternalLink, Images, Music2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { CaptionCard } from "../components/CaptionCard";
import { StylePicker } from "../components/StylePicker";
import { SlideCard } from "../components/SlideCard";
import type { PersonaId, TopicId } from "../slideshow/content";
import type { SlideStyle } from "../slideshow/styles";
import {
  generate,
  pickCaption,
  personasFor,
  soundUrl,
  topicsFor,
  type Options,
  type PostCaption,
} from "../slideshow/generate";
import { imageFile } from "../slideshow/images";
import { newSeed } from "../slideshow/rng";
import { TOOLS } from "../tools";

const tool = TOOLS[0];

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const seedId = (seed: number) => seed.toString(16).padStart(8, "0");

export function SlideshowGenerator() {
  const [styles, setStyles] = useState<SlideStyle[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [styleId, setStyleId] = useState("");
  const [opts, setOpts] = useState<Options>({ persona: "any", topic: "any" });
  // What the last click on Generate used. Changing the style afterwards builds the same slideshow from the new style.
  const [params, setParams] = useState<{ seed: number; opts: Options } | null>(null);
  const [captionPick, setCaptionPick] = useState<{ key: string; caption: PostCaption } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    api.styles().then((r) => { setStyles(r.styles); setStyleId(r.styles[0]?.id ?? ""); }).catch((e) => setLoadError(e.message));
  }, []);

  const style: SlideStyle | undefined = styles?.find((s) => s.id === styleId) ?? styles?.[0];
  const generated = useMemo(() => (params && style ? generate(params.seed, params.opts, style) : null), [params, style]);
  const caption = generated && captionPick?.key === `${generated.seed}-${generated.topic}` ? captionPick.caption : generated?.caption;
  const show = generated && caption ? { ...generated, caption } : null;

  // Only offer combinations that have at least one hook.
  const topics = useMemo(() => topicsFor(opts.persona), [opts.persona]);
  const personas = useMemo(() => personasFor(opts.topic), [opts.topic]);

  const run = () => { setCaptionPick(null); setParams({ seed: newSeed(), opts: { ...opts } }); };
  const allText = () => show!.slides.map((s) => s.text).filter(Boolean).join("\n\n");

  async function copyAll() {
    await navigator.clipboard.writeText(allText());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }

  const usesBuiltIn = !!show && show.slides.some((s) => s.image.kind === "scene" || !s.image.url.startsWith("/uploads/"));
  const fileName = (i: number, ext: string) => `slide-${String(i + 1).padStart(2, "0")}.${ext}`;

  async function downloadAll() {
    if (!show) return;
    setBusy(true);
    try {
      const files: Record<string, Uint8Array> = {};
      for (const [i, s] of show.slides.entries()) {
        const { blob, ext } = await imageFile(s.image);
        files[fileName(i, ext)] = new Uint8Array(await blob.arrayBuffer());
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
        <span className="tile lg"><img src={tool.iconSrc} alt="" /></span>
        <div>
          <h1>{tool.title}</h1>
          <p className="muted">{tool.description}</p>
        </div>
      </header>

      <section className="card panel">
        <div className="panel-head">
          <div>
            <h2>Style</h2>
            <p className="muted small">Pick a style. Each card previews what it makes.</p>
          </div>
          <button className="btn primary" onClick={run} disabled={!style}>
            <Sparkles size={16} /> {show ? "Regenerate" : "Generate slideshow"}
          </button>
        </div>

        {styles && style ? <StylePicker styles={styles} value={style.id} onChange={setStyleId} /> : <p className="muted">{loadError || "Loading styles…"}</p>}

        <details className="more">
          <summary><ChevronDown size={16} /> Story options</summary>
          <p className="muted small more-hint">These only shape the built-in text and the caption. Positions with uploaded pictures use the text written for them.</p>
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
            <span className="muted small">
              {show.slides.length} slides · #{seedId(show.seed)} ·{" "}
              {usesBuiltIn ? "Some positions have no uploaded picture yet, so they use built-in ones." : "Copy the text for each picture, then add it in TikTok."}
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
                index={i}
                onCopy={() => navigator.clipboard.writeText(s.text)}
                onDownload={async () => { const { blob, ext } = await imageFile(s.image); save(blob, fileName(i, ext)); }}
              />
            ))}
          </section>

          <CaptionCard
            caption={show.caption}
            onShuffle={() => setCaptionPick({ key: `${show.seed}-${show.topic}`, caption: pickCaption(Math.random, style!, show.topic, show.caption) })}
          />
        </>
      )}
    </div>
  );
}

