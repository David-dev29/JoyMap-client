/**
 * Configuración base para llamadas a la API
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Realiza una petición a la API
 * @param {string} endpoint - Endpoint de la API (ej: /api/businesses)
 * @param {RequestInit} options - Opciones de fetch
 * @returns {Promise<any>} - Respuesta de la API
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Si hay body y es objeto, convertir a JSON
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
    const response = await fetch(url, config);

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status}`, data);
      throw new Error(data.message || `Error ${response.status}`);
    }

    console.log(`✅ API Response:`, data);
    return data;
  } catch (error) {
    console.error(`❌ API Request Failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = (endpoint) => apiRequest(endpoint, { method: 'GET' });

/**
 * POST request
 */
export const apiPost = (endpoint, body) => apiRequest(endpoint, { method: 'POST', body });

/**
 * PUT request
 */
export const apiPut = (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body });

/**
 * DELETE request
 */
export const apiDelete = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });

export default apiRequest;
