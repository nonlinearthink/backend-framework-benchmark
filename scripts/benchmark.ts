import { spawnSync } from "node:child_process";
import path from "node:path";

const benchmarks = [
  { name: "elysia", port: 8080 },
  { name: "hono", port: 8081 },
  { name: "nestjs", port: 8082 },
  { name: "nestjs-node", port: 8083 },
  { name: "fiber", port: 8084 },
  { name: "gin", port: 8085 },
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

const intervalMs = 30_000;
const readyTimeoutMs = 60_000;
const scriptsDir = import.meta.dir;
const repoRoot = path.join(scriptsDir, "..");
const resultsDir = path.join(repoRoot, "results");

type ServerProcess = ReturnType<typeof Bun.spawn>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ohaEnv(): Record<string, string | undefined> {
  const env = { ...process.env };
  delete env.NO_COLOR;
  delete env.FORCE_COLOR;
  return env;
}

function killListenersOnPort(port: number): void {
  if (process.platform === "win32") {
    const out = spawnSync("netstat", ["-ano"], { encoding: "utf8" });
    const pids = new Set<string>();
    for (const line of out.stdout?.split("\n") ?? []) {
      if (!line.includes(`:${port}`) || !line.includes("LISTENING")) continue;
      const pid = line.trim().split(/\s+/).pop();
      if (pid) pids.add(pid);
    }
    for (const pid of pids) {
      spawnSync("taskkill", ["/F", "/PID", pid]);
    }
    return;
  }

  const out = spawnSync("lsof", ["-ti", `TCP:${port}`, "-sTCP:LISTEN"], {
    encoding: "utf8",
  });
  for (const pid of out.stdout?.trim().split("\n").filter(Boolean) ?? []) {
    spawnSync("kill", ["-9", pid]);
  }
}

async function readStream(stream: ServerProcess["stderr"]): Promise<string> {
  if (stream == null || typeof stream === "number") return "";
  return new Response(stream).text();
}

async function waitForReady(
  port: number,
  label: string,
  server: ServerProcess,
): Promise<void> {
  const deadline = Date.now() + readyTimeoutMs;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      const stderr = await readStream(server.stderr);
      throw new Error(
        `[${label}] server exited with code ${server.exitCode}${stderr ? `:\n${stderr}` : ""}`,
      );
    }

    try {
      const res = await fetch(`http://127.0.0.1:${port}/`, {
        signal: AbortSignal.timeout(1_000),
      });
      if (res.ok) {
        console.log(`[${label}] ready on :${port}`);
        return;
      }
    } catch {
      // retry
    }

    await sleep(500);
  }

  const stderr = await readStream(server.stderr);
  throw new Error(
    `[${label}] timed out waiting for http://127.0.0.1:${port}/${stderr ? `:\n${stderr}` : ""}`,
  );
}

function startServer(name: string): ServerProcess {
  console.log(`[${name}] bun run start --filter ${name}`);
  return Bun.spawn(["bun", "run", "start", "--filter", name], {
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
  });
}

async function stopServer(server: ServerProcess, port: number, name: string): Promise<void> {
  console.log(`[${name}] stopping server…`);

  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await Promise.race([server.exited, sleep(3_000)]);
    if (server.exitCode === null) {
      server.kill("SIGKILL");
      await Promise.race([server.exited, sleep(1_000)]);
    }
  }

  killListenersOnPort(port);
  await sleep(500);
}

for (let i = 0; i < benchmarks.length; i++) {
  const { name, port } = benchmarks[i];
  const output = path.join(resultsDir, `${name}-plaintext-30s.json`);
  const url = `http://127.0.0.1:${port}/`;

  killListenersOnPort(port);
  const server = startServer(name);

  try {
    await waitForReady(port, name, server);

    console.log(`[${name}] ${url} → ${path.relative(repoRoot, output)}`);

    const oha = Bun.spawn(["oha", ...ohaBaseArgs, "-o", output, url], {
      cwd: repoRoot,
      stdout: "inherit",
      stderr: "inherit",
      env: ohaEnv(),
    });

    const exitCode = await oha.exited;
    if (exitCode !== 0) {
      process.exit(exitCode ?? 1);
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    await stopServer(server, port, name);
    process.exit(1);
  }

  await stopServer(server, port, name);

  if (i < benchmarks.length - 1) {
    console.log(`Waiting ${intervalMs / 1000}s before next benchmark…`);
    await sleep(intervalMs);
  }
}

export {};
