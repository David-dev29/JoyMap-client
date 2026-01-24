import React, { useEffect, useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [debug, setDebug] = useState('');

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setDebug('App ya instalada (standalone mode)');
      return;
    }

    const handler = (e) => {
      console.log('✅ Event beforeinstallprompt capturado');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
      setDebug('Listo para instalar');
    };

    // Escuchar el evento
    window.addEventListener('beforeinstallprompt', handler);

    // Eventos adicionales para debug
    window.addEventListener('appinstalled', () => {
      console.log('✅ App instalada exitosamente');
      setIsVisible(false);
      setIsInstalled(true);
      setDebug('App instalada');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setDebug('Error: deferredPrompt no disponible');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('Usuario eligió:', outcome);
      setDebug(`Usuario: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('✅ App instalada');
        setIsVisible(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error en instalación:', error);
      setDebug(`Error: ${error.message}`);
    }
  };

  // No mostrar si ya está instalada
  if (isInstalled) return null;
  
  if (!isVisible) {
    return (
      <div className="fixed bottom-5 right-5 text-xs text-gray-600 bg-gray-100 p-2 rounded opacity-50">
        📱 {debug || 'Esperando evento...'}
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 animate-bounce">
      <button
        onClick={handleInstall}
        className="bg-[#E53935] hover:bg-[#D32F2F] text-white font-semibold px-5 py-3 rounded-full flex items-center gap-2 shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
        aria-label="Instalar aplicación"
      >
        <Download size={20} />
        <span>Instalar app</span>
      </button>
    </div>
  );
}