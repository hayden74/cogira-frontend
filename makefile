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

.PHONY: all functions layers stacks hello-lambda ddb-layer
