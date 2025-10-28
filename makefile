ENV ?= dev
REGION ?= us-east-1

ENV_FILE = env/$(ENV).env
include $(ENV_FILE)
export

# Project-wide prefix used by nested makefiles
PROJECT_PREFIX ?= cogira

# ========== Function Deploy Targets ==========

hello-lambda:
	$(MAKE) -C functions/hello-lambda deploy

pipeline:
	$(MAKE) -C infra/pipeline deploy

# ========== Layer Deploy Targets ==========

ddb-layer:
	$(MAKE) -C layers/ddb deploy

# ========== Grouped Targets ==========

functions: hello-lambda
layers: ddb-layer
stacks: layers
all: stacks functions

ci-ddb-layer:
	@echo "[CI] ddb-layer validate+build (ENV=$(ENV))"
	$(MAKE) -C layers/ddb build
	sam validate -t layers/ddb/template.yaml


ci-function:
	@test -n "$(FUNCTION_NAME)" || (echo "FUNCTION_NAME is required" && exit 1)
	@echo "[CI] function $(FUNCTION_NAME) validate+build (ENV=$(ENV))"
	$(MAKE) -C functions/$(FUNCTION_NAME) build
	sam validate -t functions/$(FUNCTION_NAME)/template.yaml


cd-ddb-layer:
	$(MAKE) -C layers/ddb deploy

cd-function:
	@test -n "$(FUNCTION_NAME)" || (echo "FUNCTION_NAME is required" && exit 1)
	$(MAKE) -C functions/$(FUNCTION_NAME) deploy


.PHONY: all functions layers stacks hello-lambda ddb-layer ci-ddb-layer ci-function
