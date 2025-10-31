import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

const json = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export async function usersHandlers(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> {
  const method = event.requestContext?.http?.method || "GET";
  return json(200, { domain: "users", method, message: "users handler" });
}

