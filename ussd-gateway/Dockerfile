# ==============================================================================
# Fambul Fund USSD Gateway - Production Multi-Stage Dockerfile
# ==============================================================================

# Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install security certificates & git
RUN apk add --no-cache ca-certificates git tzdata

# Cache dependencies
COPY go.mod ./
# (COPY go.sum ./ if present)
COPY . .

# Build statically-linked binary without debug symbols
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags="-w -s" -o ussd-server main.go

# Runtime Stage
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/ussd-server .

# Run as non-privileged user
USER appuser

ENV PORT=8080 \
    ENVIRONMENT=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/health || exit 1

EXPOSE 8080

CMD ["./ussd-server"]
