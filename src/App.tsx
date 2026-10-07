import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { useAuth } from "./auth";
import { AdminStyles } from "./pages/AdminStyles";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { SlideshowGenerator } from "./pages/SlideshowGenerator";
import { StyleEditor } from "./pages/StyleEditor";
import { useRoute } from "./router";
import { TOOLS } from "./tools";

export function App() {
  const route = useRoute();
  const { user, loading } = useAuth();
  const tool = TOOLS.find((t) => t.path === route);

  useEffect(() => {
    document.title = tool ? `${tool.title} · Universality Tool's` : "Universality Tool's";
  }, [tool]);

  if (loading) return <div className="auth-page"><span className="spinner" aria-label="Loading" /></div>;
  if (!user) return <Login />;

  const editing = route.match(/^\/admin\/styles\/([A-Za-z0-9-]+)$/);
  let page = <Dashboard />;
  if (route === "/tiktok/slideshow-generator") page = <SlideshowGenerator />;
  else if (user.isAdmin && editing) page = <StyleEditor id={editing[1]} />;
  else if (user.isAdmin && route === "/admin") page = <AdminStyles />;

  return <Layout route={route}>{page}</Layout>;
}
