self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
  });
  
  self.addEventListener('fetch', (event) => {
    // Puedes manejar caché aquí si quieres soporte offline
  });
  