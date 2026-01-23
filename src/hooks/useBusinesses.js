import { useState, useEffect, useCallback } from 'react';
import { getBusinessesByType, getAllBusinesses, getBusinessBySlug } from '../services/businessService';

/**
 * Hook para cargar negocios por tipo
 * @param {string} type - Tipo de negocio (comida, tienda, envio)
 */
export function useBusinesses(type) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBusinesses = useCallback(async () => {
    if (!type) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`📦 Cargando negocios de tipo: ${type}`);
      const data = await getBusinessesByType(type);

      console.log(`✅ ${data.length} negocios cargados`);

      // Log de debug para coordenadas
      const withCoords = data.filter(b => b.location?.coordinates);
      const withoutCoords = data.filter(b => !b.location?.coordinates);

      console.log(`📍 Con coordenadas: ${withCoords.length}`);
      console.log(`⚠️ Sin coordenadas: ${withoutCoords.length}`);

      if (withoutCoords.length > 0) {
        console.log('Negocios sin coordenadas:', withoutCoords.map(b => b.name));
      }

      setBusinesses(data);
    } catch (err) {
      console.error('❌ Error cargando negocios:', err);
      setError(err.message);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return {
    businesses,
    loading,
    error,
    refetch: fetchBusinesses,
    // Helpers
    businessesWithCoords: businesses.filter(b => b.location?.coordinates),
    isEmpty: !loading && businesses.length === 0,
  };
}

/**
 * Hook para cargar un negocio por slug
 * @param {string} slug - Slug del negocio
 */
export function useBusinessBySlug(slug) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchBusiness = async () => {
      setLoading(true);
      try {
        console.log(`📦 Cargando negocio: ${slug}`);
        const data = await getBusinessBySlug(slug);
        setBusiness(data);
      } catch (err) {
        console.error('❌ Error cargando negocio:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [slug]);

  return { business, loading, error };
}

/**
 * Hook para cargar todos los negocios
 */
export function useAllBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await getAllBusinesses();
        setBusinesses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { businesses, loading, error };
}

export default useBusinesses;
