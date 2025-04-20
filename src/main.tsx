
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create _redirects file for Netlify to handle SPA routing
if (import.meta.env.PROD) {
  const redirects = document.createElement('div');
  redirects.id = 'redirects';
  redirects.style.display = 'none';
  redirects.innerHTML = `
    <!-- This content will be used to generate the _redirects file for Netlify -->
    /* /index.html 200
  `;
  document.body.appendChild(redirects);
}

createRoot(document.getElementById("root")!).render(<App />);
