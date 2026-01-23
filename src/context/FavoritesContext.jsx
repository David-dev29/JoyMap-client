import React, { createContext, useState, useContext, useEffect } from "react";

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
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(product.id)) {
        newSet.delete(product.id);
      } else {
        newSet.add(product.id);
      }
      return newSet;
    });
  };

  const isFavorite = (productId) => {
    return favoriteIds.has(productId);
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

export const useFavorites = () => useContext(FavoritesContext);

export default FavoritesContext;
