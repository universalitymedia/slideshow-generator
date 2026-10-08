/** Copy text. Falls back to a hidden textarea where the async clipboard API is missing or blocked. Throws if both fail. */
export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Not a secure context, or permission denied. Try the old way below.
  }
  const area = Object.assign(document.createElement("textarea"), { value: text });
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  document.body.append(area);
  area.select();
  try {
    if (!document.execCommand("copy")) throw new Error("Copy was blocked by the browser");
  } finally {
    area.remove();
  }
}

/** Hand a file to the browser as a download. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
