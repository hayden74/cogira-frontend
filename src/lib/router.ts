import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { AppRequest } from './request';
import { buildResponse } from './http';

export type DomainHandler = (
  request: AppRequest
) => Promise<APIGatewayProxyStructuredResultV2>;

export type HandlerRegistry = Record<string, DomainHandler>;

export function extractDomain(path: string): string {
  const segments = path.split('/').filter(Boolean);
  return segments[0] || '';
}

export async function routeRequest(
  request: AppRequest,
  handlers: HandlerRegistry
): Promise<APIGatewayProxyStructuredResultV2> {
  const domain = extractDomain(request.path);

  const handler = handlers[domain];
  if (!handler) {
    return buildResponse(404, { error: `Domain '${domain}' not found` });
  }

  return handler(request);
}
