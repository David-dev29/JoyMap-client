/**
 * Constantes globales de la aplicación
 */

// Ubicación por defecto (Puebla, México)
export const DEFAULT_LOCATION = {
  lat: 19.03908,
  lng: -98.33858,
};

// Tipos de negocio
export const BUSINESS_TYPES = {
  FOOD: 'comida',
  STORE: 'tienda',
  SHIPPING: 'envio',
};

// Métodos de pago
export const PAYMENT_METHODS = [
  { label: 'Efectivo', value: 'cash' },
  { label: 'Tarjeta', value: 'card' },
  { label: 'Transferencia', value: 'transfer' },
];

// Opciones de propina
export const TIP_OPTIONS = [
  { label: 'No, gracias', value: 0, percentage: 0 },
  { label: 'MXN 5', value: 5, percentage: null },
  { label: 'MXN 10', value: 10, percentage: null },
  { label: '10%', value: null, percentage: 10 },
  { label: '15%', value: null, percentage: 15 },
  { label: '20%', value: null, percentage: 20 },
];

// Costo de envío fijo
export const DELIVERY_FEE = 15;

// Configuración del mapa
export const MAP_CONFIG = {
  defaultZoom: 12,
  maxZoom: 18,
  minZoom: 10,
  clusterRadius: 60,
};

// Configuración de geolocalización
export const GEOLOCATION_CONFIG = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutos
};

// localStorage keys
export const STORAGE_KEYS = {
  AUTH: 'auth',
  USER_DATA: 'userData',
  CART_ITEMS: 'cartItems',
  USER_ADDRESSES: 'userAddresses',
  USER_ADDRESS: 'userAddress',
  FAVORITE_IDS: 'favoriteIds',
};

// Emojis por defecto para negocios
export const DEFAULT_BUSINESS_EMOJI = {
  comida: '🍔',
  tienda: '🏪',
  envio: '📦',
};
