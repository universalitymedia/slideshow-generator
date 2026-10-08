import { CAPTIONS, CTAS, HASHTAGS, HOOKS, PERSONAS, SOUNDS, TIPS, TOPICS, type PersonaId, type Sound, type TopicId } from "./content";
import { mulberry32, pick, shuffle, type Rand } from "./rng";
import { imagePool, type ImageSource } from "./images";
import { photoSource } from "./styleUtils";
import { slotLabels, type SlideStyle } from "./styles";

export interface Slide {
  kind: "slide" | "cta";
  label: string; // "Slide 2", "CTA"
  text: string; // what the creator copies for this picture
  image: ImageSource;
}

/** What creators paste into TikTok: the bold title and the description (hashtags included). */
export interface PostCaption {
  title: string;
  description: string;
}

export interface Options {
  persona: PersonaId | "any";
  topic: TopicId | "any";
}

export interface Slideshow {
  seed: number;
  opts: Options;
  persona: PersonaId;
  topic: TopicId;
  sound: Sound;
  caption: PostCaption;
  slides: Slide[];
}

/** Topics that have at least one hook for the chosen persona. */
export function topicsFor(persona: PersonaId | "any") {
  return TOPICS.filter((t) => HOOKS.some((h) => h.topic === t.id && (persona === "any" || h.persona === persona)));
}

/** Personas that have at least one hook for the chosen topic. */
export function personasFor(topic: TopicId | "any") {
  return PERSONAS.filter((p) => HOOKS.some((h) => h.persona === p.id && (topic === "any" || h.topic === topic)));
}

/**
 * One slide per position in the style's format. A position with uploaded pictures gets one of them at random,
 * with the text the admin wrote for it. A position with none gets a built-in picture and built-in text, so a
 * fresh style still produces a full slideshow. Same seed, options and style always give the same result.
 */
export function generate(seed: number, opts: Options, style: SlideStyle): Slideshow {
  const rand = mulberry32(seed);

  const hooks = HOOKS.filter(
    (h) => (opts.persona === "any" || h.persona === opts.persona) && (opts.topic === "any" || h.topic === opts.topic),
  );
  const hook = pick(rand, hooks);
  const topical = shuffle(rand, TIPS.filter((t) => t.topic === hook.topic));
  const rest = shuffle(rand, TIPS.filter((t) => t.topic !== hook.topic));
  const tips = [...topical, ...rest].map((t) => t.text);
  const fallbackImages = imagePool(rand, style.format.length);
  const labels = slotLabels(style.format);

  let tipNo = 0;
  let sawFirstSlide = false;
  const slides = style.format.map((slot, i): Slide => {
    const own = style.slides.filter((x) => x.slotId === slot.id);
    const first = slot.kind === "slide" && !sawFirstSlide;
    if (slot.kind === "slide") sawFirstSlide = true;
    // Always draw the fallback so one position's pictures can't shift the random choices of the next.
    const fallbackText = slot.kind === "cta" ? pick(rand, CTAS) : first ? hook.text : `${++tipNo}. ${tips[tipNo - 1] ?? ""}`;
    if (own.length) {
      const chosen = pick(rand, own);
      return { kind: slot.kind, label: labels[i], text: chosen.text, image: photoSource(chosen.url) };
    }
    return { kind: slot.kind, label: labels[i], text: fallbackText, image: fallbackImages[i] };
  });

  return { seed, opts, persona: hook.persona, topic: hook.topic, sound: style.sounds.length ? pick(rand, style.sounds) : pick(rand, SOUNDS), caption: pickCaption(rand, style, hook.topic), slides };
}

/** A caption from the style, or a built-in one for the topic when the style has none. Pass `not` to get a different one. */
export function pickCaption(rand: Rand, style: SlideStyle, topic: TopicId, not?: PostCaption): PostCaption {
  const own = style.captions.map((c): PostCaption => ({ title: c.title, description: c.text }));
  const pool = own.length
    ? own
    : CAPTIONS.filter((c) => c.topic === topic).map((c): PostCaption => ({ title: c.title, description: `${c.text} ${HASHTAGS[c.topic].join(" ")}` }));
  const others = pool.filter((c) => !not || c.title !== not.title || c.description !== not.description);
  return pick(rand, others.length ? others : pool);
}

export const personaLabel = (id: PersonaId) => PERSONAS.find((p) => p.id === id)!.label;
export const topicLabel = (id: TopicId) => TOPICS.find((t) => t.id === id)!.label;
export const soundUrl = (s: Sound) => s.url ?? `https://www.tiktok.com/search?q=${encodeURIComponent(`${s.title} ${s.artist}`.trim())}`;
