PROFILE ?= dev
CONFIG_ENV ?= dev

default:
	$(MAKE) test
	$(MAKE) build CONFIG_ENV=$(CONFIG_ENV)

build:
	sam build --config-env $(CONFIG_ENV)

deploy:
	sam deploy --profile $(PROFILE) --config-env $(CONFIG_ENV)

# CI-friendly deploy using role credentials (no --profile),
# deploying the compiled template from .aws-sam/build
deploy-ci:
	sam deploy --config-env $(CONFIG_ENV) --template-file .aws-sam/build/template.yaml

test:
	cd src && npm test

.PHONY: default build deploy deploy-ci test
