import { existsSync, readFileSync } from "node:fs";
import type { NextConfig } from "next";

// Written by scripts/fetch-images.mjs: the photo keys that downloaded successfully.
const manifest = "public/images/manifest.json";
const photos: string[] = existsSync(manifest) ? JSON.parse(readFileSync(manifest, "utf8")) : [];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: { NEXT_PUBLIC_PHOTOS: photos.join(",") },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Camera & microphone are needed for the embedded live class room.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), display-capture=(self), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
