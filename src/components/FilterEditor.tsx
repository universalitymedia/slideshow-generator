import { RotateCcw } from "lucide-react";
import { composeFilter, FILTER_FIELDS, parseFilter } from "../slideshow/styles";

/** Sliders that read and write the CSS filter string, so admins never type it by hand. */
export function FilterEditor({ value, onChange }: { value: string; onChange: (filter: string) => void }) {
  const v = parseFilter(value);
  return (
    <div className="filters">
      {FILTER_FIELDS.map((f) => (
        <label key={f.key} className="slider">
          <span>{f.label}</span>
          <input
            type="range"
            min={f.min}
            max={f.max}
            step={f.step}
            value={v[f.key]}
            onChange={(e) => onChange(composeFilter({ ...v, [f.key]: Number(e.target.value) }))}
          />
          <output>{Math.round(v[f.key] * 100)}%</output>
        </label>
      ))}
      <button className="btn ghost sm" onClick={() => onChange("none")} disabled={value === "none"}>
        <RotateCcw size={14} /> Reset photo filter
      </button>
    </div>
  );
}
