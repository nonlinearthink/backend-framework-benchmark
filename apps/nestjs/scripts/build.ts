import { rm } from "node:fs/promises";
import path from "node:path";

const pkgRoot = path.join(import.meta.dir, "..");
const distDir = path.join(pkgRoot, "dist");
const entry = path.join(pkgRoot, "src/main.ts");

await rm(distDir, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: [entry],
  outdir: distDir,
  target: "bun",
  format: "esm",
  minify: true,
  // Nest、原生模块与 workspace 包在运行时从 node_modules 解析，避免打进单包导致元数据/二进制问题
  packages: "external",
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log(`Built ${path.relative(pkgRoot, entry)} → ${distDir}`);
