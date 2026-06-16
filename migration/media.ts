/**
 * Download every original image in the manifest into src/assets/images, mirroring
 * the WP uploads path, and optimize to a reasonable max width with sharp. Logs
 * (does not silently skip) any image that 404s so gaps can be filled by hand.
 *
 *   npm run extract:media   (run after extract.ts / podcast.ts)
 */
import fs from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import sharp from "sharp";
import { ROOT, IMAGES_DIR, localImagePath } from "./lib";

const MAX_WIDTH = 1600; // originals run up to ~2925px; cap for web.

async function downloadOne(url: string): Promise<"ok" | "skip" | "fail"> {
  const local = localImagePath(url);
  if (!local) return "skip";
  if (fs.existsSync(local.abs)) return "ok";

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ! ${res.status} ${url}`);
      return "fail";
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(local.abs), { recursive: true });

    const ext = path.extname(local.abs).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
      // Downscale oversized images; keep format. Strips metadata too.
      const img = sharp(buf);
      const meta = await img.metadata();
      if ((meta.width ?? 0) > MAX_WIDTH) {
        await img.resize({ width: MAX_WIDTH }).toFile(local.abs);
      } else {
        fs.writeFileSync(local.abs, buf);
      }
    } else {
      fs.writeFileSync(local.abs, buf);
    }
    return "ok";
  } catch (e) {
    console.warn(`  ! error ${url}: ${(e as Error).message}`);
    return "fail";
  }
}

async function run() {
  const manifestPath = path.join(ROOT, "migration", ".cache", "image-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("No image-manifest.json — run `npm run extract` first.");
  }
  const urls: string[] = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  console.log(`Downloading ${urls.length} images -> ${path.relative(ROOT, IMAGES_DIR)}`);

  const limit = pLimit(6);
  const results = await Promise.all(urls.map((u) => limit(() => downloadOne(u))));

  const ok = results.filter((r) => r === "ok").length;
  const fail = results.filter((r) => r === "fail").length;
  console.log(`\nImages: ${ok} ok, ${fail} failed (logged above).`);
  if (fail > 0) console.log("Fill failed images by hand or re-run; references already point at the local path.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
