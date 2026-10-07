import { CAPTIONS, CTAS, HASHTAGS, HOOKS, PERSONAS, SOUNDS, TIPS, TOPICS, type Caption, type PersonaId, type Sound, type TopicId } from "./content";
import { mulberry32, pick, shuffle, type Rand } from "./rng";
import { imagePool, type ImageSource } from "./images";

export type SlideKind = "hook" | "tip" | "cta";

export interface Slide {
  kind: SlideKind;
  text: string;
  image: ImageSource;
}

export interface Slideshow {
  seed: number;
  persona: PersonaId;
  topic: TopicId;
  sound: Sound;
  caption: Caption;
  slides: Slide[];
}

export interface Options {
  persona: PersonaId | "any";
  topic: TopicId | "any";
  slides: number | "random"; // 6 to 8, hook and CTA included
}

/** Topics that have at least one hook for the chosen persona. */
export function topicsFor(persona: PersonaId | "any") {
  return TOPICS.filter((t) => HOOKS.some((h) => h.topic === t.id && (persona === "any" || h.persona === persona)));
}

/** Personas that have at least one hook for the chosen topic. */
export function personasFor(topic: TopicId | "any") {
  return PERSONAS.filter((p) => HOOKS.some((h) => h.persona === p.id && (topic === "any" || h.topic === topic)));
}

export function generate(seed: number, opts: Options): Slideshow {
  const rand = mulberry32(seed);

  const hooks = HOOKS.filter(
    (h) => (opts.persona === "any" || h.persona === opts.persona) && (opts.topic === "any" || h.topic === opts.topic),
  );
  const hook = pick(rand, hooks);

  const total = opts.slides === "random" ? 6 + Math.floor(rand() * 3) : opts.slides;
  const tipCount = total - 2;

  // Tips come from the hook's topic. If a topic ever has too few, borrow from others.
  const own = shuffle(rand, TIPS.filter((t) => t.topic === hook.topic));
  const rest = shuffle(rand, TIPS.filter((t) => t.topic !== hook.topic));
  const tips = [...own, ...rest].slice(0, tipCount);

  const images = imagePool(rand, total);
  const slides: Slide[] = [
    { kind: "hook", text: hook.text, image: images[0] },
    ...tips.map((t, i): Slide => ({ kind: "tip", text: `${i + 1}. ${t.text}`, image: images[i + 1] })),
    { kind: "cta", text: pick(rand, CTAS), image: images[total - 1] },
  ];

  return { seed, persona: hook.persona, topic: hook.topic, sound: pick(rand, SOUNDS), caption: pickCaption(rand, hook.topic), slides };
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
