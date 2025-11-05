import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { MiddyRequest } from '@middy/core';

interface CorsOptions {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const defaultOptions: CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id'],
  exposedHeaders: ['X-Correlation-Id'],
  credentials: false,
  maxAge: 86400, // 24 hours
};

export const cors = (options: CorsOptions = {}) => {
  const config = { ...defaultOptions, ...options };

  return {
    before: async (
      request: MiddyRequest<
        APIGatewayProxyEventV2,
        APIGatewayProxyStructuredResultV2
      >
    ) => {
      // Handle preflight OPTIONS requests
      if (request.event.requestContext.http.method === 'OPTIONS') {
        request.response = {
          statusCode: 204,
          headers: getCorsHeaders(config, request.event),
          body: '',
        };
        return;
      }
    },
    after: async (
      request: MiddyRequest<
        APIGatewayProxyEventV2,
        APIGatewayProxyStructuredResultV2
      >
    ) => {
      if (request.response) {
        request.response.headers = {
          ...request.response.headers,
          ...getCorsHeaders(config, request.event),
        };
      }
    },
  };
};

function getCorsHeaders(
  config: CorsOptions,
  event: APIGatewayProxyEventV2
): Record<string, string> {
  const headers: Record<string, string> = {};

  // Handle origin
  const requestOrigin = event.headers?.origin;
  if (Array.isArray(config.origin)) {
    if (requestOrigin && config.origin.includes(requestOrigin)) {
      headers['Access-Control-Allow-Origin'] = requestOrigin;
    }
  } else if (config.origin === '*' || config.origin === requestOrigin) {
    headers['Access-Control-Allow-Origin'] = config.origin;
  }

  // Set other CORS headers
  if (config.methods?.length) {
    headers['Access-Control-Allow-Methods'] = config.methods.join(', ');
  }

  if (config.allowedHeaders?.length) {
    headers['Access-Control-Allow-Headers'] = config.allowedHeaders.join(', ');
  }

  if (config.exposedHeaders?.length) {
    headers['Access-Control-Expose-Headers'] = config.exposedHeaders.join(', ');
  }

  if (config.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  if (config.maxAge) {
    headers['Access-Control-Max-Age'] = config.maxAge.toString();
  }

  return headers;
}
