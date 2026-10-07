import { CAPTIONS, CTAS, HASHTAGS, HOOKS, PERSONAS, SOUNDS, TIPS, TOPICS, type Caption, type PersonaId, type Sound, type TopicId } from "./content";
import { mulberry32, pick, shuffle, type Rand } from "./rng";
import { imagePool, type ImageSource } from "./images";
import { photoSource } from "./styleUtils";
import type { SlideStyle } from "./styles";

export type SlideKind = "hook" | "tip" | "cta";

export interface Slide {
  kind: SlideKind;
  text: string;
  image: ImageSource;
}

export interface Options {
  persona: PersonaId | "any";
  topic: TopicId | "any";
  slides: number | "random"; // 6 to 8, hook and CTA included
}

export interface Slideshow {
  seed: number;
  opts: Options;
  persona?: PersonaId; // not set when the hook comes from a style's own items
  topic: TopicId;
  sound: Sound;
  caption: Caption;
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

const texts = (style: SlideStyle, type: "hook" | "tip" | "cta") => style.items.filter((i) => i.type === type && i.text).map((i) => i.text!);

/**
 * Same seed, options and style always give the same slideshow.
 * A style's own hooks, CTAs and photos replace the built-in ones. Its own tips come first and the built-in tips fill any gap.
 */
export function generate(seed: number, opts: Options, style: SlideStyle): Slideshow {
  const rand = mulberry32(seed);

  const ownHooks = texts(style, "hook");
  let hookText: string;
  let persona: PersonaId | undefined;
  let topic: TopicId;
  if (ownHooks.length) {
    hookText = pick(rand, ownHooks);
    topic = opts.topic === "any" ? pick(rand, TOPICS).id : opts.topic;
  } else {
    const hooks = HOOKS.filter(
      (h) => (opts.persona === "any" || h.persona === opts.persona) && (opts.topic === "any" || h.topic === opts.topic),
    );
    const hook = pick(rand, hooks);
    ({ text: hookText, persona, topic } = hook);
  }

  const total = opts.slides === "random" ? 6 + Math.floor(rand() * 3) : opts.slides;
  const tipCount = total - 2;

  const own = shuffle(rand, texts(style, "tip"));
  const topical = shuffle(rand, TIPS.filter((t) => t.topic === topic).map((t) => t.text));
  const rest = shuffle(rand, TIPS.filter((t) => t.topic !== topic).map((t) => t.text));
  const tips = [...own, ...topical, ...rest].slice(0, tipCount);

  const ownCtas = texts(style, "cta");
  const photos = style.items.filter((i) => i.type === "photo" && i.url).map(photoSource);
  const images = imagePool(rand, total, photos);
  const slides: Slide[] = [
    { kind: "hook", text: hookText, image: images[0] },
    ...tips.map((t, i): Slide => ({ kind: "tip", text: `${i + 1}. ${t}`, image: images[i + 1] })),
    { kind: "cta", text: pick(rand, ownCtas.length ? ownCtas : CTAS), image: images[total - 1] },
  ];

  return { seed, opts, persona, topic, sound: pick(rand, SOUNDS), caption: pickCaption(rand, topic), slides };
}

/** A caption for the topic. Pass `not` to get a different one when shuffling. */
export function pickCaption(rand: Rand, topic: TopicId, not?: Caption): Caption {
  const options = CAPTIONS.filter((c) => c.topic === topic && c !== not);
  return pick(rand, options);
}

export const captionDescription = (c: Caption) => `${c.text} ${HASHTAGS[c.topic].join(" ")}`;

export const personaLabel = (id: PersonaId) => PERSONAS.find((p) => p.id === id)!.label;
export const topicLabel = (id: TopicId) => TOPICS.find((t) => t.id === id)!.label;
export const soundUrl = (s: Sound) => `https://www.tiktok.com/search?q=${encodeURIComponent(`${s.title} ${s.artist}`)}`;
