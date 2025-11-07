import { describe, it, expect } from 'vitest';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { requestSizeLimit } from '../lib/middy/requestSizeLimit';
import { AppError } from '../lib/errors';

const createMockEvent = (
  contentLength?: string,
  body?: string,
  isBase64?: boolean
): APIGatewayProxyEventV2 => ({
  version: '2.0',
  routeKey: 'POST /example',
  rawPath: '/example',
  rawQueryString: '',
  headers: contentLength ? { 'content-length': contentLength } : {},
  body,
  isBase64Encoded: isBase64 || false,
  requestContext: {
    accountId: '123456789012',
    apiId: 'api-id',
    domainName: 'api.example.com',
    domainPrefix: 'api',
    http: {
      method: 'POST',
      path: '/example',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test-agent',
    },
    requestId: 'request-id',
    routeKey: 'POST /example',
    stage: 'test',
    time: '01/Jan/2024:00:00:00 +0000',
    timeEpoch: 1704067200,
  },
});

describe('Request Size Limit Middleware', () => {
  it('should allow requests within size limit', async () => {
    const middleware = requestSizeLimit({ maxSize: 1024 });
    const event = createMockEvent('500', JSON.stringify({ name: 'test' }));
    const request = { event, response: undefined };

    await expect(middleware.before!(request as any)).resolves.toBeUndefined();
  });

  it('should reject requests exceeding Content-Length limit', async () => {
    const middleware = requestSizeLimit({ maxSize: 1024 });
    const event = createMockEvent('2048');
    const request = { event, response: undefined };

    await expect(middleware.before!(request as any)).rejects.toThrow(AppError);
    try {
      await middleware.before!(request as any);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).message).toBe('Request payload too large');
      expect((error as AppError).status).toBe(413);
    }
  });

  it('should reject requests with body exceeding size limit', async () => {
    const middleware = requestSizeLimit({ maxSize: 10 });
    const largeBody = 'x'.repeat(20);
    const event = createMockEvent(undefined, largeBody);
    const request = { event, response: undefined };

    await expect(middleware.before!(request as any)).rejects.toThrow(AppError);
  });

  it('should use default 10MB limit', async () => {
    const middleware = requestSizeLimit();
    const event = createMockEvent('1024', JSON.stringify({ name: 'test' }));
    const request = { event, response: undefined };

    await expect(middleware.before!(request as any)).resolves.toBeUndefined();
  });
});
