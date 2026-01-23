/**
 * Wrapper de fetch que agrega automáticamente el token de autorización
 * y maneja errores de autenticación (401)
 */

const getToken = () => {
  try {
    const auth = localStorage.getItem("auth");
    if (auth) {
      const { token } = JSON.parse(auth);
      return token;
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * Fetch con autorización automática
 * @param {string} url - URL del endpoint
 * @param {RequestInit} options - Opciones de fetch
 * @returns {Promise<Response>}
 */
export const authFetch = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si el token expiró o es inválido
  if (response.status === 401) {
    console.warn("Token expirado o inválido");
    // Limpiar auth del localStorage
    localStorage.removeItem("auth");
    // Opcionalmente disparar evento para que la app reaccione
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }

  return response;
};

/**
 * GET request con autorización
 */
export const authGet = (url, options = {}) => {
  return authFetch(url, { ...options, method: 'GET' });
};

/**
 * POST request con autorización
 */
export const authPost = (url, body, options = {}) => {
  return authFetch(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * PUT request con autorización
 */
export const authPut = (url, body, options = {}) => {
  return authFetch(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

/**
 * DELETE request con autorización
 */
export const authDelete = (url, options = {}) => {
  return authFetch(url, { ...options, method: 'DELETE' });
};

export default authFetch;
