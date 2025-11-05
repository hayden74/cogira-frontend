import { describe, it, expect } from 'vitest';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { cors } from '../lib/middy/cors';

const createMockEvent = (
  method: string,
  origin?: string
): APIGatewayProxyEventV2 => ({
  version: '2.0',
  routeKey: 'GET /users',
  rawPath: '/users',
  rawQueryString: '',
  headers: origin ? { origin } : {},
  requestContext: {
    accountId: '123456789012',
    apiId: 'api-id',
    domainName: 'api.example.com',
    domainPrefix: 'api',
    http: {
      method,
      path: '/users',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test-agent',
    },
    requestId: 'request-id',
    routeKey: 'GET /users',
    stage: 'test',
    time: '01/Jan/2024:00:00:00 +0000',
    timeEpoch: 1704067200,
  },
  isBase64Encoded: false,
});

describe('CORS Middleware', () => {
  it('should handle OPTIONS preflight request', async () => {
    const middleware = cors();
    const event = createMockEvent('OPTIONS');
    const request = { event, response: undefined };

    await middleware.before!(request as any);

    expect(request.response).toBeDefined();
    expect(request.response!.statusCode).toBe(204);
    expect(request.response!.headers!['Access-Control-Allow-Origin']).toBe('*');
    expect(
      request.response!.headers!['Access-Control-Allow-Methods']
    ).toContain('GET');
  });

  it('should add CORS headers to response', async () => {
    const middleware = cors();
    const event = createMockEvent('GET');
    const request = {
      event,
      response: { statusCode: 200, body: '{}', headers: {} },
    };

    await middleware.after!(request as any);

    expect(request.response.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(request.response.headers['Access-Control-Allow-Methods']).toContain(
      'GET'
    );
  });

  it('should handle specific origin configuration', async () => {
    const middleware = cors({ origin: ['https://example.com'] });
    const event = createMockEvent('GET', 'https://example.com');
    const request = {
      event,
      response: { statusCode: 200, body: '{}', headers: {} },
    };

    await middleware.after!(request as any);

    expect(request.response.headers['Access-Control-Allow-Origin']).toBe(
      'https://example.com'
    );
  });

  it('should not set origin for unauthorized origins', async () => {
    const middleware = cors({ origin: ['https://example.com'] });
    const event = createMockEvent('GET', 'https://malicious.com');
    const request = {
      event,
      response: { statusCode: 200, body: '{}', headers: {} },
    };

    await middleware.after!(request as any);

    expect(
      request.response.headers['Access-Control-Allow-Origin']
    ).toBeUndefined();
  });
});
