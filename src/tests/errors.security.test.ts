import { describe, it, expect } from 'vitest';
import { AppError } from '../lib/errors';

describe('errors security tests', () => {
  it('does not expose sensitive information in error messages', () => {
    const error = AppError.badRequest('Invalid input', {
      password: 'secret123',
    });

    expect(error.message).not.toContain('secret123');
    expect(error.message).not.toContain('password');
  });

  it('sanitizes error details to prevent information leakage', () => {
    const sensitiveData = {
      apiKey: 'sk_test_123',
      dbConnection: 'mongodb://user:pass@host',
      internalPath: '/var/app/secrets',
    };
    const error = AppError.badRequest('Database error', sensitiveData);

    expect(error.message).not.toContain('sk_test_123');
    expect(error.message).not.toContain('user:pass');
    expect(error.message).not.toContain('/var/app/secrets');
  });

  it('prevents stack trace exposure in production-like errors', () => {
    const error = AppError.notFound('Resource not found');

    expect(error.status).toBe(404);
    expect(error.message).toBe('Resource not found');
    expect(error.message).not.toMatch(/at\s+\w+\s+\(/);
  });

  it('validates error status codes are within safe ranges', () => {
    const badRequest = AppError.badRequest('Bad input');
    const notFound = AppError.notFound('Not found');
    const forbidden = AppError.forbidden('Forbidden');

    expect(badRequest.status).toBe(400);
    expect(notFound.status).toBe(404);
    expect(forbidden.status).toBe(403);

    expect([400, 403, 404]).toContain(badRequest.status);
    expect([400, 403, 404]).toContain(notFound.status);
    expect([400, 403, 404]).toContain(forbidden.status);
  });
});
