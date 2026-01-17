import React, { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AccountSummary() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [showProducts, setShowProducts] = useState(true);
  const [showTotals, setShowTotals] = useState(true);

  // 🔹 Cargar carrito desde localStorage al montar el componente
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(storedCart);
  }, []);

  // 🔹 Calcular subtotal, delivery y total
  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.product.price) || 0;
    const quantity = Number(item.quantity) || 0;

    if (item.product.category === "Frutas") {
      const pricePerGram = price / 1000;
      return acc + pricePerGram * quantity;
    }

    return acc + price * quantity;
  }, 0);

  const delivery = subtotal > 0 ? 16.83 : 0;
  const total = subtotal + delivery;

  const handleBack = () => {
    navigate("/deliveryOrder", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start p-4">
      <div className="bg-white w-full max-w-md shadow-sm rounded-md">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-gray-600 transition-colors mr-3"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-medium text-gray-900">Resumen de cuenta</h2>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-4">
          {/* Productos */}
          <div>
            <button
              onClick={() => setShowProducts(!showProducts)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <span className="font-medium text-gray-900">
                Tus productos ({cartItems.length})
              </span>
              {showProducts ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>

            {showProducts && (
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.product?.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product?.name}</span>
                    <span className="font-medium text-gray-900">
                      {item.product?.category === "Frutas"
                        ? `${item.quantity} g`
                        : item.quantity} × MXN {item.product?.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totales */}
          <div>
            <button
              onClick={() => setShowTotals(!showTotals)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <span className="text-sm text-gray-600">Resumen de totales</span>
              {showTotals ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </button>

            {showTotals && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-600">MXN {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entrega</span>
                  <span className="text-gray-600">MXN {delivery.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Total general */}
          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900">TOTAL CUENTA</span>
              <span className="font-bold text-lg text-gray-900">MXN {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





