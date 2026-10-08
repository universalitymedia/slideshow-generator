import { ImageOff } from "lucide-react";

/** A style's preview pictures: the first one large, up to three more as a strip underneath. */
export function PreviewStack({ urls }: { urls: string[] }) {
  if (!urls.length) {
    return (
      <div className="preview empty-preview">
        <ImageOff size={22} />
        <span className="small">No preview yet</span>
      </div>
    );
  }
  const [main, ...more] = urls;
  return (
    <div className="preview-stack">
      <div className="preview" style={{ backgroundImage: `url(${main})` }} role="img" aria-label="" />
      {more.length > 0 && (
        <div className="preview-strip">
          {more.slice(0, 3).map((u) => (
            <div key={u} style={{ backgroundImage: `url(${u})` }} />
          ))}
        </div>
      )}
    </div>
  );
}
