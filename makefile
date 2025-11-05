PROFILE ?= dev
CONFIG_ENV ?= dev

default:
	$(MAKE) test
	$(MAKE) build CONFIG_ENV=$(CONFIG_ENV)

build:
	sam build --config-env $(CONFIG_ENV)

deploy:
	sam deploy --profile $(PROFILE) --config-env $(CONFIG_ENV)

test:
	cd src && npm run test:coverage

install:
	cd src && npm install

format:
	npx prettier --write src/

lint:
	cd src && npm run lint

lint-fix:
	cd src && npm run lint:fix

.PHONY: default build deploy deploy-ci test install format lint lint-fix
