import helmet from 'helmet';

/**
 * Security middleware configuration using Helmet.js
 * Applies industry-standard HTTP security headers
 */
export const securityHeaders = helmet({
  // Content Security Policy - prevent XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // Prevent clickjacking attacks
  frameguard: { action: 'deny' },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // Prevent MIME type sniffing
  noSniff: true,

  // Enable XSS protection
  xssFilter: true,

  // Enforce HTTPS (when deployed)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});
