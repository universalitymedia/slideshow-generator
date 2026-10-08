import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { useAuth } from "./auth";
import { AdminLibrary } from "./pages/AdminLibrary";
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
    document.title = tool ? `${tool.title} · Universality Tools` : "Universality Tools";
  }, [tool]);

  if (loading) return <div className="auth-page"><span className="spinner" aria-label="Loading" /></div>;
  if (!user) return <Login />;

  const editing = route.match(/^\/admin\/styles\/([A-Za-z0-9-]+)$/);
  let page = <Dashboard />;
  if (route === "/tiktok/slideshow-generator") page = <SlideshowGenerator />;
  else if (user.isAdmin && editing) page = <StyleEditor id={editing[1]} />;
  else if (user.isAdmin && route === "/admin") page = <AdminStyles />;
  else if (user.isAdmin && route === "/admin/captions") page = <AdminLibrary kind="captions" />;
  else if (user.isAdmin && route === "/admin/music") page = <AdminLibrary kind="sounds" />;

  return <Layout route={route}>{page}</Layout>;
}
