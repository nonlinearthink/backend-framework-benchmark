import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const appRoot = path.join(import.meta.dir, "..");
const bin =
  process.platform === "win32"
    ? path.join(appRoot, "main.exe")
    : path.join(appRoot, "main");

if (!existsSync(bin)) {
  console.error(`Missing ${bin}. Run: bun run build`);
  process.exit(1);
}

const result = spawnSync(bin, {
  cwd: appRoot,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
