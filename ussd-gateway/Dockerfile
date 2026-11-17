FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY . .
RUN go build -o ussd-server main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/ussd-server .
EXPOSE 8080
CMD ["./ussd-server"]
