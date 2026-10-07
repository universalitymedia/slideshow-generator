import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { SlideshowGenerator } from "./pages/SlideshowGenerator";
import { useRoute } from "./router";
import { TOOLS } from "./tools";

export function App() {
  const route = useRoute();
  const tool = TOOLS.find((t) => t.path === route);

  useEffect(() => {
    document.title = tool ? `${tool.title} · Warden Creator Tools` : "Dashboard · Warden Creator Tools";
  }, [tool]);

  return (
    <Layout route={route}>
      {route === "/tiktok/slideshow-generator" ? <SlideshowGenerator /> : <Dashboard />}
    </Layout>
  );
}
