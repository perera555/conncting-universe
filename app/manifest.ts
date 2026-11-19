import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Connecting Universe",
    short_name: "Universe",
    description: "Visualize your goal, get a dated plan, and invite the universe to help. සිංහල · English · தமிழ்",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#07051a",
    theme_color: "#07051a",
    lang: "si",
    categories: ["lifestyle", "productivity", "education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "සිංහල", url: "/" },
      { name: "English", url: "/en" },
      { name: "தமிழ்", url: "/ta" },
    ],
  };
}
