import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev the browser talks to Vite (5173), which forwards API, auth and uploads to the Node server.
const server = "http://localhost:8787";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": server, "/auth": server, "/uploads": server } },
});
