import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const appRoot = path.join(import.meta.dir, "..");
const gocache = path.join(appRoot, ".cache", "go-build");
mkdirSync(gocache, { recursive: true });

const out =
  process.platform === "win32"
    ? path.join(appRoot, "main.exe")
    : path.join(appRoot, "main");

const result = spawnSync("go", ["build", "-ldflags", "-s -w", "-o", out, "."], {
  cwd: appRoot,
  stdio: "inherit",
  env: { ...process.env, GOCACHE: gocache },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Built → ${path.relative(appRoot, out)}`);
