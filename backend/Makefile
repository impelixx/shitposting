.PHONY: run test build docker-build

run:
	go run ./cmd/server

test:
	go test ./... -v

build:
	CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

docker-build:
	docker build -t blogik-backend .
