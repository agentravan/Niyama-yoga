// Downloads the CC0 site photos listed in lib/photos.json into public/images.
// Never fails the build: missing photos simply aren't advertised to the app.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const photos = JSON.parse(readFileSync(join(root, "lib/photos.json"), "utf8"));
const outDir = join(root, "public/images");
mkdirSync(outDir, { recursive: true });

const ok = [];
await Promise.all(
  Object.entries(photos).map(async ([key, p]) => {
    const dest = join(outDir, p.file);
    if (existsSync(dest)) return ok.push(key);
    try {
      const res = await fetch(p.url, {
        headers: { "user-agent": "NiyamaYogaSite/1.0 (+https://niyama-yoga.vercel.app)" },
        signal: AbortSignal.timeout(20_000),
      });
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok || !type.startsWith("image/")) throw new Error(`${res.status} ${type}`);
      writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      ok.push(key);
    } catch (e) {
      console.warn(`[images] ${key}: download failed (${e.message}) — using fallback design`);
    }
  }),
);

writeFileSync(join(outDir, "manifest.json"), JSON.stringify(ok.sort()));
console.log(`[images] ${ok.length}/${Object.keys(photos).length} photos ready`);
