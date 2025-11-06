Observability plumbing: extend src/lib/logger.ts with a CloudWatch transport and inject AWS X-Ray tracing/metrics emission in src/index.ts to align with .specify/memory/constitution/observability.md (line 82) and .specify/memory/constitution/observability.md (line 129).

Infrastructure defaults: update template.yaml so the DynamoDB table enables point-in-time recovery and, if feasible for the demo, provision DAX or document a waiver for .specify/memory/constitution/core.md (line 53)–55.
Testing stack: migrate to Jest + Supertest to satisfy .specify/memory/constitution/testing.md (line 34) (already on your radar).
