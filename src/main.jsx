import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { FavoritesProvider } from './Components/Store/FavoritosContext';

// Montar tu aplicación
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FavoritesProvider>
      <App />
    </FavoritesProvider>
  </StrictMode>
);

// ✅ Registrar el Service Worker después de cargar la app
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('✅ Service Worker registrado correctamente'))
      .catch((err) => console.error('❌ Error al registrar el Service Worker:', err));
  });
}
