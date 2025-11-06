Testing conventions

- Structure
  - Feature unit tests colocate under `src/features/**` (e.g., `src/features/users/*.test.ts`).
  - Cross-cutting/unit tests live under `src/tests/**` (e.g., `request.test.ts`, `cors.test.ts`).
  - Integration tests live under `src/tests/integration/**` and exercise `index.handler` end‑to‑end.
  - Shared helpers live in `src/tests/utils/**` and `src/tests/fixtures/**`.

- Naming
  - Use `*.test.ts` filenames with clear subjects and behavior‑oriented titles.

- Mocks
  - Use `vi.mock()` near the top of each test.
  - Place reusable manual mocks under `src/__mocks__`, including path-mirroring under `src/__mocks__/@/...` when needed.

- HTTP helpers
  - Use `makeEvent` from `fixtures/apiGateway` to build API Gateway events.
  - Use `expectJson` and `getHeader` from `utils/http` to assert responses.

- Coverage
  - Coverage config lives in `src/vitest.config.ts`; tests are excluded by default.

- Imports
  - Use relative imports; path aliases are not configured in this project.
