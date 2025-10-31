import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import httpCors from "@middy/http-cors";
import { tasksHandler } from "./handlers/tasks";
import { usersHandlers } from "./handlers/users";
import { boardsHandlers } from "./handlers/boards";

const json = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const baseHandler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> => {
  try {
    const rawPath = event.rawPath || "/";
    const [, root] = rawPath.split("/"); // '' | 'users' | 'tasks' | 'boards' | ...

    switch (root) {
      case "users":
        return usersHandlers(event);
      case "tasks":
        return tasksHandler(event);
      case "boards":
        return boardsHandlers(event);
      default:
        return json(404, {
          message: "Not Found",
          details: `No route for ${rawPath}`,
        });
    }
  } catch (err) {
    console.error("Unhandled error:", err);
    return json(500, { message: "Internal Server Error" });
  }
};

export const handler = middy(baseHandler)
  .use(httpJsonBodyParser({ disableContentTypeError: true }))
  .use(httpErrorHandler())
  .use(httpCors());
