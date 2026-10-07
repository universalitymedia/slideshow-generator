import { Check } from "lucide-react";
import { sampleImage } from "../slideshow/images";
import { STYLES, type SlideStyle } from "../slideshow/styles";
import { SlidePreview } from "./SlidePreview";

const SAMPLE = "1. Turn location off for your camera";

export function StylePicker({ value, onChange }: { value: SlideStyle; onChange: (s: SlideStyle) => void }) {
  return (
    <div className="styles" role="radiogroup" aria-label="Style">
      {STYLES.map((s) => {
        const on = s.id === value.id;
        return (
          <button key={s.id} role="radio" aria-checked={on} className={`style-card ${on ? "on" : ""}`} onClick={() => onChange(s)}>
            <SlidePreview image={sampleImage} text={SAMPLE} style={s} small />
            <span className="style-name">
              {s.name}
              {on && <Check size={14} />}
            </span>
            <span className="muted small">{s.blurb}</span>
          </button>
        );
      })}
    </div>
  );
}
