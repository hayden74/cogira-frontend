import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import middy from "@middy/core";
import { correlationId } from "./lib/middy/correlationId";
import { errorHandler } from "./lib/middy/errorHandler";
import { usersHandlers } from "./controllers/users";

export const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
  return usersHandlers(event);
};

export const handler = middy(baseHandler)
  .use(correlationId()) // ensure a correlation ID is set
  .use(errorHandler()); // centralized error handling
