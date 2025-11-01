import { afterEach, vi } from "vitest";

// Ensure mocks/spies don’t leak between tests
afterEach(() => {
  vi.clearAllMocks();
});

