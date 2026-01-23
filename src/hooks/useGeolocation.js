import { useState, useEffect, useCallback } from 'react';

// Ubicación por defecto: Puebla, México
const DEFAULT_LOCATION = { lat: 19.03908, lng: -98.33858 };

/**
 * Hook para obtener la ubicación del usuario
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.fallback - Ubicación por defecto si falla
 * @param {boolean} options.enableHighAccuracy - Alta precisión (default: true)
 * @param {number} options.timeout - Tiempo de espera en ms (default: 10000)
 * @param {number} options.maximumAge - Edad máxima del cache en ms (default: 300000)
 */
export function useGeolocation(options = {}) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'granted', 'denied', 'prompt'

  const fallback = options.fallback || DEFAULT_LOCATION;

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(fallback);
      setLoading(false);
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ lat: latitude, lng: longitude, accuracy });
        setError(null);
        setLoading(false);
        setPermissionStatus('granted');
      },
      (err) => {
        setLocation(fallback);
        setLoading(false);

        if (err.code === 1) {
          setPermissionStatus('denied');
        }
      },
      {
        enableHighAccuracy: options.enableHighAccuracy !== false,
        timeout: options.timeout || 10000,
        maximumAge: options.maximumAge || 300000, // 5 minutos
      }
    );
  }, [fallback, options.enableHighAccuracy, options.timeout, options.maximumAge]);

  // Verificar permisos al montar
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);

        result.addEventListener('change', () => {
          setPermissionStatus(result.state);
          if (result.state === 'granted') {
            requestLocation();
          }
        });
      });
    }

    // Solicitar ubicación automáticamente
    requestLocation();
  }, [requestLocation]);

  return {
    location,
    error,
    loading,
    permissionStatus,
    requestLocation, // Para solicitar de nuevo manualmente
    isGranted: permissionStatus === 'granted',
    isDenied: permissionStatus === 'denied',
  };
}

export default useGeolocation;
