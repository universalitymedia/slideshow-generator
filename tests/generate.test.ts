import { describe, expect, it } from "vitest";
import { generate } from "../src/slideshow/generate.ts";
import { slotLabels, type FormatSlot, type SlideStyle } from "../src/slideshow/styles.ts";
import { TIPS } from "../src/slideshow/content.ts";

const style = (format: FormatSlot[]): SlideStyle => ({ id: "s", rev: 1, name: "S", blurb: "", previews: [], format, slides: [], captions: [], sounds: [] });
const library = { rev: 1, captions: [], sounds: [] };
const opts = { persona: "any", topic: "any" } as const;
const slot = (i: number, kind: FormatSlot["kind"] = "slide"): FormatSlot => ({ id: `s${i}`, kind });

describe("generate", () => {
  it("is deterministic for the same seed", () => {
    const s = style([slot(1), slot(2), slot(3, "cta")]);
    expect(generate(7, opts, s, library)).toEqual(generate(7, opts, s, library));
  });
  it("never leaves a built-in tip empty, even when the format is longer than the tip list", () => {
    const format = Array.from({ length: TIPS.length + 6 }, (_, i) => slot(i));
    const { slides } = generate(3, opts, style(format), library);
    expect(slides).toHaveLength(format.length);
    for (const s of slides) expect(s.text.replace(/^\d+\.\s*/, "").trim()).not.toBe("");
  });
  it("numbers positions and labels CTAs", () => {
    expect(slotLabels([slot(1), slot(2, "cta"), slot(3)])).toEqual(["Slide 1", "CTA", "Slide 2"]);
  });
});
