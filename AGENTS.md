# Backend Framework Benchmark

## Prerequisites

Install these tools before running the benchmark:

| Tool | Doc |
|------|-----|
| [Bun](https://bun.com/) | [docs/install-bun.md](docs/install-bun.md) |
| [oha](https://github.com/hatoo/oha) | [docs/install-oha.md](docs/install-oha.md) |

## Usage

1. Install dependencies at the repository root:

   ```bash
   bun install
   ```

2. Copy `.env.example` to `.env` in each app directory:

   - `apps/elysia/`
   - `apps/hono/`
   - `apps/nestjs/`
   - `apps/nestjs-node/`

   Default ports: `elysia` 8080, `hono` 8081, `nestjs` 8082, `nestjs-node` 8083.

3. Build all apps from the repository root:

   ```bash
   bun run build
   ```

4. Start all apps from the repository root and wait until each port responds:

   ```bash
   bun run start
   ```

5. Run the benchmark from the repository root:

   ```bash
   bun run benchmark
   ```

   The script runs `oha` against each service in turn, writes results to `results/`, and waits 10 seconds between runs.

6. Stop the `bun run start` process when done (Ctrl+C in the terminal where it runs). If it was started in the background, end the process tree (for example on Windows: find the parent `bun run start` PID and run `taskkill /PID <pid> /T /F`).

7. Compare runs in a browser (serves `results/` over HTTP; do not open `compare.html` via `file://` — browsers block `fetch` on local JSON):

   ```bash
   bun run compare
   ```

   Opens `http://127.0.0.1:3456/compare.html`. Stop the server with Ctrl+C when done.
