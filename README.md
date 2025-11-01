# Cogira Backend — Serverless Users API (PoC)

This repository provides a single-Lambda API using AWS SAM, Node.js 22, and DynamoDB. The Lambda exposes a simple `users` domain with a thin controller/router, small request/response helpers, and a clear service/repository split (KISS and DRY).

Project name: Cogira backend (as defined in `template.yaml` description).

## Architecture

- Runtime: `AWS::Serverless::Function` (Node.js 22) behind `AWS::Serverless::HttpApi`.
- Domain: `users` (list/get/create/update/delete) backed by a DynamoDB table.
- Routing: the entrypoint delegates to the `users` controller; path/method routing is implemented inside the controller.
- Request parsing: convert API Gateway events into a minimal `AppRequest` (method, path, query, params, body).
- Response helper: consistent JSON responses with correct 204 handling and `X-Correlation-Id`.
- Validation: Zod schemas at the controller boundary.
- Services and data: service orchestrates timestamps/IDs and calls the repository; repository uses DynamoDB DocumentClient.
- Middleware (Middy): `correlationId` (ensures/returns `X-Correlation-Id`), `errorHandler` (maps errors to HTTP responses).

## Request Flow

1. API Gateway (HTTP API) invokes `index.handler`.
2. `handler` applies Middy middlewares and calls `baseHandler`.
3. `baseHandler` delegates to the `usersHandlers` adapter.
4. Adapter parses the event into `AppRequest` and calls the users controller.
5. Controller validates input and calls the service, which calls the repository (DynamoDB).
6. Response is serialized with headers (including `X-Correlation-Id`).

## Project Layout

- `template.yaml` — SAM template (HttpApi, single Function, DynamoDB Users table).
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
- `src/tests/` — Vitest tests (unit/integration) and helpers.

## Conventions

- No path aliases are required for application code; imports are relative for simplicity.
- Prefer small, pure functions at controller/service boundaries; validate inputs in controllers.

## Correlation ID

- Request may provide `X-Correlation-Id`; otherwise API Gateway `requestId` or a UUID is used.
- The ID is echoed as `X-Correlation-Id` and included in error logs.

## Error Handling

- Throw `AppError` for expected failures (e.g., 400, 404, 422).
- The `errorHandler` middleware maps errors to HTTP responses; unknown errors become 500.

## Testing

- Framework: Vitest with V8 coverage.
- Structure: `src/tests/unit/**` and `src/tests/integration/**` with `fixtures` and `utils`.
- Setup: `src/tests/setup.ts` resets mocks between tests.
- Run:
  - `cd src && npm install`
  - `npm test` (watch: `npm run test:watch`, coverage: `npm run test:coverage`)

## Local Development

- Requirements: Node.js 20+, AWS SAM CLI.
- Build and deploy via SAM:
  - `make build CONFIG_ENV=dev`
  - `make deploy PROFILE=dev CONFIG_ENV=dev`
- The default `make` target runs tests then build; deployments are explicit.

## Extending (Add a New Domain)

Example: add `/tasks` mirroring the `users` pattern.

1) Create domain files

- `src/controllers/tasks/index.ts`
  - Parse the event and call the controller (same as users adapter), e.g.:
  - `import { parseEvent } from "../../lib/request"`
  - `export async function tasksHandlers(e) { return handleTasks(parseEvent(e)); }`

- `src/controllers/tasks/schemas.ts`
  - Define `CreateTaskBody` and `UpdateTaskBody` with zod.

- `src/controllers/tasks/taskController.ts`
  - Implement list/get/create/update/delete akin to users.

2) Wire the root delegation

- Update `src/index.ts` to dispatch based on the first path segment (e.g., `/users`, `/tasks`).

3) Service and repository

- `src/services/tasksService.ts` — business logic (timestamps, IDs).
- `src/data/tasksRepo.ts` — DynamoDB access (use a new table or reuse `UsersTable` for a PoC and adjust policies).

4) Tests

- Add controller and service tests under `src/tests/unit/**`; add integration tests if useful.

## CI/CD (Reference)

- `samconfig.toml` contains example build/deploy profiles.
- Files in `infra/pipeline/` and `pipeline/` are reference templates and may require adaptation to this single-function layout.

## Environment

- `USERS_TABLE`: DynamoDB table name for the users domain. Defaults to `UsersTable` if not set (see `template.yaml` parameter `UsersTableName`).
- `ENDPOINT_OVERRIDE` or `DDB_ENDPOINT`: optional endpoint override for local testing (e.g., DynamoDB Local). When set, the repository’s DynamoDB client connects to the provided endpoint.
