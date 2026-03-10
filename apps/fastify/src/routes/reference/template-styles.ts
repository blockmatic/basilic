export const scalarStyles = `
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
