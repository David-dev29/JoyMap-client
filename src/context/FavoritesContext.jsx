import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  // Cargar favoritos desde localStorage o iniciar vacío
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const stored = localStorage.getItem("favoriteIds");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Guardar favoritos en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem("favoriteIds", JSON.stringify([...favoriteIds]));
  }, [favoriteIds]);

  const toggleFavorite = (product) => {
    const productId = product.id || product._id;
    const wasAlreadyFavorite = favoriteIds.has(productId);

    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    // Mostrar toast según la acción
    if (wasAlreadyFavorite) {
      toast.error('Eliminado de favoritos');
    } else {
      toast.success('Agregado a favoritos');
    }
  };

  const isFavorite = (productId) => {
    return favoriteIds.has(productId) || favoriteIds.has(String(productId));
  };

  const clearFavorites = () => {
    setFavoriteIds(new Set());
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
