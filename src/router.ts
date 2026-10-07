import { useEffect, useState } from "react";

// Hash routing keeps this deployable on any static host.
const current = () => window.location.hash.replace(/^#/, "") || "/";

export function useRoute() {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const onChange = () => setRoute(current());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export const href = (path: string) => `#${path}`;
export const go = (path: string) => { window.location.hash = path; };
