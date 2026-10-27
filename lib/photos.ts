import photos from "./photos.json";

// Site photography: CC0 / public-domain images found via Openverse (no
// attribution required). scripts/fetch-images.mjs downloads them into
// public/images before dev/build; next.config.ts exposes which ones arrived
// as NEXT_PUBLIC_PHOTOS so a failed download falls back to the illustrated
// design instead of a broken image.

export type PhotoKey = keyof typeof photos;

const available = new Set((process.env.NEXT_PUBLIC_PHOTOS ?? "").split(",").filter(Boolean));

export function getPhoto(key: PhotoKey) {
  if (!available.has(key)) return null;
  const p = photos[key];
  return { src: `/images/${p.file}`, alt: p.alt };
}
