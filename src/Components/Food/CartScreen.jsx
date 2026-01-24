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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Volver */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center">
        <button className="mr-2" onClick={handleBack}>
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-sm font-bold text-gray-800">Atrás</span>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">Tu carrito está vacío</p>
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
    : `${item.quantity}`
  }
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
                
                  
                  className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total y botón */}
      <div className="bg-white border-t border-gray-200 px-5 py-4 sticky bottom-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Total destacado */}
          <div className="flex-1 sm:text-left text-center">
            <div className="text-xs text-gray-500 mb-1">Total del pedido</div>
            <div className={`text-2xl font-extrabold text-red-700 transition-transform ${animateTotal ? 'animate-bounce' : ''}`}>
              MXN {totalPrice}
            </div>
          </div>

          {/* Botón */}
          <button
            onClick={() => navigate("/address", { replace: true })}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow-md hover:bg-primary-800 transition-all w-full sm:w-auto"
          >
            <CheckCircle className="w-5 h-5" />
            Continuar
          </button>
        </div>

        <p className="mt-4 text-[10px] text-gray-400 text-center leading-snug">
          Al hacer clic en continuar, aceptas nuestros{' '}
          <span className="underline">términos de uso</span> y{' '}
          <span className="underline">política de privacidad</span>.
        </p>
      </div>
    </div>
  );
}






