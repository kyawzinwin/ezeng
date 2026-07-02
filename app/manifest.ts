import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

// Web app manifest — makes EzEng installable on phones (Myanmar users are
// overwhelmingly mobile) and improves the mobile search/PWA experience.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EzEng — Learn English for Myanmar speakers",
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#fdf6ec",
    theme_color: "#e2725b",
    lang: "en",
    categories: ["education", "books"],
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
