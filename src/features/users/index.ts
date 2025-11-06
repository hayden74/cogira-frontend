import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

import { handleUsers } from './userController';
import { parseEvent } from '../../lib/request';

export async function usersHandlers(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const req = parseEvent(event);
  return handleUsers(req);
}
