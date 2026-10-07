import { Clapperboard } from "lucide-react";
import liftly from "./assets/brand/liftly.png";

export interface Tool {
  id: string;
  title: string;
  description: string;
  platform: string;
  path: string;
  iconSrc: string;
}

export const PLATFORMS = [{ id: "tiktok", label: "TikTok", icon: Clapperboard }];

export const TOOLS: Tool[] = [
  {
    id: "slideshow-generator",
    title: "Liftly Slideshow Generator",
    description: "Generate a 6 to 8 slide TikTok slideshow from the hook, tip and CTA pools, with copy-ready text and a sound.",
    platform: "TikTok",
    path: "/tiktok/slideshow-generator",
    iconSrc: liftly,
  },
];
