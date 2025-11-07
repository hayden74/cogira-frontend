import { describe, it, expect } from 'vitest';
import { handler } from '../index';
import { makeEvent } from './fixtures/apiGateway';

describe('Security Headers', () => {
  it('applies security headers to all responses', async () => {
    const event = makeEvent({ path: '/docs', method: 'GET' });
    const res = await handler(event, {} as any);

    expect(res.headers).toBeDefined();

    // Check critical security headers
    expect(res.headers!['Content-Security-Policy']).toContain(
      "default-src 'self'"
    );
    expect(res.headers!['X-Frame-Options']).toBe('DENY');
    expect(res.headers!['X-Content-Type-Options']).toBe('nosniff');
    expect(res.headers!['X-XSS-Protection']).toBe('1; mode=block');
    expect(res.headers!['Strict-Transport-Security']).toContain(
      'max-age=31536000'
    );
    expect(res.headers!['Referrer-Policy']).toBe(
      'strict-origin-when-cross-origin'
    );
    expect(res.headers!['Permissions-Policy']).toContain('geolocation=()');
  });

  it('applies security headers to error responses', async () => {
    const event = makeEvent({ path: '/nonexistent', method: 'GET' });
    const res = await handler(event, {} as any);

    expect(res.statusCode).toBe(404);
    expect(res.headers).toBeDefined();
    expect(res.headers!['X-Frame-Options']).toBe('DENY');
    expect(res.headers!['X-Content-Type-Options']).toBe('nosniff');
  });
});
