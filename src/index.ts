import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import middy from '@middy/core';
import './lib/config'; // Load environment configuration
import { correlationId } from './lib/middy/correlationId';
import { errorHandler } from './lib/middy/errorHandler';
import { securityHeaders } from './lib/middy/securityHeaders';
import { cors } from './lib/middy/cors';
import { requestSizeLimit } from './lib/middy/requestSizeLimit';
import { parseEvent } from './lib/request';
import { routeRequest } from './lib/router';
import { handlerRegistry } from './controllers';

export const baseHandler = async (
  event: APIGatewayProxyEventV2,
  context?: any
): Promise<APIGatewayProxyStructuredResultV2> => {
  const request = parseEvent(event, context?.internal);
  return routeRequest(request, handlerRegistry);
};

export const handler = middy(baseHandler)
  .use(correlationId()) // ensure a correlation ID is set
  .use(requestSizeLimit()) // request size limits (10MB max)
  .use(cors()) // CORS policy configuration
  .use(securityHeaders()) // HTTP security headers
  .use(errorHandler()); // centralized error handling
