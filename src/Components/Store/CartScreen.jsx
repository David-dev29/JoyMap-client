import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ✅ Componente para cada item del carrito
const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ✅ Normalizar URL de imagen
  const productImage = useMemo(() => {
    if (!item?.product?.image) return null;
    
    if (item.product.image.startsWith('http')) {
      return item.product.image;
    }
    
    if (item.product.image.includes('cloudfront.net') || item.product.image.includes('amazonaws.com')) {
      return `https://${item.product.image}`;
    }
    
    return item.product.image;
  }, [item?.product?.image]);

  const isFruit = item.product.category === "Frutas";
  const minQty = isFruit ? 250 : 1;
  const isMinimum = item.quantity === minQty;

  return (
    <div className="flex items-center justify-between bg-white px-4 py-5 border-b border-gray-100">
      <div className="flex items-center space-x-4">
        {/* Imagen del producto */}
        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          {!imageLoaded && !imageError && productImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          )}

          {productImage && !imageError ? (
            <img
              src={productImage}
              alt={item.product.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.error('Error cargando imagen:', productImage);
                setImageError(true);
              }}
            />
          ) : null}

          {(imageError || !productImage) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-2xl">🍽️</span>
            </div>
          )}
        </div>

        {/* Info del producto */}
        <div className="text-sm max-w-xs">
          <h3 className="text-gray-800 font-bold text-sm leading-tight line-clamp-2 break-words">
            {item.product.name}
          </h3>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            MXN {item.product.price.toFixed(2)} ×{" "}
            {isFruit ? `${item.quantity}g` : `${item.quantity}`}
          </p>
        </div>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center">
        {isMinimum ? (
          <button
            onClick={() => onRemove(item.product.id)}
            className="text-gray-400 hover:text-red-600 p-1 transition-colors"
            aria-label="Eliminar producto"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() =>
              onUpdateQuantity(
                item.product.id,
                isFruit ? item.quantity - 250 : item.quantity - 1
              )
            }
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Disminuir cantidad"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}

        <span className="text-sm font-bold text-gray-800 w-14 text-center">
          {isFruit
            ? item.quantity >= 1000
              ? `${(item.quantity / 1000).toFixed(1)}kg`
              : `${item.quantity}g`
            : item.quantity}
        </span>

        <button
          onClick={() =>
            onUpdateQuantity(
              item.product.id,
              isFruit ? item.quantity + 250 : item.quantity + 1
            )
          }
          className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 transition-colors"
          aria-label="Aumentar cantidad"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ✅ Componente principal
export default function CartScreen() {
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cartItems")) || []
  );

  const [animateTotal, setAnimateTotal] = useState(false);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = Number(item.product.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return item.product.category === "Frutas"
      ? acc + (price / 1000) * quantity
      : acc + price * quantity;
  }, 0).toFixed(2);

  useEffect(() => {
    setAnimateTotal(true);
    const timer = setTimeout(() => setAnimateTotal(false), 500);
    return () => clearTimeout(timer);
  }, [totalPrice]);

  const handleBack = () => navigate(-1);

  const handleRemoveItem = (id) =>
    setCartItems(cartItems.filter(item => item.product.id !== id));

  const handleUpdateQuantity = (id, newQuantity) => {
    setCartItems(cartItems.map(item => {
      if (item.product.id === id) {
        const minQty = item.product.category === "Frutas" ? 250 : 1;
        if (newQuantity < minQty) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
        <button className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors" onClick={handleBack}>
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-sm font-bold text-gray-800">Atrás</span>  
        {cartItems.length > 0 && (
          <span className="ml-auto text-xs text-gray-500 font-medium">
            {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
          </span>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-6xl">🛒</span>
            </div>
            <p className="text-center text-gray-500 font-medium text-lg">
              Tu carrito está vacío
            </p>
            <p className="text-center text-gray-400 text-sm mt-2">
              Agrega productos para continuar
            </p>
            <button
              onClick={handleBack}
              className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Explorar productos
            </button>
          </div>
        ) : (
          cartItems.map(item => (
            <CartItem
              key={item.product.id}
              item={item}
              onRemove={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))
        )}
      </div>

      {/* Total y botón */}
      {cartItems.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-5 py-4 sticky bottom-0 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 sm:text-left text-center">
              <div className="text-xs text-gray-500 mb-1">Total del pedido</div>
              <div className={`text-2xl font-extrabold text-red-700 transition-transform ${animateTotal ? 'scale-110' : ''}`}>
                MXN {totalPrice}
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout", { replace: true })}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow-md hover:bg-primary-700 active:scale-95 transition-all w-full sm:w-auto"
            >
              <CheckCircle className="w-5 h-5" />
              Continuar
            </button>
          </div>
          <p className="mt-4 text-[10px] text-gray-400 text-center leading-snug">
            Al hacer clic en continuar, aceptas nuestros{' '}
            <span className="underline cursor-pointer hover:text-gray-600">términos de uso</span> y{' '}
            <span className="underline cursor-pointer hover:text-gray-600">política de privacidad</span>.
          </p>
        </div>
      )}
    </div>
  );
}