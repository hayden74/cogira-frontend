import type { MiddlewareObj } from '@middy/core';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { emitRequestMetricsEMF } from '../metrics';

export const metrics = (): MiddlewareObj<
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
> => {
  return {
    before: async (request: any) => {
      request.internal = request.internal || {};
      request.internal._metricsStart = Date.now();
    },
    after: async (request: any) => {
      const start = request.internal?._metricsStart || Date.now();
      const dur = Date.now() - start;
      const status = Number(request.response?.statusCode || 200);
      const event = request.event as APIGatewayProxyEventV2;
      await emitRequestMetricsEMF({
        route: event.rawPath || 'unknown',
        method: event.requestContext?.http?.method || 'UNKNOWN',
        statusCode: status,
        durationMs: dur,
      });
    },
    onError: async (request: any) => {
      // errorHandler runs last; after it sets response, we record metrics too
      const start = request.internal?._metricsStart || Date.now();
      const dur = Date.now() - start;
      const status = Number(request.response?.statusCode || 500);
      const event = request.event as APIGatewayProxyEventV2;
      await emitRequestMetricsEMF({
        route: event.rawPath || 'unknown',
        method: event.requestContext?.http?.method || 'UNKNOWN',
        statusCode: status,
        durationMs: dur,
      });
    },
  };
};
