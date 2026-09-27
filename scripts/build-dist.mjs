import { cp, mkdir, rm, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const distDirectory = join(projectRoot, "dist");

const runtimeEntries = [
  "index.html",
  "card-master-base.js",
  "css",
  "js",
  "Cards",
  "assets/card-thumbnails",
  "assets/backgrounds/cosmic.webp",
  "assets/backgrounds/wood.webp",
];

function resolveInsideProject(relativePath) {
  const absolutePath = resolve(projectRoot, relativePath);
  const projectRelativePath = relative(projectRoot, absolutePath);
  if (projectRelativePath.startsWith("..") || projectRelativePath === "") {
    throw new Error(`Project外のパスは使用できません: ${relativePath}`);
  }
  return absolutePath;
}

async function copyRuntimeEntry(relativePath) {
  const source = resolveInsideProject(relativePath);
  const destination = join(distDirectory, relativePath);
  const sourceStat = await stat(source);
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: sourceStat.isDirectory() });
}

if (distDirectory !== join(projectRoot, "dist")) {
  throw new Error("dist出力先の検証に失敗しました。");
}

await rm(distDirectory, { recursive: true, force: true });
await mkdir(distDirectory, { recursive: true });
await Promise.all(runtimeEntries.map(copyRuntimeEntry));

console.log(`Tauri runtime assets: ${runtimeEntries.length} entries copied to dist/`);
