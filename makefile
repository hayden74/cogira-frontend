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
	cd src && npm test

.PHONY: default build deploy test
