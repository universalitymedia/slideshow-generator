import type { Library, SlideStyle } from "./slideshow/styles";

async function request<T>(method: string, url: string, body?: unknown, raw?: Blob): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: raw ? { "content-type": raw.type } : body ? { "content-type": "application/json" } : undefined,
    body: raw ?? (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export interface Me {
  id: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
}

export const api = {
  me: () => request<{ user: Me | null }>("GET", "/api/me"),
  config: () => request<{ discord: boolean; devLogin: boolean }>("GET", "/api/config"),
  logout: () => request<{ ok: true }>("POST", "/auth/logout"),
  styles: () => request<{ styles: SlideStyle[] }>("GET", "/api/styles"),
  library: () => request<{ library: Library }>("GET", "/api/library"),
  saveLibrary: (library: Library) => request<{ library: Library }>("PUT", "/api/admin/library", library),
  createStyle: (style?: Partial<SlideStyle>) => request<{ style: SlideStyle }>("POST", "/api/admin/styles", style ?? {}),
  saveStyle: (style: SlideStyle) => request<{ style: SlideStyle }>("PUT", `/api/admin/styles/${style.id}`, style),
  deleteStyle: (id: string) => request<{ ok: true }>("DELETE", `/api/admin/styles/${id}`),
  upload: (file: File) => request<{ url: string }>("POST", "/api/admin/uploads", undefined, file),
};
