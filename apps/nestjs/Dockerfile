# syntax=docker/dockerfile:1
#
# Build from repository root:
#   docker build -f apps/nestjs/Dockerfile -t benchmark-nestjs .

ARG BUN_VERSION=1.3-alpine

FROM oven/bun:${BUN_VERSION} AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/nestjs/package.json apps/nestjs/
RUN bun install --filter nestjs

FROM deps AS build
COPY apps/nestjs ./apps/nestjs
RUN bun run --cwd apps/nestjs build

FROM oven/bun:${BUN_VERSION} AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080

COPY package.json bun.lock ./
COPY apps/nestjs/package.json apps/nestjs/
RUN bun install --filter nestjs

COPY --from=build /app/apps/nestjs/dist ./apps/nestjs/dist

WORKDIR /app/apps/nestjs
EXPOSE 8080
USER bun
CMD ["bun", "run", "dist/main.js"]
