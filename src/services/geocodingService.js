/**
 * Servicios de geocodificación (OpenCage y Radar)
 */

const OPENCAGE_KEY = import.meta.env.VITE_OPENCAGE_KEY;
const RADAR_KEY = import.meta.env.VITE_RADAR_KEY;

/**
 * Geocodificación inversa: coordenadas → dirección
 * Usa OpenCage API
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<string|null>} - Dirección formateada
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPENCAGE_KEY}&language=es`
    );

    if (!response.ok) {
      throw new Error('Error en geocodificación inversa');
    }

    const data = await response.json();
    const result = data?.results?.[0];

    if (result) {
      return {
        formatted: result.formatted,
        components: result.components,
        coordinates: { lat, lng }
      };
    }

    return null;
  } catch (error) {
    console.error('Error en reverseGeocode:', error);
    return null;
  }
};

/**
 * Geocodificación directa: dirección → coordenadas
 * Usa Radar API
 * @param {string} address - Dirección a buscar
 * @returns {Promise<Array>} - Lista de resultados
 */
export const forwardGeocode = async (address) => {
  try {
    const response = await fetch(
      `https://api.radar.io/v1/geocode/forward?query=${encodeURIComponent(address)}`,
      {
        headers: {
          'Authorization': RADAR_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error('Error en geocodificación directa');
    }

    const data = await response.json();

    return (data.addresses || []).map(addr => ({
      formatted: addr.formattedAddress,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      coordinates: {
        lat: addr.latitude,
        lng: addr.longitude
      }
    }));
  } catch (error) {
    console.error('Error en forwardGeocode:', error);
    return [];
  }
};

/**
 * Busca direcciones con autocompletado
 * @param {string} query - Texto de búsqueda
 * @returns {Promise<Array>} - Lista de sugerencias
 */
export const searchAddresses = async (query) => {
  if (!query || query.length < 3) {
    return [];
  }

  return forwardGeocode(query);
};
