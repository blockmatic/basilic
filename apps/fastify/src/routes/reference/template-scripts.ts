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

export function getInitScript(opts: {
  apiUrl: string
  openApiUrl: string
  callbackUrl: string
  jwtToken: string | null
  verificationId?: string
}): string {
  const { apiUrl, openApiUrl, callbackUrl, jwtToken, verificationId } = opts
  const jwtJson = jwtToken ? JSON.stringify(jwtToken) : 'null'
  const verificationIdJson = verificationId ? JSON.stringify(verificationId) : 'null'
  const buttonScript = getButtonInjectionScript()

  return `
(function() {
  const apiUrl = ${JSON.stringify(apiUrl)};
  const callbackUrl = ${JSON.stringify(callbackUrl)};
  const openApiUrl = ${JSON.stringify(openApiUrl)};
  const jwtFromServer = ${jwtJson};
  const verificationIdFromUrl = ${verificationIdJson};
  
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
  } else if (verificationIdFromUrl) {
    const banner = document.createElement('div');
    banner.id = 'verify-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:12px 16px;background:#1e3a5f;color:#fff;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;z-index:10000;font-size:14px;';
    banner.innerHTML = '<span>Enter the 6-digit code from your email:</span><form style="display:inline-flex;gap:8px;align-items:center;flex-wrap:wrap;"><input type="text" inputmode="numeric" pattern="\\\\d*" maxlength="6" placeholder="000000" style="width:80px;padding:6px;font-size:14px;border-radius:4px;"/><button type="submit" style="padding:6px 12px;background:#667eea;color:#fff;border:none;border-radius:4px;cursor:pointer;">Verify</button><span data-verify-error="" aria-live="polite" style="color:#ef4444;font-size:12px;margin-left:8px;"></span></form>';
    document.body.prepend(banner);
    banner.querySelector('form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = banner.querySelector('input');
      const code = input?.value?.trim();
      if (!code || code.length !== 6) return;
      const errorEl = banner.querySelector('[data-verify-error]');
      if (errorEl) errorEl.textContent = '';
      try {
        const res = await fetch(apiUrl + '/auth/magiclink/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verificationId: verificationIdFromUrl, token: code }),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('scalar-token', data.token);
          history.replaceState({}, '', '/reference');
          updateScalarAuth(scalarApiReference, data.token);
          banner.remove();
          if (window.updateLoginButton) window.updateLoginButton();
        } else {
          let msg = 'Verification failed. Please try again.';
          try {
            const body = await res.json();
            msg = body.message || msg;
          } catch {}
          const errDiv = banner.querySelector('[data-verify-error]');
          if (errDiv) errDiv.textContent = msg;
        }
      } catch (err) {
        const msg = 'Verification failed. Please try again.';
        const errDiv = banner.querySelector('[data-verify-error]');
        if (errDiv) errDiv.textContent = msg;
      }
    });
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
