STACKNAME ?= $(PROJECT_PREFIX)-cogira-frontend-pipeline
TEMPLATE ?= template-cc-ci.yaml

build:
	sam build --template-file $(TEMPLATE)


deploy:
	sam build --template-file $(TEMPLATE) && \
	sam deploy \
	  --template-file $(TEMPLATE) \
	  --profile $(ENV) \
	  --stack-name $(STACKNAME) \
    --s3-prefix $(PROJECT_PREFIX)/cogira-frontend-pipeline \
	  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
	  --no-confirm-changeset \
	  --no-fail-on-empty-changeset \
	  --resolve-s3

.PHONY: build deploy
