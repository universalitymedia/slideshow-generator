import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "../api";

/** Upload one or more pictures, then hand the new urls back. Files that fail are reported, the rest still go through. */
export function Uploader({ label = "Add pictures", max, onUploaded, onError }: {
  label?: string;
  max?: number; // how many more pictures are allowed
  onUploaded: (urls: string[]) => void;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, max ?? files.length);
    if (max !== undefined && files.length > max) onError(`Only ${max} more ${max === 1 ? "picture fits" : "pictures fit"} here, so the rest were skipped.`);
    setBusy(true);
    const urls: string[] = [];
    for (const file of list) {
      try {
        urls.push((await api.upload(file)).url);
      } catch (e) {
        onError(`${file.name}: ${(e as Error).message}`);
      }
    }
    if (urls.length) onUploaded(urls);
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <label className={`upload ${busy ? "busy" : ""} ${max === 0 ? "full" : ""}`}>
      <ImagePlus size={20} />
      <span>{busy ? "Uploading…" : label}</span>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden disabled={busy || max === 0} onChange={(e) => upload(e.target.files)} />
    </label>
  );
}
