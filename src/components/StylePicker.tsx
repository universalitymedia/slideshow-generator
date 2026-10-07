import { Check } from "lucide-react";
import { previewImage } from "../slideshow/styleUtils";
import type { SlideStyle } from "../slideshow/styles";
import { SlidePreview } from "./SlidePreview";

export function StylePicker({ styles, value, onChange }: { styles: SlideStyle[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="styles" role="radiogroup" aria-label="Style">
      {styles.map((s) => {
        const on = s.id === value;
        return (
          <button key={s.id} role="radio" aria-checked={on} className={`style-card ${on ? "on" : ""}`} onClick={() => onChange(s.id)}>
            <SlidePreview image={previewImage(s)} text={s.previewText} style={s} small />
            <span className="style-name">
              {s.name}
              {on && <Check size={14} />}
            </span>
            {s.blurb && <span className="muted small">{s.blurb}</span>}
          </button>
        );
      })}
    </div>
  );
}
