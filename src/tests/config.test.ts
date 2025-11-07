import { describe, it, expect } from 'vitest';
import { appConfig } from '../lib/config';

describe('Configuration', () => {
  it('should load default configuration', () => {
    expect(appConfig.env).toBeDefined();
    expect(appConfig.logLevel).toBeDefined();
  });

  it('should have expected default values', () => {
    expect(appConfig.env).toBe('test'); // NODE_ENV is set to 'test' during testing
    expect(['info', 'debug', 'warn', 'error']).toContain(appConfig.logLevel);
  });
});
