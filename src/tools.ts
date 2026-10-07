import { Clapperboard, Images, type LucideIcon } from "lucide-react";

export interface Tool {
  id: string;
  title: string;
  description: string;
  platform: string;
  path: string;
  icon: LucideIcon;
}

export const PLATFORMS = [{ id: "tiktok", label: "TikTok", icon: Clapperboard }];

export const TOOLS: Tool[] = [
  {
    id: "slideshow-generator",
    title: "Slideshow Generator",
    description: "Generate a 6 to 8 slide TikTok slideshow from the hook, tip and CTA pools, with copy-ready text and a sound.",
    platform: "TikTok",
    path: "/tiktok/slideshow-generator",
    icon: Images,
  },
];
