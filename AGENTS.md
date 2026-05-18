# Backend Framework Benchmark

## Prerequisites

Install these tools before running the benchmark:

| Tool | Doc |
|------|-----|
| [Bun](https://bun.com/) | [docs/install-bun.md](docs/install-bun.md) |
| [Docker](https://docs.docker.com/get-docker/) | — |
| [oha](https://github.com/hatoo/oha) | [docs/install-oha.md](docs/install-oha.md) |

For local app development (optional): [Go](https://go.dev/) — [docs/install-go.md](docs/install-go.md).

## Run benchmark

1. Build Docker images for all apps (from the repository root):

   ```bash
   bun run build:docker
   ```

   Tags images as `backend-framework-benchmark/<app>:latest` (for example `backend-framework-benchmark/fiber:latest`). Override with `BENCHMARK_IMAGE_PREFIX` / `BENCHMARK_IMAGE_TAG`; set `BENCHMARK_DOCKER_PLATFORM` (for example `linux/amd64`) when needed.

2. Run the benchmark from the repository root:

   ```bash
   bun run benchmark
   ```

   For each app, the script starts a Docker container, waits 10 seconds, then for each concurrency **50 / 100 / 150 / 200 / 250 / 300 / 350 / 400**: settles 3s, warm-up `oha` 5s, then one measured **`oha` pass for 30s**, then **10 seconds** between frameworks. Results: `<app>-plaintext-30s-c<N>.json`.

   Tune via env: `BENCHMARK_CONNECTIONS=50,100,150,200,250,300,350,400`, `BENCHMARK_DURATION=30s`, `BENCHMARK_SETTLE_MS=5000`, `BENCHMARK_WARMUP_DURATION=5s`.

   Docker images all listen on **8080** inside the container; the script maps **`8080:8080`** (override host port with `BENCHMARK_HOST_PORT` if needed). Only one container runs at a time.

3. Compare runs in a browser (serves `results/` over HTTP; do not open `compare.html` via `file://` — browsers block `fetch` on local JSON):

   ```bash
   bun run compare
   ```

   Opens `http://127.0.0.1:3456/compare.html`. The page scans all `results/*-plaintext-*-c*.json` files (no `manifest.json` required). Stop the server with Ctrl+C when done.

## Local development (optional)

Copy `.env.example` to `.env` in each app directory when running apps outside Docker (`bun run dev` / `bun run start`):

- `apps/elysia/`
- `apps/hono/`
- `apps/nestjs/`
- `apps/nestjs-node/`
- `apps/fiber/`
- `apps/gin/`

Install dependencies and run apps locally:

```bash
bun install
bun run build
bun run start
```
