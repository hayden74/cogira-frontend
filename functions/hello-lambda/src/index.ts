import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { hello } from "./handlers";

export const handler = (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> => {
  // Single endpoint routed by SAM: /hello-lambda (GET)
  return hello(event);
};

