
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdProvider } from './components/ads/AdProvider';

// Configuration du client de requête avec gestion des erreurs
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 secondes
      refetchOnWindowFocus: false,
      // Ajout d'une gestion d'erreur par défaut pour éviter les plantages
      retry: 1,
      meta: {
        onError: (error: Error) => {
          console.error('React Query error:', error);
        }
      }
    },
  },
});

// Fonction pour capturer les erreurs globales non gérées
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Empêcher l'écran blanc en montrant un message à l'utilisateur
  const rootElement = document.getElementById('root');
  if (rootElement && rootElement.innerHTML === '') {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h2>Une erreur s'est produite</h2>
        <p>Nous sommes désolés pour ce désagrément. Veuillez rafraîchir la page.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
          Rafraîchir la page
        </button>
      </div>
    `;
  }
});

// Lancement de l'application avec gestion des erreurs
try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AdProvider>
          <App />
        </AdProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  // Afficher un message d'erreur explicite plutôt qu'un écran blanc
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif;">
        <h2>Impossible de charger l'application</h2>
        <p>Une erreur technique s'est produite. Veuillez rafraîchir la page ou réessayer plus tard.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
          Rafraîchir la page
        </button>
      </div>
    `;
  }
}
