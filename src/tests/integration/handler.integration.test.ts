import { describe, it, expect } from 'vitest';
import { handler } from '../../index';
import { makeEvent } from '../fixtures/apiGateway';

describe('HTTP integration: handler (middy + router)', () => {
  it('GET /docs returns 200 with HTML and security headers', async () => {
    const event = makeEvent({ path: '/docs', method: 'GET' });
    const res = await handler(event, {} as any);
    expect(res.statusCode).toBe(200);
    expect(res.headers?.['Content-Type']).toBe('text/html');
    expect(res.headers?.['Content-Security-Policy']).toBeDefined();
  });

  it('GET unknown route returns 404 JSON', async () => {
    const event = makeEvent({ path: '/unknown', method: 'GET' });
    const res = await handler(event, {} as any);
    expect(res.statusCode).toBe(404);
  });
});
