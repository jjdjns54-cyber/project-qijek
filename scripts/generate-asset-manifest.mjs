import { readdir, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

const root = resolve("public/assets");
const output = join(root, "manifest.json");
const mediaExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : path;
    }),
  );
  return files.flat();
}

const assets = (await walk(root))
  .filter((path) => mediaExtensions.has(extname(path).toLowerCase()))
  .map((path) => `/assets/${relative(root, path).split(sep).join("/")}`)
  .sort();

await writeFile(output, `${JSON.stringify(assets, null, 2)}\n`);
