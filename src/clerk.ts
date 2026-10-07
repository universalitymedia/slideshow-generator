import { dark } from "@clerk/ui/themes";

// Publishable keys are safe to ship in front-end code. VITE_CLERK_PUBLISHABLE_KEY overrides the default,
// e.g. to point a deployment at a production Clerk instance.
export const publishableKey: string | undefined =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "pk_test_cmVhbC13aGlwcGV0LTI5MTMuY2xlcmsuYWNjb3VudHMuZGV2JA";

// Same palette as the rest of the app.
export const appearance = {
  theme: dark,
  variables: {
    colorBackground: "#141414",
    colorInputBackground: "#0a0a0a",
    colorPrimary: "#fafafa",
    colorForeground: "#fafafa",
    colorMutedForeground: "#a1a1a1",
    colorPrimaryForeground: "#0a0a0a",
    colorNeutral: "#fafafa",
    borderRadius: "10px",
  },
};
