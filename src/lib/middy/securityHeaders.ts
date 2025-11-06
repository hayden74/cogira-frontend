import type { MiddlewareObj } from '@middy/core';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

/**
 * Middy middleware to add security headers (Helmet.js equivalent for Lambda)
 * Follows industry security best practices
 */
export const securityHeaders = (): MiddlewareObj<
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
> => ({
  after: async (request) => {
    if (!request.response) return;

    // Initialize headers if not present
    if (!request.response.headers) {
      request.response.headers = {};
    }

    // Security headers following Helmet.js standards
    const headers = request.response.headers;

    // Content Security Policy - prevent XSS attacks
    headers['Content-Security-Policy'] =
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; connect-src 'self'; font-src 'self' https://unpkg.com; object-src 'none'; media-src 'self'; frame-src 'none'";

    // Prevent clickjacking
    headers['X-Frame-Options'] = 'DENY';

    // Prevent MIME type sniffing
    headers['X-Content-Type-Options'] = 'nosniff';

    // Enable XSS protection
    headers['X-XSS-Protection'] = '1; mode=block';

    // Enforce HTTPS (when deployed)
    headers['Strict-Transport-Security'] =
      'max-age=31536000; includeSubDomains; preload';

    // Hide server information
    headers['X-Powered-By'] = undefined; // Remove if present

    // Referrer policy
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

    // Permissions policy
    headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()';
  },
});
