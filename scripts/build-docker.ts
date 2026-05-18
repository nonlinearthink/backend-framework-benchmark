import { spawnSync } from "node:child_process";
import path from "node:path";

const apps = [
  "elysia",
  "hono",
  "nestjs",
  "nestjs-node",
  "fiber",
  "gin",
] as const;

const dockerImagePrefix =
  process.env.BENCHMARK_IMAGE_PREFIX ?? "backend-framework-benchmark";
const dockerImageTag = process.env.BENCHMARK_IMAGE_TAG ?? "latest";

const scriptsDir = import.meta.dir;
const repoRoot = path.join(scriptsDir, "..");

function buildImage(name: (typeof apps)[number]): void {
  const tag = `${dockerImagePrefix}/${name}:${dockerImageTag}`;
  const dockerfile = path.join("apps", name, "Dockerfile");

  const args = ["build", "-f", dockerfile, "-t", tag, "."];

  const platform = process.env.BENCHMARK_DOCKER_PLATFORM;
  if (platform) {
    args.splice(1, 0, "--platform", platform);
  }

  console.log(`\n[${name}] docker ${args.join(" ")}`);

  const result = spawnSync("docker", args, {
    cwd: repoRoot,
    stdio: "inherit",
    encoding: "utf8",
  });

  if (result.status !== 0) {
    console.error(`[${name}] docker build failed`);
    process.exit(result.status ?? 1);
  }
}

for (const name of apps) {
  buildImage(name);
}

console.log("\nAll images built.");

export {};
