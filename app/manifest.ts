import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Subidha Admin",
    short_name: "Subidha",
    description: "Operations console for Subidha — manage bookings, professionals, catalogue and offers.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#FBF8FE",
    theme_color: "#4A2FBD",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Bookings", url: "/bookings", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Unassigned bookings", url: "/bookings?unassigned=true", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Professionals", url: "/providers", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
