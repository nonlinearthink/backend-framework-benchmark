import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const benchmarks = [
  { name: "elysia", label: "Elysia (Bun)" },
  { name: "hono", label: "Hono (Bun)" },
  { name: "nestjs", label: "NestJS (Bun)" },
  { name: "nestjs-node", label: "NestJS (Node)" },
  { name: "fiber", label: "Fiber (Go)" },
  { name: "gin", label: "Gin (Go)" },
] as const;

// All Docker images listen on 8080 inside the container (see apps/<name>/Dockerfile).
const containerPort = 8080;
const hostPort = Number(process.env.BENCHMARK_HOST_PORT ?? containerPort);
const benchmarkUrl = `http://127.0.0.1:${hostPort}/`;

const benchmarkDuration = process.env.BENCHMARK_DURATION ?? "30s";
const warmupDuration = process.env.BENCHMARK_WARMUP_DURATION ?? "5s";

const connectionLevels: number[] = (
  process.env.BENCHMARK_CONNECTIONS ?? "50,100,150,200,250,300,350,400"
)
  .split(",")
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isFinite(n) && n > 0);

if (connectionLevels.length === 0) {
  console.error("BENCHMARK_CONNECTIONS must list at least one positive integer");
  process.exit(1);
}

const ohaBaseArgs = [
  "--no-tui",
  "--disable-keepalive",
  "--output-format",
  "json",
] as const;

const warmupMs = 10_000;
const concurrencySettleMs = Number(process.env.BENCHMARK_SETTLE_MS ?? 3_000);
const frameworkIntervalMs = 10_000;

const dockerImagePrefix =
  process.env.BENCHMARK_IMAGE_PREFIX ?? "backend-framework-benchmark";
const dockerImageTag = process.env.BENCHMARK_IMAGE_TAG ?? "latest";

const scriptsDir = import.meta.dir;
const repoRoot = path.join(scriptsDir, "..");
const resultsDir = path.join(repoRoot, "results");

type OhaResult = {
  summary: {
    requestsPerSec: number;
    successRate: number;
  };
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ohaEnv(): Record<string, string | undefined> {
  const env = { ...process.env };
  delete env.NO_COLOR;
  delete env.FORCE_COLOR;
  return env;
}

function resultFileName(name: string, connections: number): string {
  return `${name}-plaintext-${benchmarkDuration}-c${connections}.json`;
}

function ohaArgs(connections: number): string[] {
  return ["-z", benchmarkDuration, "-c", String(connections), ...ohaBaseArgs];
}

function containerName(name: string): string {
  return `benchmark-${name}`;
}

function dockerImage(name: string): string {
  return `${dockerImagePrefix}/${name}:${dockerImageTag}`;
}

function runDocker(args: string[], label: string): void {
  const result = spawnSync("docker", args, { stdio: "inherit", encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`[${label}] docker ${args.join(" ")} failed`);
    process.exit(result.status ?? 1);
  }
}

function removeContainer(name: string): void {
  spawnSync("docker", ["rm", "-f", containerName(name)], { stdio: "pipe" });
}

function startContainer(name: string): void {
  const image = dockerImage(name);
  removeContainer(name);

  console.log(`[${name}] docker run -p ${hostPort}:${containerPort} ${image}`);
  runDocker(
    [
      "run",
      "-d",
      "--name",
      containerName(name),
      "-p",
      `${hostPort}:${containerPort}`,
      image,
    ],
    name,
  );
}

function stopContainer(name: string): void {
  console.log(`[${name}] stopping container…`);
  removeContainer(name);
}

async function execOha(
  args: string[],
  url: string,
  outputPath?: string,
): Promise<void> {
  const fullArgs = outputPath
    ? [...args, "-o", outputPath, url]
    : [...args, url];

  const oha = Bun.spawn(["oha", ...fullArgs], {
    cwd: repoRoot,
    stdout: outputPath ? "inherit" : "ignore",
    stderr: "inherit",
    env: ohaEnv(),
  });

  const exitCode = await oha.exited;
  if (exitCode !== 0) {
    throw new Error(`oha exited with code ${exitCode ?? 1}`);
  }
}

async function warmupAtConcurrency(connections: number): Promise<void> {
  await execOha(
    [
      "-z",
      warmupDuration,
      "-c",
      String(connections),
      "--no-tui",
      "--output-format",
      "quiet",
    ],
    benchmarkUrl,
  );
}

async function runOhaAtLevel(name: string, connections: number): Promise<void> {
  const file = resultFileName(name, connections);
  const output = path.join(resultsDir, file);

  console.log(
    `[${name}] c=${connections} settle ${concurrencySettleMs / 1000}s + warmup ${warmupDuration}`,
  );
  await sleep(concurrencySettleMs);
  await warmupAtConcurrency(connections);

  console.log(
    `[${name}] c=${connections} oha ${benchmarkDuration} ${benchmarkUrl} → ${path.relative(repoRoot, output)}`,
  );

  await execOha(ohaArgs(connections), benchmarkUrl, output);

  const result = JSON.parse(await readFile(output, "utf8")) as OhaResult;
  console.log(
    `[${name}] c=${connections} RPS=${result.summary.requestsPerSec.toFixed(0)} success=${(result.summary.successRate * 100).toFixed(1)}%`,
  );
}

for (let i = 0; i < benchmarks.length; i++) {
  const { name } = benchmarks[i];

  startContainer(name);

  try {
    console.log(`[${name}] waiting ${warmupMs / 1000}s for container…`);
    await sleep(warmupMs);

    for (const connections of connectionLevels) {
      await runOhaAtLevel(name, connections);
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    stopContainer(name);
    process.exit(1);
  }

  stopContainer(name);

  if (i < benchmarks.length - 1) {
    console.log(`Waiting ${frameworkIntervalMs / 1000}s before next framework…`);
    await sleep(frameworkIntervalMs);
  }
}

const totalRuns = connectionLevels.length * benchmarks.length;
console.log(
  `\nDone: ${totalRuns} results (${connectionLevels.length} levels × ${benchmarks.length} frameworks, ${benchmarkDuration} each)`,
);

export {};
