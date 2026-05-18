# syntax=docker/dockerfile:1
#
# Build from repository root:
#   docker build -f apps/nestjs-node/Dockerfile -t benchmark-nestjs-node .

ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY apps/nestjs-node/package.json apps/nestjs-node/
RUN npm install --workspace=nestjs-node --include-workspace-root

FROM deps AS build
COPY apps/nestjs-node ./apps/nestjs-node
RUN npm exec --workspace=nestjs-node -- tsc -p tsconfig.json \
    && npm prune --workspace=nestjs-node --omit=dev

FROM node:${NODE_VERSION} AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/nestjs-node/dist ./apps/nestjs-node/dist
COPY apps/nestjs-node/package.json ./apps/nestjs-node/

WORKDIR /app/apps/nestjs-node
EXPOSE 8080
USER node
CMD ["node", "dist/main.js"]
