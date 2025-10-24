import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

export const hello = async (
  _event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "hello world" }),
  };
};

