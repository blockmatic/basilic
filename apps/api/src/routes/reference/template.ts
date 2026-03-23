import { getInitScript } from './template-scripts.js'
import { scalarStyles } from './template-styles.js'

export function getReferenceHtml(opts: {
  apiUrl: string
  openApiUrl: string
  callbackUrl: string
  jwtToken?: string | null
  verificationId?: string
}): string {
  const { apiUrl, openApiUrl, callbackUrl, jwtToken = null, verificationId } = opts
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Reference - Basilic</title>
  <!-- Pin matches @scalar/fastify-api-reference; avoids @latest hash/URL drift in E2E -->
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.44.18/dist/browser/standalone.js"></script>
  <style>${scalarStyles}
  </style>
</head>
<body>
  <div id="scalar-container"></div>
  <div id="modal-overlay" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Login</h2>
        <button id="close-modal" class="close-button">&times;</button>
      </div>
      <form id="login-form">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input type="email" id="email" class="form-input" placeholder="m@example.com" required />
          <div id="email-error" class="form-error"></div>
          <div id="email-success" class="form-success"></div>
        </div>
        <button type="submit" id="submit-button" class="submit-button">Send magic link</button>
      </form>
    </div>
  </div>
  <script>${getInitScript({ apiUrl, openApiUrl, callbackUrl, jwtToken, verificationId })}</script>
</body>
</html>`
}
