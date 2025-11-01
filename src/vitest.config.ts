import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": root,
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    setupFiles: ["tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    reporters: ["default"],
    coverage: {
      enabled: true,
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "html", "lcov"],
      // config file is inside `src/`, so globs are relative to that root
      exclude: ["tests/**", "__mocks__/**", "data/**", "lib/**"],
    },
  },
});
