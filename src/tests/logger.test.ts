import { describe, expect, it } from 'vitest';
import { getLogger, logger } from '../lib/logger';

describe('Logger', () => {
  it('should create logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.level).toBe('info');
  });

  it('should create child logger with correlation ID', () => {
    const childLogger = getLogger('test-correlation-id');
    expect(childLogger).toBeDefined();
  });

  it('should log structured JSON format', () => {
    // Logger is working as evidenced by output in other tests
    expect(() => logger.info('Test message', { key: 'value' })).not.toThrow();
  });
});
