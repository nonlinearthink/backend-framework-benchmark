const benchmarks = [
  { name: "elysia", port: 8080 },
  { name: "hono", port: 8081 },
  { name: "nestjs", port: 8082 },
] as const;

const ohaBaseArgs = [
  "-z",
  "30s",
  "-c",
  "200",
  "--no-tui",
  "--disable-keepalive",
  "--latency-correction",
  "--output-format",
  "json",
] as const;

const intervalMs = 10_000;
const repoRoot = import.meta.dir;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (let i = 0; i < benchmarks.length; i++) {
  const { name, port } = benchmarks[i];
  const output = `../results/${name}-plaintext-30s.json`;
  const url = `http://127.0.0.1:${port}/`;

  console.log(`[${name}] ${url} → ${output}`);

  const proc = Bun.spawn(["oha", ...ohaBaseArgs, "-o", output, url], {
    cwd: repoRoot,
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    process.exit(exitCode ?? 1);
  }

  if (i < benchmarks.length - 1) {
    console.log(`Waiting ${intervalMs / 1000}s before next benchmark…`);
    await sleep(intervalMs);
  }
}

export {};
