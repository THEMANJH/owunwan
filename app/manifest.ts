import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "오운완 - 운동 기록 앱",
    short_name: "오운완",
    description: "운동 기록과 공유를 위한 PWA 앱",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#007AFF",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
