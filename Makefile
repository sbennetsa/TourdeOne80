.PHONY: help dev build test clean stop logs

help:
	@echo "Tour de ONE80 — Docker commands"
	@echo ""
	@echo "make dev       - Start dev server (http://localhost:5173)"
	@echo "make build     - Build production bundle"
	@echo "make test      - Run unit tests"
	@echo "make logs      - Show app logs"
	@echo "make stop      - Stop running containers"
	@echo "make clean     - Remove containers and volumes"
	@echo ""

dev:
	docker-compose up app

build:
	docker-compose run --rm build

test:
	docker-compose run --rm test

logs:
	docker-compose logs -f app

stop:
	docker-compose down

clean:
	docker-compose down -v
	rm -rf dist/ node_modules/
