import type { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get('/', async (_request, reply) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Basilic API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 800px;
      width: 100%;
      padding: 48px;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .subtitle {
      color: #666;
      font-size: 1.125rem;
      margin-bottom: 32px;
    }
    h2 {
      font-size: 1.5rem;
      margin: 32px 0 16px;
      color: #333;
    }
    ul {
      list-style: none;
      margin-bottom: 32px;
    }
    li {
      margin: 12px 0;
    }
    a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    a:hover {
      color: #764ba2;
      gap: 12px;
    }
    a::before {
      content: '→';
      font-weight: bold;
    }
    pre {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      border-left: 4px solid #667eea;
    }
    code {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      color: #333;
    }
    .badge {
      display: inline-block;
      background: #e0e7ff;
      color: #667eea;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 24px;
    }
    @media (max-width: 768px) {
      .container { padding: 32px 24px; }
      h1 { font-size: 2rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">v1.0.0</span>
    <h1>🌿 Basilic API</h1>
    <p class="subtitle">Type-safe REST API built with Fastify & OpenAPI</p>
    
    <h2>📚 Resources</h2>
    <ul>
      <li><a href="/reference">API Reference</a> <span style="color: #999; font-size: 0.875rem;">Interactive OpenAPI documentation</span></li>
      <li><a href="/reference/openapi.json">OpenAPI Spec</a> <span style="color: #999; font-size: 0.875rem;">JSON specification</span></li>
      <li><a href="/health">Health Check</a> <span style="color: #999; font-size: 0.875rem;">Service status</span></li>
    </ul>
    
    <h2>🚀 Quick Start</h2>
    <pre><code>curl -X GET http://localhost:3000/health</code></pre>
    
    <h2>💡 Features</h2>
    <ul>
      <li><a href="#">Type-safe contracts</a> End-to-end type safety with OpenAPI and hey-api</li>
      <li><a href="#">Zod validation</a> Runtime schema validation</li>
      <li><a href="#">OpenAPI generation</a> Auto-generated from contracts</li>
      <li><a href="#">Fast & efficient</a> Built on Fastify</li>
    </ul>
  </div>
</body>
</html>
    `
    return reply.type('text/html').send(html)
  })
}

export default root
