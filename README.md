# Modular Monolith on AWS Lambda (PoC)

This repository demonstrates a single-Lambda “modular monolith” API using AWS SAM, Node.js 22, and DynamoDB. The Lambda handles all routes and dispatches to domain modules (e.g., `users`, future `tasks`) via a small internal router.

The design aims for KISS and DRY: a thin routing layer, cohesive domain modules, a small request/response library, and a clean service/data-access split.

## Architecture

- Runtime: `AWS::Serverless::Function` (Node.js 22) behind `AWS::Serverless::HttpApi`.
- Routing: the first path segment selects a domain (e.g., `/users`), then each domain controller routes by method + shape (`GET /users`, `GET /users/:id`, etc.).
- Request parsing: JSON body parsing, base64 decoding, content-type detection, query extraction, and a stable `correlationId` derived from `X-Correlation-Id` or API Gateway `requestId`.
- Response helper: consistent JSON responses and proper 204 handling; correlation ID is returned in `X-Correlation-Id` header.
- Validation: Zod schemas per domain for input validation.
- Services and data: domain services encapsulate logic; repositories encapsulate DynamoDB access.
- Middy: `@middy/core` wraps the root handler with two tiny custom middlewares:
  - `correlationId` to derive and inject `X-Correlation-Id`.
  - `errorHandler` to map `AppError` and unexpected errors to HTTP responses.

## Flow

1. API Gateway (HTTP API) invokes `index.handler`.
2. `handler` logs request start, extracts/creates a correlation ID, and calls `baseHandler`.
3. `baseHandler` picks the domain handler by the first path segment (e.g., `users`).
4. Domain `controller` matches the operation by method and path (exact vs `:id`).
5. The controller validates input, calls the domain `service`, which calls the domain `repo` (DynamoDB).
6. Response is serialized, `X-Correlation-Id` header is set, and request end is logged with duration.

## Project Layout

- `template.yaml` — SAM template (HttpApi, Lambda, DynamoDB Users table).
- `src/index.ts` — entrypoint, top-level router, correlation ID + logging.
- `src/lib/request.ts` — parse API Gateway event into `AppRequest`.
- `src/lib/http.ts` — JSON response helper.
- `src/lib/errors.ts` — tiny `AppError` with helpers.
- `src/lib/middy/` — custom Middy middlewares (`correlationId`, `errorHandler`).
- `src/handlers/users/` — domain module: `index.ts` (adapter), `controller.ts` (routing + ops), `schemas.ts` (zod).
- `src/services/` — domain services (business logic).
- `src/data/` — repositories (DynamoDB DocumentClient); `data/ddb/client.ts` initializes the client.
- `src/types/` — shared domain types.
- `src/tests/` — vitest unit tests for request parsing and users routing.

## Correlation ID

- Incoming requests can provide `X-Correlation-Id`; otherwise the system uses API Gateway `requestId` or generates a UUID.
- The ID is included in structured logs (`request.start`, `request.end`) and echoed in the response header `X-Correlation-Id`.

## Error Handling

- Use `AppError` in controllers/services for expected failures (e.g., not found, bad request).
- The `errorHandler` Middy middleware maps these to appropriate HTTP status codes; unknown errors map to 500 with a generic message.

## Local Development

- Requirements: Node.js 20+, AWS SAM CLI.
- Install and test:
  - `cd src && npm install`
  - `npm test`
- Build and deploy via SAM:
  - `make build CONFIG_ENV=dev`
  - `make deploy PROFILE=dev CONFIG_ENV=dev`

Note: The default Make target runs tests and build; deployment is explicit to avoid accidental deploys.

## Adding a New Domain (example: /tasks)

Below is a minimal example to add a `/tasks` domain mirroring the `users` pattern.

1) Create domain folder

- `src/handlers/tasks/index.ts`
  - Parse the event and pass it to the tasks controller (same as users adapter):
    - `import { parseEvent } from '../../lib/request'`
    - `export async function tasksHandlers(e) { return handleTasks(parseEvent(e)) }`

- `src/handlers/tasks/schemas.ts`
  - Define `CreateTaskBody` and `UpdateTaskBody` with zod.

- `src/handlers/tasks/controller.ts`
  - Implement operations similar to users: list, get, create, update, delete.
  - Use the same route key convention: `'GET /tasks'`, `'GET /tasks/:id'`, etc.

2) Wire the root router

- Edit `src/index.ts` and map the domain:
  - `import { tasksHandlers } from './handlers/tasks'`
  - Add to the `routes` object: `tasks: tasksHandlers`.

3) Service and repository

- `src/services/tasksService.ts` — implement business logic (timestamps, IDs, etc.).
- `src/data/tasksRepo.ts` — implement DynamoDB access.
  - For a PoC you can reuse the existing `UsersTable` or create a new table:
    - Add a new `Parameters` entry and a new table resource in `template.yaml`.
    - Grant the Lambda CRUD policy on the new table.

4) Tests

- Add `src/tests/tasks.controller.test.ts` mirroring `users.controller.test.ts` to verify routing and validation.
- Add focused service/repo tests if needed.

That’s it — keep modules small, reuse `lib/request` and `lib/http`, and follow the users pattern.

## Notes on CI/CD (PoC)

- SAM config lives in `samconfig.toml`; build with `make build` and deploy with `make deploy` using your profile/env.
- Pipeline templates in `infra/pipeline/` are reference material for multi-stack CI and may not be wired to this PoC by default.
