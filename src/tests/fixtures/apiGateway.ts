import { APIGatewayProxyEventV2 } from 'aws-lambda';

type MakeEventArgs = {
  path?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  queryStringParameters?: Record<string, string | undefined>;
};

export function makeEvent({
  path = '/users',
  method = 'GET',
  headers = {},
  body,
  queryStringParameters,
}: MakeEventArgs = {}): APIGatewayProxyEventV2 {
  // derive pathParameters for explicit routes like /resource/{id}
  let pathParameters: Record<string, string> | undefined;
  const m = path.match(/^\/?[^/]+\/(.+)$/);
  if (m) pathParameters = { id: m[1] };
  const rawQueryString =
    queryStringParameters && Object.keys(queryStringParameters).length > 0
      ? Object.entries(queryStringParameters)
          .filter(([_, value]) => value !== undefined)
          .map(
            ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`
          )
          .join('&')
      : '';
  const payload: any = {
    version: '2.0',
    routeKey: '$default',
    rawPath: path,
    rawQueryString,
    headers,
    requestContext: {
      accountId: 'test',
      apiId: 'test',
      domainName: 'example.com',
      domainPrefix: 'example',
      http: {
        method,
        path,
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'vitest',
      },
      requestId: 'test-id',
      routeKey: '$default',
      stage: '$default',
      time: new Date().toISOString(),
      timeEpoch: Date.now(),
    },
    isBase64Encoded: false,
    pathParameters,
    queryStringParameters:
      queryStringParameters && Object.keys(queryStringParameters).length > 0
        ? queryStringParameters
        : undefined,
    body:
      typeof body === 'string'
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  };
  return payload;
}
