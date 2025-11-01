# Modular Monolith on AWS Lambda (PoC)

This repository demonstrates a single-Lambda “modular monolith” API using AWS SAM, Node.js 22, and DynamoDB. The Lambda handles HTTP routes and dispatches to domain modules (currently `users`) via a small internal controller router.

The design aims for KISS and DRY: a thin routing layer, cohesive domain modules, a small request/response library, and a clear service/data-access split.

## Architecture

- Runtime: `AWS::Serverless::Function` (Node.js 22) behind `AWS::Serverless::HttpApi`.
- Routing: controller per domain. For this PoC the root routes all traffic to the `users` controller.
- Request parsing: JSON body parsing and extraction of query/params into a simple `AppRequest` type.
- Response helper: consistent JSON responses and proper 204 handling; correlation ID is returned in `X-Correlation-Id`.
- Validation: Zod schemas per domain for input validation at controller boundaries.
- Services and data: domain services encapsulate logic; repositories encapsulate DynamoDB access via the Document Client.
- Middy: `@middy/core` wraps the root handler with two small middlewares:
  - `correlationId` to derive and inject `X-Correlation-Id`.
  - `errorHandler` to map `AppError` and unexpected errors to HTTP responses.

## Request Flow

1. API Gateway (HTTP API) invokes `index.handler`.
2. `handler` applies Middy middlewares and calls `baseHandler`.
3. `baseHandler` delegates to the `usersHandlers` adapter.
4. The users adapter parses the API Gateway event to `AppRequest` and calls the users controller.
5. The controller validates input and calls the service, which calls the repository (DynamoDB).
6. A response is serialized with headers (including `X-Correlation-Id`).

## Project Layout

- `template.yaml` — SAM template (HttpApi, Lambda, DynamoDB Users table).
- `src/index.ts` — entrypoint with Middy setup and base delegation.
- `src/lib/request.ts` — parse API Gateway event to `AppRequest`.
- `src/lib/http.ts` — JSON response helper.
- `src/lib/errors.ts` — `AppError` and helpers.
- `src/lib/middy/` — custom Middy middlewares (`correlationId`, `errorHandler`).
- `src/controllers/users/` — domain module:
  - `index.ts` (adapter), `userController.ts` (routing + ops), `schemas.ts` (zod).
- `src/services/` — domain services (business logic).
- `src/data/` — repositories (DynamoDB); `data/ddb/client.ts` initializes the client.
- `src/types/` — shared domain types.
- `src/tests/` — Vitest tests: unit, integration, fixtures, and utils.

## Conventions

- Imports use the `@` alias to refer to the `src` root (see `vitest.config.ts` and `tsconfig.json`).
- Manual mocks for aliased paths live under `src/__mocks__/@/...` so `vi.mock("@/foo")` resolves predictably.
- Prefer small, pure functions at controller/service boundaries; validate inputs at controllers.

## Correlation ID

- Incoming requests can provide `X-Correlation-Id`; otherwise the system uses API Gateway `requestId` (or a UUID).
- The ID is echoed in the response header and included in logs.

## Error Handling

- Throw `AppError` for expected failures (e.g., 400, 404).
- The `errorHandler` middleware maps errors to HTTP responses; unknown errors map to 500.

## Testing

- Framework: Vitest with V8 coverage.
- Structure: `src/tests/unit/**` and `src/tests/integration/**` with shared `fixtures` and `utils`.
- Setup: `src/tests/setup.ts` clears mocks between tests.
- Helpers: `src/tests/fixtures/apiGateway.ts` to build events; `src/tests/utils/http.ts` to assert HTTP results.
- Run:
  - `cd src && npm install`
  - `npm test` (watch: `npm run test:watch`, coverage: `npm run test:coverage`)

## Local Development

- Requirements: Node.js 20+, AWS SAM CLI.
- Build and deploy via SAM:
  - `make build CONFIG_ENV=dev`
  - `make deploy PROFILE=dev CONFIG_ENV=dev`
- The default `make` target runs tests and build; deployments are explicit.

## Extending (Add a New Domain)

Example: add `/tasks` mirroring the `users` pattern.

1) Create domain files

- `src/controllers/tasks/index.ts`
  - Parse the event and call the controller (same as users adapter):
  - `import { parseEvent } from "@/lib/request"`
  - `export async function tasksHandlers(e) { return handleTasks(parseEvent(e)); }`

- `src/controllers/tasks/schemas.ts`
  - Define `CreateTaskBody` and `UpdateTaskBody` with zod.

- `src/controllers/tasks/taskController.ts`
  - Implement list/get/create/update/delete akin to users.

2) Wire the root delegation

- Edit `src/index.ts` and delegate based on the first path segment (or temporarily route all to tasks while prototyping).

3) Service and repository

- `src/services/tasksService.ts` — business logic (timestamps, IDs).
- `src/data/tasksRepo.ts` — DynamoDB access.
  - Either reuse `UsersTable` for a PoC or add a new table + policy in `template.yaml`.

4) Tests

- Add controller tests under `src/tests/unit/controllers/` and, if useful, service tests.
- Add integration tests invoking `handler` for end-to-end coverage.

## CI/CD (PoC)

- SAM config lives in `samconfig.toml`; build with `make build` and deploy with `make deploy` using your profile/env.
- Reference pipeline templates live under `infra/pipeline/` and `pipeline/` and can be adapted as needed.
