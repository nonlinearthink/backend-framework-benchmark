# syntax=docker/dockerfile:1
#
# Build from repository root:
#   docker build -f apps/fiber/Dockerfile -t benchmark-fiber .

ARG GO_VERSION=1.25

FROM golang:${GO_VERSION}-alpine AS build
WORKDIR /src

RUN apk add --no-cache ca-certificates

COPY apps/fiber/go.mod apps/fiber/go.sum ./
RUN go env -w GOPROXY=https://goproxy.cn,direct \
    && go mod download

COPY apps/fiber/ .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /server .

FROM alpine:3.21
RUN apk add --no-cache ca-certificates

COPY --from=build /server /server

ENV PORT=8080

# Prefork 需要 fork 权限，与 USER nobody 不兼容；容器内用副本水平扩展即可
EXPOSE 8080
USER nobody
ENTRYPOINT ["/server"]
