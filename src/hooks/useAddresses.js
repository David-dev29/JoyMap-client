import { useState, useEffect, useCallback } from 'react';
import { reverseGeocode, searchAddresses } from '../services/geocodingService';

const ADDRESSES_STORAGE_KEY = 'userAddresses';
const SELECTED_ADDRESS_KEY = 'userAddress';

/**
 * Hook para manejar direcciones del usuario
 */
export function useAddresses() {
  const [addresses, setAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem(ADDRESSES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [selectedAddress, setSelectedAddress] = useState(() => {
    try {
      return localStorage.getItem(SELECTED_ADDRESS_KEY) || null;
    } catch {
      return null;
    }
  });

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Persistir direcciones en localStorage
  useEffect(() => {
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  // Persistir dirección seleccionada
  useEffect(() => {
    if (selectedAddress) {
      localStorage.setItem(SELECTED_ADDRESS_KEY, selectedAddress);
    }
  }, [selectedAddress]);

  /**
   * Agregar nueva dirección
   */
  const addAddress = useCallback((address) => {
    const newAddress = {
      id: Date.now().toString(),
      street: address.street || address.formatted || address,
      reference: address.reference || '',
      coordinates: address.coordinates || null,
      createdAt: new Date().toISOString(),
    };

    setAddresses((prev) => [...prev, newAddress]);
    return newAddress;
  }, []);

  /**
   * Eliminar dirección
   */
  const removeAddress = useCallback((addressId) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));

    // Si era la dirección seleccionada, limpiar
    if (selectedAddress === addressId) {
      setSelectedAddress(null);
      localStorage.removeItem(SELECTED_ADDRESS_KEY);
    }
  }, [selectedAddress]);

  /**
   * Seleccionar dirección
   */
  const selectAddress = useCallback((address) => {
    const addressString = typeof address === 'string' ? address : address.street;
    setSelectedAddress(addressString);
  }, []);

  /**
   * Buscar direcciones con geocodificación
   */
  const search = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchAddresses(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error buscando direcciones:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  /**
   * Obtener dirección desde coordenadas (ubicación actual)
   */
  const getAddressFromCoords = useCallback(async (lat, lng) => {
    try {
      const result = await reverseGeocode(lat, lng);
      return result;
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      return null;
    }
  }, []);

  /**
   * Limpiar resultados de búsqueda
   */
  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  /**
   * Obtener dirección seleccionada completa
   */
  const getSelectedAddressObject = useCallback(() => {
    return addresses.find((addr) => addr.street === selectedAddress || addr.id === selectedAddress);
  }, [addresses, selectedAddress]);

  return {
    addresses,
    selectedAddress,
    searchResults,
    searchLoading,
    addAddress,
    removeAddress,
    selectAddress,
    search,
    clearSearch,
    getAddressFromCoords,
    getSelectedAddressObject,
    isEmpty: addresses.length === 0,
  };
}

export default useAddresses;
