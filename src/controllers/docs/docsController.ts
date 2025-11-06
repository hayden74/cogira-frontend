import { buildResponse } from '../../lib/http';
import type { AppRequest } from '../../lib/request';
import { openApiDocument } from '../../docs/openapi';

const swaggerUiHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Cogira Users API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: '/docs/openapi.json',
          dom_id: '#swagger-ui',
        });
      };
    </script>
  </body>
</html>`;

export async function handleDocs(req: AppRequest) {
  const normalized = req.path.replace(/\/+$/, '');
  if (normalized === '/docs/openapi.json') {
    return buildResponse(200, openApiDocument);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: swaggerUiHtml,
  };
}
