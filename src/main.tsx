
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// S'assurer que l'élément root existe
const rootElement = document.getElementById("root");
if (!rootElement) {
  // Créer l'élément s'il n'existe pas (pour une compatibilité maximale)
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  document.body.appendChild(newRoot);
}

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

// Render the app with error boundary
try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error("Erreur lors du rendu de l'application:", error);
  // Afficher une erreur utilisateur en cas de problème
  if (document.getElementById("root")) {
    document.getElementById("root")!.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Une erreur est survenue</h2>
        <p>Veuillez rafraîchir la page ou réessayer plus tard.</p>
      </div>
    `;
  }
}
