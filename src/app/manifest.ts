import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DIARRABA Volailles",
    short_name: "DIARRABA",
    description: "Système premium de gestion de stock et éclosion - Diarraba Volailles",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0B10",
    theme_color: "#E05A10",
    orientation: "portrait",
    icons: [
      {
        src: "/logo.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/logo.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/logo.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "maskable",
      },
      {
        src: "/logo.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      }
    ],
  };
}
