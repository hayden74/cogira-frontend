import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { MiddyRequest } from '@middy/core';
import { AppError } from '../errors';

interface RequestSizeLimitOptions {
  maxSize: number; // in bytes
}

const defaultOptions: RequestSizeLimitOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
};

export const requestSizeLimit = (
  options: RequestSizeLimitOptions = defaultOptions
) => {
  const config = { ...defaultOptions, ...options };

  return {
    before: async (
      request: MiddyRequest<
        APIGatewayProxyEventV2,
        APIGatewayProxyStructuredResultV2
      >
    ) => {
      const event = request.event;

      // Check Content-Length header
      const contentLength =
        event.headers?.['content-length'] || event.headers?.['Content-Length'];
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        if (size > config.maxSize) {
          throw new AppError(413, 'Request payload too large', {
            code: 'PAYLOAD_TOO_LARGE',
          });
        }
      }

      // Check body size if present
      if (event.body) {
        const bodySize = Buffer.byteLength(
          event.body,
          event.isBase64Encoded ? 'base64' : 'utf8'
        );
        if (bodySize > config.maxSize) {
          throw new AppError(413, 'Request payload too large', {
            code: 'PAYLOAD_TOO_LARGE',
          });
        }
      }
    },
  };
};
