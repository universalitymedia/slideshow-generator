import { useEffect } from "react";
import { AuthGate } from "./components/AuthGate";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { SlideshowGenerator } from "./pages/SlideshowGenerator";
import { useRoute } from "./router";
import { TOOLS } from "./tools";

export function App() {
  const route = useRoute();
  const tool = TOOLS.find((t) => t.path === route);

  useEffect(() => {
    document.title = tool ? `${tool.title} · Universality Tool's` : "Dashboard · Universality Tool's";
  }, [tool]);

  return (
    <AuthGate>
      <Layout route={route}>
        {route === "/tiktok/slideshow-generator" ? <SlideshowGenerator /> : <Dashboard />}
      </Layout>
    </AuthGate>
  );
}
