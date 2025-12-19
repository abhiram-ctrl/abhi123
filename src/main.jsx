import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Use dynamic import to avoid stale module graph and ensure default export resolution
(async () => {
  try {
    const mod = await import('./App.jsx');
    const App = mod.default;
    if (!App) {
      console.error('App default export not found. Module exports:', mod);
      const fallback = () => React.createElement('div', null, 'App failed to load');
      root.render(
        <React.StrictMode>
          {React.createElement(fallback)}
        </React.StrictMode>
      );
      return;
    }
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Failed to import App.jsx', err);
    const ErrorView = () => React.createElement('pre', { style: { padding: 16 } }, String(err));
    root.render(
      <React.StrictMode>
        {React.createElement(ErrorView)}
      </React.StrictMode>
    );
  }
})();