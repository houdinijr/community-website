import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Congolese Community in Zimbabwe",
    short_name: "CECAU",
    description:
      "Building belonging, leadership, and shared progress in Christ for the Congolese community in Zimbabwe.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4FAFF",
    theme_color: "#1C75BC",
    orientation: "portrait",
    lang: "en",
    icons: [
      {
        src: "/images/cecau-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/cecau-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
