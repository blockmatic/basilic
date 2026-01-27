const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
  #scalar-container { height: 100vh; width: 100vw; }
  .modal-overlay {
    display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); z-index: 20000; align-items: center; justify-content: center;
  }
  .modal-overlay.show { display: flex; }
  .modal {
    background: #1e1e1e; border-radius: 12px; padding: 32px; max-width: 400px; width: 90%;
    max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    border: 1px solid #333;
  }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .modal-title { font-size: 24px; font-weight: 600; color: #e5e5e5; }
  .close-button {
    background: none; border: none; font-size: 24px; cursor: pointer; color: #999;
    padding: 0; width: 32px; height: 32px; display: flex; align-items: center;
    justify-content: center; border-radius: 4px; transition: background 0.2s;
  }
  .close-button:hover { background: #333; }
  .form-group { margin-bottom: 20px; }
  .form-label { display: block; margin-bottom: 8px; font-weight: 500; color: #e5e5e5; font-size: 14px; }
  .form-input {
    width: 100%; padding: 10px 12px; border: 1px solid #444; border-radius: 6px;
    font-size: 14px; transition: border-color 0.2s; background: #2a2a2a; color: #e5e5e5;
  }
  .form-input:focus { outline: none; border-color: #667eea; }
  .form-error { color: #ef4444; font-size: 12px; margin-top: 4px; }
  .form-success { color: #22c55e; font-size: 12px; margin-top: 4px; }
  .submit-button {
    width: 100%; padding: 12px; background: #667eea; color: white; border: none;
    border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s;
  }
  .submit-button:hover:not(:disabled) { background: #5568d3; }
  .submit-button:disabled { background: #444; cursor: not-allowed; }
`

function getButtonInjectionScript(): string {
  return `
  function findConfigureButton(container) {
    let btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Configure');
    if (!btn) btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.toLowerCase().trim() === 'configure');
    if (!btn) {
      const buttons = Array.from(container.querySelectorAll('button'));
      if (buttons.length === 0) return null;
      btn = buttons[buttons.length - 1];
    }
    return btn;
  }
  
  function createLoginButton(configureButton, scalarApiReference, showModal) {
    const link = document.createElement('button');
    const currentToken = localStorage.getItem('scalar-token');
    link.textContent = currentToken ? 'Logout' : 'Login';
    link.setAttribute('data-login-link', 'true');
    link.setAttribute('type', 'button');
    const style = window.getComputedStyle(configureButton);
    const props = ['background', 'border', 'color', 'cursor', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'padding', 'margin', 'borderRadius', 'transition', 'display', 'alignItems', 'gap', 'textDecoration', 'textTransform'];
    link.style.cssText = props.map(p => p + ': ' + style[p]).join('; ') + ';';
    if (configureButton.className) link.className = configureButton.className;
    link.onmouseenter = () => {
      const hover = window.getComputedStyle(configureButton, ':hover');
      if (hover.backgroundColor) link.style.backgroundColor = hover.backgroundColor;
    };
    link.onmouseleave = () => link.style.backgroundColor = style.backgroundColor;
    link.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const token = localStorage.getItem('scalar-token');
      if (token) {
        localStorage.removeItem('scalar-token');
        updateScalarAuth(scalarApiReference, '');
        location.reload();
      } else {
        showModal();
      }
    };
    configureButton.insertAdjacentElement('afterend', link);
    return true;
  }
  
  function injectLoginLinkInternal(scalarApiReference, showModal) {
    let injected = false;
    let attempts = 0;
    const maxAttempts = 150;
    const tryInject = () => {
      attempts++;
      if (document.querySelector('[data-login-link]')) return true;
      const devBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Developer Tools');
      if (devBtn) {
        let container = devBtn.parentElement;
        while (container && container !== document.body) {
          const buttons = Array.from(container.querySelectorAll('button'));
          if (buttons.length >= 4 && buttons.includes(devBtn)) {
            const cfgBtn = findConfigureButton(container);
            if (cfgBtn) return createLoginButton(cfgBtn, scalarApiReference, showModal);
          }
          container = container.parentElement;
        }
        if (devBtn.parentElement) {
          const parentBtns = Array.from(devBtn.parentElement.querySelectorAll('button'));
          if (parentBtns.length >= 2 && parentBtns.some(b => b.textContent?.trim() === 'Configure')) {
            const cfgBtn = findConfigureButton(devBtn.parentElement);
            if (cfgBtn) return createLoginButton(cfgBtn, scalarApiReference, showModal);
          }
        }
      }
      return false;
    };
    window.updateLoginButton = () => {
      const link = document.querySelector('[data-login-link]');
      if (link) link.textContent = localStorage.getItem('scalar-token') ? 'Logout' : 'Login';
    };
    if (tryInject()) return;
    const observer = new MutationObserver(() => {
      if (!injected && tryInject()) {
        injected = true;
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(() => {
      if (injected || tryInject() || attempts >= maxAttempts) {
        clearInterval(interval);
        observer.disconnect();
      }
    }, 100);
  }`
}

function getInitScript(
  apiUrl: string,
  openApiUrl: string,
  callbackUrl: string,
  jwtToken: string | null,
): string {
  const jwtJson = jwtToken ? JSON.stringify(jwtToken) : 'null'
  const buttonScript = getButtonInjectionScript()

  return `
(function() {
  const apiUrl = ${JSON.stringify(apiUrl)};
  const callbackUrl = ${JSON.stringify(callbackUrl)};
  const openApiUrl = ${JSON.stringify(openApiUrl)};
  const jwtFromServer = ${jwtJson};
  
  function updateScalarAuth(scalarApiReference, token) {
    const authConfig = {
      preferredSecurityScheme: 'bearerAuth',
      securitySchemes: { bearerAuth: { token } },
    };
    if (scalarApiReference?.updateConfiguration) {
      scalarApiReference.updateConfiguration({ authentication: authConfig });
    } else if (scalarApiReference?.updateAuthentication) {
      scalarApiReference.updateAuthentication(authConfig);
    }
  }
  
  const storedToken = localStorage.getItem('scalar-token');
  const token = jwtFromServer || storedToken;
  
  let scalarApiReference = null;
  try {
    scalarApiReference = Scalar.createApiReference('#scalar-container', {
      url: openApiUrl,
      theme: 'moon',
      authentication: {
        preferredSecurityScheme: 'bearerAuth',
        securitySchemes: { bearerAuth: { token: token || '' } },
      },
    });
  } catch (error) {
    console.error('Failed to initialize Scalar:', error);
  }
  
  if (jwtFromServer) {
    localStorage.setItem('scalar-token', jwtFromServer);
    history.replaceState({}, '', '/reference');
    updateScalarAuth(scalarApiReference, jwtFromServer);
  }
  
  window.scalarApiReference = scalarApiReference;
  
  const modalOverlay = document.getElementById('modal-overlay');
  const closeModal = document.getElementById('close-modal');
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('email-error');
  const emailSuccess = document.getElementById('email-success');
  const submitButton = document.getElementById('submit-button');
  
  function showModal() {
    modalOverlay.classList.add('show');
  }
  
  function hideModal() {
    modalOverlay.classList.remove('show');
    emailInput.value = '';
    emailError.textContent = '';
    emailSuccess.textContent = '';
  }
  
  window.showLogin = showModal;
  closeModal.addEventListener('click', hideModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) hideModal();
  });
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    emailError.textContent = '';
    emailSuccess.textContent = '';
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    try {
      const response = await fetch(apiUrl + '/auth/magiclink/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, callbackUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send magic link');
      emailSuccess.textContent = 'Check your email for the magic link';
      submitButton.textContent = 'Magic link sent';
    } catch (error) {
      emailError.textContent = error.message || 'Failed to send magic link. Please try again.';
      submitButton.textContent = 'Send magic link';
    } finally {
      submitButton.disabled = false;
    }
  });
  
  ${buttonScript}
  
  injectLoginLinkInternal(scalarApiReference, showModal);
})();
`
}

export function getReferenceHtml(
  apiUrl: string,
  openApiUrl: string,
  callbackUrl: string,
  jwtToken: string | null = null,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Reference - Basilic</title>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest/dist/browser/standalone.js"></script>
  <style>${CSS}
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
  <script>${getInitScript(apiUrl, openApiUrl, callbackUrl, jwtToken)}</script>
</body>
</html>`
}
