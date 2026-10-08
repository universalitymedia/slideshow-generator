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
    description: "Generate a TikTok slideshow from a style's pictures, with copy-ready text for every slide, a caption and a sound.",
    platform: "TikTok",
    path: "/tiktok/slideshow-generator",
    iconSrc: liftly,
  },
];
