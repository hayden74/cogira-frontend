import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export const buildResponse = (
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {}
): APIGatewayProxyStructuredResultV2 => {
  const res: APIGatewayProxyStructuredResultV2 = {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
  if (statusCode !== 204) {
    res.body = JSON.stringify(body);
  }
  return res;
};
