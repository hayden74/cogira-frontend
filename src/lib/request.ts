import { APIGatewayProxyEventV2 } from 'aws-lambda';

export type AppRequest = {
  method: string;
  /**
   * Normalized path with API base prefix stripped (e.g., '/example', '/docs').
   */
  path: string;
  /**
   * Raw path as received from API Gateway (e.g., '/api/v1/example').
   */
  rawPath: string;
  /**
   * API base path prefix if present (e.g., '/api/v1'), empty string otherwise.
   */
  basePath: string;
  query: Record<string, string | undefined>;
  params: Record<string, string | undefined>;
  body: any;
  correlationId?: string;
};

export function parseEvent(
  event: APIGatewayProxyEventV2,
  context?: any
): AppRequest {
  const method = event.requestContext?.http?.method || 'GET';
  const rawPath = event.rawPath || '/';
  // Normalize versioned API prefix: /api/v{n}
  const segments = rawPath.split('/').filter(Boolean);
  const hasVersionPrefix =
    segments[0]?.toLowerCase() === 'api' && /^v\d+$/i.test(segments[1] ?? '');
  const basePath = hasVersionPrefix ? `/${segments[0]}/${segments[1]}` : '';
  let path: string;
  if (hasVersionPrefix) {
    const rest = segments.slice(2).join('/');
    path = rest ? `/${rest}` : '/';
  } else {
    path = rawPath || '/';
  }
  const query = event.queryStringParameters ?? {};
  const params = event.pathParameters ?? {};
  const body = event.body ? JSON.parse(event.body) : {};
  const correlationId =
    context?.correlationId || event.requestContext?.requestId;

  return {
    method,
    path,
    rawPath,
    basePath,
    query,
    params,
    body,
    correlationId,
  };
}
