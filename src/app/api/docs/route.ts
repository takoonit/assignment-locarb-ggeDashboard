export const dynamic = "force-static";

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Lo-Carb GGE Dashboard API</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        color: #172026;
        background: #f7f9fb;
      }

      main {
        max-width: 960px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      h1 {
        margin: 0 0 8px;
        font-size: 32px;
      }

      p {
        color: #52616b;
        line-height: 1.5;
      }

      a {
        color: #006b5f;
        font-weight: 700;
      }

      pre {
        overflow-x: auto;
        padding: 16px;
        border: 1px solid #d6dee4;
        border-radius: 8px;
        background: #ffffff;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Lo-Carb GGE Dashboard API</h1>
      <p>The raw OpenAPI 3.1 document is available at <a href="/api/openapi">/api/openapi</a>.</p>
      <pre><code>GET /api/countries
GET /api/emissions/trend
GET /api/emissions/map
GET /api/emissions/sector
GET /api/emissions/filter
POST /api/countries
PATCH /api/countries/{id}
DELETE /api/countries/{id}
POST /api/emissions
PATCH /api/emissions/{id}
DELETE /api/emissions/{id}
POST /api/sector-shares
PATCH /api/sector-shares/{id}
DELETE /api/sector-shares/{id}</code></pre>
    </main>
  </body>
</html>`;

export function GET() {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
