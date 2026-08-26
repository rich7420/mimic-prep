.PHONY: install start dev test audit build verify e2e release docker-up docker-down

install:
	npm ci

start:
	npm start

dev:
	npm run dev

test:
	npm test

audit:
	npm run content:audit

build:
	npm run build

verify:
	npm run verify

e2e:
	npm run test:e2e

release:
	npm run release:check

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down
