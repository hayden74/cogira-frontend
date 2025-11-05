STACKNAME ?= $(PROJECT_PREFIX)-ddb-layer
PROFILE_FLAG := $(if $(CLI_PROFILE),--profile $(CLI_PROFILE),)

build:
	sam build

deploy:
	sam build && \
	sam deploy \
	  $(PROFILE_FLAG) \
	  --stack-name $(STACKNAME) \
	  --s3-prefix $(PROJECT_PREFIX) \
	  --no-confirm-changeset \
	  --resolve-s3 \
	  --no-fail-on-empty-changeset

.PHONY: build deploy
