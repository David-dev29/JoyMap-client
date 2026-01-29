import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

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
    // Disparar evento custom para sincronizar con el header
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, [items]);

  /**
   * Agregar producto al carrito
   * @param {Object} product - Producto a agregar (debe incluir businessId)
   * @param {number} quantity - Cantidad
   * @param {string} businessId - ID del negocio (opcional si ya está en product)
   * @param {boolean} showToast - Mostrar notificación (default: true)
   */
  const addItem = useCallback((product, quantity = 1, businessId = null, showToast = true) => {
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

    // Mostrar toast de confirmación
    if (showToast) {
      toast.success('Producto agregado al carrito');
    }
  }, []);

  /**
   * Eliminar producto del carrito
   * @param {string} productId - ID del producto
   * @param {boolean} showToast - Mostrar notificación (default: true)
   */
  const removeItem = useCallback((productId, showToast = true) => {
    setItems((prev) =>
      prev.filter((item) => (item.product.id || item.product._id) !== productId)
    );

    if (showToast) {
      toast.error('Producto eliminado del carrito');
    }
  }, []);

  /**
   * Actualizar cantidad de un producto
   */
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId, true); // Mostrar toast al eliminar
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        (item.product.id || item.product._id) === productId
          ? { ...item, quantity }
          : item
      )
    );
    // No mostrar toast para cambios de cantidad (sería muy repetitivo)
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
   * @param {boolean} showToast - Mostrar notificación (default: false para no duplicar con otros toasts)
   */
  const clearCart = useCallback((showToast = false) => {
    setItems([]);
    if (showToast) {
      toast.error('Carrito vaciado');
    }
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
