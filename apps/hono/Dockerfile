# syntax=docker/dockerfile:1
#
# Build from repository root:
#   docker build -f apps/hono/Dockerfile -t benchmark-hono .

ARG BUN_VERSION=1.3-alpine

FROM oven/bun:${BUN_VERSION} AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/hono/package.json apps/hono/
RUN bun install --filter hono

FROM deps AS build
COPY apps/hono ./apps/hono
RUN bun run --cwd apps/hono build

FROM oven/bun:${BUN_VERSION} AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080

COPY package.json bun.lock ./
COPY apps/hono/package.json apps/hono/
RUN bun install --filter hono

COPY --from=build /app/apps/hono/dist ./apps/hono/dist

WORKDIR /app/apps/hono
EXPOSE 8080
USER bun
CMD ["bun", "run", "dist/index.js"]
