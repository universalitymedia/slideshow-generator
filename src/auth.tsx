import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Me } from "./api";

interface AuthState {
  user: Me | null;
  loading: boolean;
  config: { discord: boolean; devLogin: boolean } | null;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState>({ user: null, loading: true, config: null, signOut: async () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [config, setConfig] = useState<AuthState["config"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.me().then((r) => setUser(r.user)), api.config().then(setConfig)])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const signOut = useCallback(async () => {
    await api.logout().catch(() => {});
    setUser(null);
    window.location.hash = "";
  }, []);

  return <Ctx.Provider value={{ user, loading, config, signOut }}>{children}</Ctx.Provider>;
}
