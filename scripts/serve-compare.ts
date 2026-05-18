import { readdir } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.PORT) || 3456;
const root = path.join(import.meta.dir, "../results");
const url = `http://127.0.0.1:${port}/compare.html`;

const benchmarkFilePattern = /^(.+)-plaintext-(.+)-c(\d+)\.json$/;

type BenchmarkFileEntry = {
  file: string;
  framework: string;
  duration: string;
  connections: number;
};

async function listBenchmarkFiles(): Promise<BenchmarkFileEntry[]> {
  const names = await readdir(root);
  const entries: BenchmarkFileEntry[] = [];

  for (const name of names) {
    const match = benchmarkFilePattern.exec(name);
    if (!match) continue;

    entries.push({
      file: name,
      framework: match[1],
      duration: match[2],
      connections: Number(match[3]),
    });
  }

  entries.sort((a, b) => {
    if (a.framework !== b.framework) {
      return a.framework.localeCompare(b.framework);
    }
    return a.connections - b.connections;
  });

  return entries;
}

function openBrowser(target: string): void {
  const platform = process.platform;
  if (platform === "win32") {
    Bun.spawn(["cmd", "/c", "start", "", target], {
      stdout: "ignore",
      stderr: "ignore",
    });
    return;
  }
  if (platform === "darwin") {
    Bun.spawn(["open", target], { stdout: "ignore", stderr: "ignore" });
    return;
  }
  Bun.spawn(["xdg-open", target], { stdout: "ignore", stderr: "ignore" });
}

console.log(`Serving ${root}`);
console.log(`Open ${url}`);

Bun.serve({
  port,
  hostname: "127.0.0.1",
  async fetch(req) {
    const { pathname } = new URL(req.url);

    if (pathname === "/api/benchmarks.json") {
      const files = await listBenchmarkFiles();
      return Response.json({ files });
    }

    const rel = pathname === "/" ? "/compare.html" : pathname;
    const filePath = path.join(root, rel);
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return new Response("Not Found", { status: 404 });
    }
    return new Response(file);
  },
});

openBrowser(url);
