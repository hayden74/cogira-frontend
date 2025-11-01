Testing conventions

- Structure
  - Unit tests live under `src/tests/unit/**` and mirror the app structure (e.g. `controllers/`, `services/`).
  - Integration tests live under `src/tests/integration/**` and exercise handler + routing.
  - Shared helpers live in `src/tests/utils/**` and `src/tests/fixtures/**`.

- Naming
  - Use `*.test.ts` filenames with clear subjects, e.g. `userController.test.ts`, `usersService.test.ts`.
  - Prefer describing behavior in `describe`/`it` titles (e.g. "returns 404 when user missing").

- Mocks
  - Use `vi.mock()` close to the top of the test file for module-scoped mocks.
  - For reusable mocks, place manual mocks under `src/__mocks__` and let Vitest resolve them automatically. For aliased imports like `@/services/usersService`, mirror the specifier path under `src/__mocks__/@/...`.

- HTTP helpers
  - Use `makeEvent` from `fixtures/apiGateway` to build API Gateway events.
  - Use `expectJson` and `getHeader` from `utils/http` to assert responses.

- Coverage
  - App code is included by default; tests are excluded. Coverage config lives in `src/vitest.config.ts`.

- Imports
  - Use the `@` alias for root imports (e.g., `@/services/usersService`, `@/lib/request`, `@/tests/utils/http`).
