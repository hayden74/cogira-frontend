PROFILE ?= dev
CONFIG_ENV ?= dev

default:
	$(MAKE) build CONFIG_ENV=$(CONFIG_ENV)
	$(MAKE) deploy PROFILE=$(PROFILE) CONFIG_ENV=$(CONFIG_ENV)

build:
	sam build --config-env $(CONFIG_ENV)

deploy:
	sam deploy --profile $(PROFILE) --config-env $(CONFIG_ENV)

.PHONY: default build deploy
