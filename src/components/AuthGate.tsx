import { useAuth } from "@clerk/react";
import type { ReactNode } from "react";
import { Login } from "../pages/Login";

/** Only signed-in creators see the tools. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="auth-page"><span className="spinner" aria-label="Loading" /></div>;
  return isSignedIn ? <>{children}</> : <Login />;
}
