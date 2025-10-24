STACKNAME ?= $(PROJECT_PREFIX)-hello-lambda

build:
	sam build

deploy:
	sam build && \
	sam deploy \
	  --profile $(ENV) \
	  --stack-name $(STACKNAME) \
    --s3-prefix $(PROJECT_PREFIX)/hello-lambda \
	  --capabilities CAPABILITY_IAM \
	  --no-confirm-changeset \
	  --no-fail-on-empty-changeset \
	  --resolve-s3

.PHONY: build deploy
