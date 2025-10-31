import { APIGatewayProxyEventV2 } from "aws-lambda";

export type AppRequest = {
  method: string;
  path: string;
  query: Record<string, string | undefined>;
  params: Record<string, string | undefined>;
  body: any;
};

export function parseEvent(event: APIGatewayProxyEventV2): AppRequest {
  const method = event.requestContext?.http?.method || "GET";
  const path = event.rawPath || "/";
  const query = event.queryStringParameters ?? {};
  const params = event.pathParameters ?? {};
  const body = event.body ? JSON.parse(event.body) : {};

  return { method, path, query, params, body };
}
