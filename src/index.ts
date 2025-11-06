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
import { handlerRegistry } from './features';
import { initProductionLoggerSinks } from './lib/logger';
import { metrics } from './lib/middy/metrics';
import { withSubsegment } from './lib/xray';

export const baseHandler = async (
  event: APIGatewayProxyEventV2,
  context?: any
): Promise<APIGatewayProxyStructuredResultV2> => {
  // Ensure logger sinks (e.g., CloudWatch) are initialized in Lambda
  await initProductionLoggerSinks();
  const request = parseEvent(event, context?.internal);
  return withSubsegment(
    'routeRequest',
    () => routeRequest(request, handlerRegistry),
    {
      path: request.rawPath,
      method: request.method,
    }
  );
};

export const handler = middy(baseHandler)
  .use(correlationId()) // ensure a correlation ID is set
  .use(requestSizeLimit()) // request size limits (10MB max)
  .use(cors()) // CORS policy configuration
  .use(securityHeaders()) // HTTP security headers
  .use(metrics()) // embedded metrics for requests
  .use(errorHandler()); // centralized error handling
