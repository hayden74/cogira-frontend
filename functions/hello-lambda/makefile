STACKNAME ?= $(PROJECT_PREFIX)-hello-lambda
PROFILE_FLAG := $(if $(CLI_PROFILE),--profile $(CLI_PROFILE),)

build:
	sam build

deploy:
	sam build && \
	sam deploy \
	  $(PROFILE_FLAG) \
	  --stack-name $(STACKNAME) \
	  --s3-prefix $(PROJECT_PREFIX)/hello-lambda \
	  --capabilities CAPABILITY_IAM \
	  --no-confirm-changeset \
	  --no-fail-on-empty-changeset \
	  --resolve-s3

.PHONY: build deploy
