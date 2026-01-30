import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CartScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialItems = state?.cartItems || [];
  const [cartItems, setCartItems] = useState(initialItems);
  const [animateTotal, setAnimateTotal] = useState(false);

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = Number(item.product.price) || 0;
    const quantity = Number(item.quantity) || 0;


    if (item.product.category === "Frutas") {
      const pricePerGram = price / 1000;
      return acc + pricePerGram * quantity;
    }
  
    return acc + price * quantity;
  }, 0).toFixed(2);


  useEffect(() => {
    setAnimateTotal(true);
    const timer = setTimeout(() => setAnimateTotal(false), 500);
    return () => clearTimeout(timer);
  }, [totalPrice]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRemoveItem = (id) => {
    const updatedItems = cartItems.filter(item => item.product.id !== id);
    setCartItems(updatedItems);
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    const updatedItems = cartItems.map(item => {
      if (item.product.id === id) {
        const isFruit = item.product.category === "Frutas";
        const minQty = isFruit ? 250 : 1;
        if (newQuantity < minQty) return item; // no bajar de mínimo
  
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
  
    setCartItems(updatedItems);
  };
  

  return (
    <div className="h-[100dvh] bg-gray-50 flex flex-col overflow-hidden">
      {/* Header estandarizado */}
      <header className="flex-shrink-0 z-50 bg-white px-4 h-14 flex items-center gap-3 border-b border-gray-100 shadow-sm">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Mi carrito</h1>
      </header>

      {/* Cart Items - área con scroll */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <p className="text-center text-gray-500">Tu carrito está vacío</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between bg-white px-4 py-5 border-b border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-md object-contain"
                />
                <div className="text-sm max-w-xs">
                  <h3 className="text-gray-800 font-bold text-sm leading-tight line-clamp-2 break-words">
                    {item.product.name}
                  </h3>
                  <p className="text-xs font-semibold text-gray-500">
                    MXN {item.product.price.toFixed(2)} ×{" "}
                    {item.product.category === "Frutas"
                      ? `${item.quantity}g`
                      : `${item.quantity}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                {(item.product.category === "Frutas" && item.quantity === 250) ||
                 (item.product.category !== "Frutas" && item.quantity === 1) ? (
                  <button
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleUpdateQuantity(
                        item.product.id,
                        item.product.category === "Frutas"
                          ? item.quantity - 250
                          : item.quantity - 1
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}

                <span className="text-sm font-bold text-gray-800 w-14 text-center">
                  {item.product.category === "Frutas"
                    ? item.quantity >= 1000
                      ? `${(item.quantity / 1000).toFixed(1)}kg`
                      : `${item.quantity} g`
                    : item.quantity}
                </span>

                <button
                  onClick={() =>
                    handleUpdateQuantity(
                      item.product.id,
                      item.product.category === "Frutas"
                        ? item.quantity + 250
                        : item.quantity + 1
                    )
                  }
                  className="w-8 h-8 flex items-center justify-center text-rose-600 hover:text-rose-800"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer fijo con Total y botón - siempre visible */}
      {cartItems.length > 0 && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-5 py-4 shadow-up">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-0.5">Total</div>
              <div className={`text-xl font-extrabold text-rose-700 transition-transform ${animateTotal ? 'scale-105' : ''}`}>
                MXN {totalPrice}
              </div>
            </div>
            <button
              onClick={() => navigate("/address", { replace: true })}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-rose-600 text-white text-sm font-semibold shadow-md hover:bg-rose-700 active:scale-95 transition-all"
            >
              <CheckCircle className="w-5 h-5" />
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}






