import { useState, useEffect, useCallback, useMemo } from 'react';

const CART_STORAGE_KEY = 'cartItems';

/**
 * Hook para manejar el carrito de compras
 */
export function useCart() {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persistir en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /**
   * Agregar producto al carrito
   * @param {Object} product - Producto a agregar (debe incluir businessId)
   * @param {number} quantity - Cantidad
   * @param {string} businessId - ID del negocio (opcional si ya está en product)
   */
  const addItem = useCallback((product, quantity = 1, businessId = null) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => (item.product.id || item.product._id) === (product.id || product._id)
      );

      if (existingIndex >= 0) {
        // Actualizar cantidad si ya existe
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      // Determinar businessId
      const itemBusinessId = businessId || product.businessId;

      // Agregar nuevo item con businessId
      return [...prev, {
        product: { ...product, businessId: itemBusinessId },
        quantity,
        businessId: itemBusinessId
      }];
    });
  }, []);

  /**
   * Eliminar producto del carrito
   */
  const removeItem = useCallback((productId) => {
    setItems((prev) =>
      prev.filter((item) => (item.product.id || item.product._id) !== productId)
    );
  }, []);

  /**
   * Actualizar cantidad de un producto
   */
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        (item.product.id || item.product._id) === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  /**
   * Incrementar cantidad
   */
  const incrementQuantity = useCallback((productId, amount = 1) => {
    setItems((prev) =>
      prev.map((item) =>
        (item.product.id || item.product._id) === productId
          ? { ...item, quantity: item.quantity + amount }
          : item
      )
    );
  }, []);

  /**
   * Decrementar cantidad
   */
  const decrementQuantity = useCallback((productId, amount = 1, minQuantity = 1) => {
    setItems((prev) =>
      prev.map((item) => {
        if ((item.product.id || item.product._id) !== productId) {
          return item;
        }
        const newQuantity = Math.max(minQuantity, item.quantity - amount);
        return { ...item, quantity: newQuantity };
      })
    );
  }, []);

  /**
   * Limpiar carrito
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Obtener item por ID
   */
  const getItem = useCallback((productId) => {
    return items.find((item) => (item.product.id || item.product._id) === productId);
  }, [items]);

  /**
   * Verificar si un producto está en el carrito
   */
  const isInCart = useCallback((productId) => {
    return items.some((item) => (item.product.id || item.product._id) === productId);
  }, [items]);

  // Cálculos memorizados
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.product.price || 0;
      const quantity = item.quantity || 0;
      return sum + price * quantity;
    }, 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  const isEmpty = items.length === 0;

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getItem,
    isInCart,
    subtotal,
    itemCount,
    isEmpty,
  };
}

export default useCart;
