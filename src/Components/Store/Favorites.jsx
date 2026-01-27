import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";

const Favorites = ({ allProducts = [] }) => {
  const navigate = useNavigate();
  const { favoriteIds } = useFavorites();

  // Detectar si el id viene como `id` o `_id` y filtrar
  const favoriteProducts = allProducts.filter(product =>
    favoriteIds.has(product.id || product._id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con flecha de atrás */}
      <div className="bg-white px-4 py-4 flex items-center border-b border-gray-200">
        <button
          onClick={() => navigate("/tienda")}
          className="mr-3 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <span className="text-lg font-medium text-gray-900">Favoritos</span>
      </div>

      <div className="px-4 py-4">
        {favoriteProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">💝</div>
            <p className="text-gray-500 text-center">
              No tienes productos favoritos aún
            </p>
          </div>
        ) : (
          favoriteProducts.map(product => (
            <div
              key={product.id || product._id}
              className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
            >
              <div className="flex items-center">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    MXN ${product.price?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Favorites;

