import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    reporters: ['default'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: '../coverage',
      reporter: ['text', 'html', 'lcov'],
      // config file is inside `src/`, so globs are relative to that root
      exclude: [
        'tests/**',
        '__mocks__/**',
        'data/**',
        'lib/**',
        'coverage/**',
        'vitest.config.ts',
        'types/**',
        'eslint.config.js',
      ],
      thresholds: {
        global: {
          statements: 85,
          branches: 80,
          functions: 90,
          lines: 85,
        },
      },
    },
  },
});
