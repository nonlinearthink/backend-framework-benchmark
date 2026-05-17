import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";

const pkgRoot = path.join(import.meta.dir, "..");
const distDir = path.join(pkgRoot, "dist");

await rm(distDir, { recursive: true, force: true });

const result = spawnSync("tsc", ["-p", "tsconfig.json"], {
  cwd: pkgRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Built src → ${distDir}`);
