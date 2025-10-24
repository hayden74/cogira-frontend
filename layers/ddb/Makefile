STACKNAME ?= $(PROJECT_PREFIX)-ddb-layer

build:
	sam build

deploy:
	sam build && \
	sam deploy \
	  --profile $(ENV) \
	  --stack-name $(STACKNAME) \
	  --s3-prefix $(PROJECT_PREFIX) \
	  --no-confirm-changeset \
	  --resolve-s3 \
	  --no-fail-on-empty-changeset

.PHONY: build deploy
