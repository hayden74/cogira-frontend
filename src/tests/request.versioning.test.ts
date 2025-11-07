import { describe, it, expect } from 'vitest';
import { parseEvent } from '../lib/request';

describe('request parser: API versioning normalization', () => {
  it('strips /api/v1 prefix and sets basePath', () => {
    const event: any = {
      version: '2.0',
      rawPath: '/api/v1/example/123',
      requestContext: { http: { method: 'GET' }, requestId: 'rid' },
      isBase64Encoded: false,
      pathParameters: { id: '123' },
    };
    const req = parseEvent(event);
    expect(req.basePath).toBe('/api/v1');
    expect(req.path).toBe('/example/123');
    expect(req.rawPath).toBe('/api/v1/example/123');
  });
});
