/**
 * Servicios relacionados con negocios
 */

import { apiGet } from './api';

/**
 * Obtiene negocios por tipo (comida, tienda, envio)
 * @param {string} type - Tipo de negocio
 * @returns {Promise<Array>} - Lista de negocios
 */
export const getBusinessesByType = async (type) => {
  const data = await apiGet(`/api/businesses/type/${type}`);
  return data.response || [];
};

/**
 * Obtiene un negocio por su slug
 * @param {string} slug - Slug del negocio
 * @returns {Promise<Object>} - Datos del negocio
 */
export const getBusinessBySlug = async (slug) => {
  const data = await apiGet(`/api/businesses/slug/${slug}`);
  return data.business || data;
};

/**
 * Obtiene todos los negocios
 * @returns {Promise<Array>} - Lista de todos los negocios
 */
export const getAllBusinesses = async () => {
  const data = await apiGet('/api/businesses/businesses');
  return data.response || data.businesses || [];
};

/**
 * Obtiene las categorías de negocios por tipo
 * @param {string} type - Tipo de negocio
 * @returns {Promise<Array>} - Lista de categorías
 */
export const getBusinessCategories = async (type) => {
  const data = await apiGet(`/api/business-categories/type/${type}`);
  return data.categories || data.response || [];
};

/**
 * Obtiene subcategorías por tipo
 * @param {string} type - Tipo de producto
 * @returns {Promise<Array>} - Lista de subcategorías
 */
export const getSubcategories = async (type) => {
  const data = await apiGet(`/api/subcategories?type=${type}`);
  return data.subcategories || data.response || [];
};

/**
 * Obtiene todos los productos
 * @returns {Promise<Array>} - Lista de productos
 */
export const getAllProducts = async () => {
  const data = await apiGet('/api/products');
  return data.products || data.response || [];
};
