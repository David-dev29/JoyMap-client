/**
 * Servicios relacionados con órdenes
 */

import { authPost, authGet } from '../utils/authFetch';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Crea una nueva orden
 * @param {Object} orderData - Datos de la orden
 * @param {string} token - Token de autenticación (opcional, usa localStorage si no se proporciona)
 * @returns {Promise<Object>} - Orden creada
 */
export const createOrder = async (orderData, token = null) => {
  // Si se proporciona un token directo, usarlo en lugar de localStorage
  if (token) {
    const response = await fetch(`${API_URL}/api/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al crear la orden');
    }

    return data;
  }

  // Si no hay token directo, usar authPost (lee de localStorage)
  const response = await authPost(`${API_URL}/api/orders/create`, orderData);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al crear la orden');
  }

  return data;
};

/**
 * Obtiene las órdenes del usuario actual
 * @returns {Promise<Array>} - Lista de órdenes
 */
export const getMyOrders = async () => {
  const response = await authGet(`${API_URL}/api/me/orders`);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.orders || [];
};

/**
 * Obtiene una orden por ID
 * @param {string} orderId - ID de la orden
 * @returns {Promise<Object>} - Datos de la orden
 */
export const getOrderById = async (orderId) => {
  const response = await authGet(`${API_URL}/api/orders/${orderId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener la orden');
  }

  return data.order || data;
};
