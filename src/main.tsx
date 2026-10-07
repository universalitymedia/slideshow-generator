import { ClerkProvider } from "@clerk/react";
import { ui } from "@clerk/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { SetupNeeded } from "./pages/SetupNeeded";
import { appearance, publishableKey } from "./clerk";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey} ui={ui} appearance={appearance} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <SetupNeeded />
    )}
  </StrictMode>,
);
