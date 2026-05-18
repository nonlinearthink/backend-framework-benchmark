# syntax=docker/dockerfile:1
#
# Build from repository root:
#   docker build -f apps/elysia/Dockerfile -t benchmark-elysia .

ARG BUN_VERSION=1.3-alpine

FROM oven/bun:${BUN_VERSION} AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/elysia/package.json apps/elysia/
RUN bun install --filter elysia

FROM deps AS build
COPY apps/elysia ./apps/elysia
RUN bun run --cwd apps/elysia build

FROM oven/bun:${BUN_VERSION} AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080

COPY package.json bun.lock ./
COPY apps/elysia/package.json apps/elysia/
RUN bun install --filter elysia

COPY --from=build /app/apps/elysia/dist ./apps/elysia/dist

WORKDIR /app/apps/elysia
EXPOSE 8080
USER bun
CMD ["bun", "run", "dist/index.js"]
