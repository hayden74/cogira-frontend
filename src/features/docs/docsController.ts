import { buildResponse } from '../../lib/http';
import type { AppRequest } from '../../lib/request';
import { openApiDocument } from '../../docs/openapi';

const swaggerUiHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Cogira API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        const p = window.location.pathname;
        const base = p.endsWith('/') ? p.slice(0, -1) : p;
        const url = base + '/openapi.json';
        SwaggerUIBundle({ url, dom_id: '#swagger-ui' });
      };
    </script>
  </body>
  </html>`;

export async function handleDocs(req: AppRequest) {
  const p = req.path;
  const normalized = p.endsWith('/') ? p.slice(0, -1) : p;
  if (normalized === '/docs/openapi.json') {
    return buildResponse(200, openApiDocument);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: swaggerUiHtml,
  };
}
