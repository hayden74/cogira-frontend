import { describe, it, expect, vi } from 'vitest';
vi.mock('./services/usersService');
import { baseHandler } from './index';
import { makeEvent } from './tests/fixtures/apiGateway';
import { expectJson } from './tests/utils/http';

describe('router: delegation', () => {
  it('delegates to users domain', async () => {
    const res = await baseHandler(makeEvent({ path: '/users', method: 'GET' }));
    const body = expectJson(res, 200);
    expect(body.domain).toBe('users');
  });

  it('serves docs landing page', async () => {
    const res = await baseHandler(makeEvent({ path: '/docs', method: 'GET' }));
    expect(res.statusCode).toBe(200);
    expect(res.headers?.['Content-Type']).toBe('text/html');
    expect(res.body).toContain('SwaggerUIBundle');
  });

  it('serves OpenAPI document', async () => {
    const res = await baseHandler(
      makeEvent({ path: '/docs/openapi.json', method: 'GET' })
    );
    const body = expectJson(res, 200);
    expect(body.openapi).toBe('3.0.3');
  });

  it('returns 404 for unknown domain', async () => {
    const res = await baseHandler(
      makeEvent({ path: '/unknown', method: 'GET' })
    );
    const body = expectJson(res, 404);
    expect(body.error).toBe("Domain 'unknown' not found");
  });
});

describe('router: OPTIONS preflight (handled by API Gateway)', () => {
  it('Lambda does not handle OPTIONS (would be handled by API)', async () => {
    const res = await baseHandler(
      makeEvent({ path: '/users', method: 'OPTIONS' })
    );
    // If invoked directly, it falls through to 404 in Lambda
    const body = expectJson(res, 404);
    expect(body.message).toBe('Not Found');
  });
});
