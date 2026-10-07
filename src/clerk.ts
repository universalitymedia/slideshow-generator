import { dark } from "@clerk/ui/themes";

export const publishableKey: string | undefined = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
