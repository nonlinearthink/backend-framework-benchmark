# syntax=docker/dockerfile:1
#
# Build from repository root:
#   docker build -f apps/gin/Dockerfile -t benchmark-gin .

ARG GO_VERSION=1.25

FROM golang:${GO_VERSION}-alpine AS build
WORKDIR /src

RUN apk add --no-cache ca-certificates

COPY apps/gin/go.mod apps/gin/go.sum ./
RUN go env -w GOPROXY=https://goproxy.cn,direct \
    && go mod download

COPY apps/gin/ .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /server .

FROM alpine:3.21
RUN apk add --no-cache ca-certificates

COPY --from=build /server /server

ENV PORT=8080

EXPOSE 8080
USER nobody
ENTRYPOINT ["/server"]
