import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';

export default function ProductModal({ product, isOpen, onClose, onAddToCart }) {
  const isFruit = product?.category === "Frutas";
  const GRAM_STEP = 250;
  const MIN_GRAMS = GRAM_STEP;

  const [quantity, setQuantity] = useState(null);


  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  


  const handleAdd = () => {
    const productToAdd = selectedSize
      ? { ...product, selectedSizeLabel: selectedSize.label, price: selectedSize.price }
      : product;

    onAddToCart(productToAdd, quantity);
  };

  useEffect(() => {
    if (isOpen && product) {
      const defaultQuantity = product.category === "Frutas" ? MIN_GRAMS : 1;
      setQuantity(defaultQuantity);
      setSelectedSize(product?.sizes?.[0] || null);
    }
  }, [isOpen, product]);
  
  

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!product || !isOpen) return null;

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 300);
  };

  const handleQuantityChange = (delta) => {
    if (isFruit) {
      const newQty = Math.max(MIN_GRAMS, quantity + delta * GRAM_STEP);
      setQuantity(newQty);
    } else {
      setQuantity(Math.max(1, quantity + delta));
    }
  };
  
  const getDisplayQuantity = () => {
    if (!isFruit) return quantity;
    if (quantity < 1000) return `${quantity}g`;
    const kilos = quantity / 1000;
    return `${kilos % 1 === 0 ? kilos : kilos.toFixed(2)}kg`;
  };
  

  const unitPrice = selectedSize?.price || product.price;
  const totalPrice = isFruit
  ? ((unitPrice / 1000) * quantity).toFixed(2)
  : (unitPrice * quantity).toFixed(2);


  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-md pt-4 transition-all duration-300">
      <div
        className={`relative bg-white rounded-t-[2rem] w-full max-w-md mx-auto max-h-[90vh] flex flex-col overflow-hidden transition-transform duration-300 shadow-xl ${
          isAnimating ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Imagen */}
        <div className="relative w-full h-64 overflow-hidden rounded-t-[2rem] bg-white">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-6"
          />
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 bg-white/70 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md backdrop-blur-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-36 ">
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>

          {product.description && (
            <p className="text-gray-600 text-sm mt-2">{product.description}</p>
          )}

          {/* Precio principal */}
          <p className="text-lg font-bold text-gray-900 mt-4">
            MXN {parseFloat(product.price).toFixed(2)}
          </p>
          <div className='mt-4 border-b border-gray-200'></div>

          {/* Selector de tamaño */}
{product.sizes && (
  <div className="mt-6">
    <div className="flex items-center gap-2 mb-1">
      <h3 className="text-base font-bold text-gray-900">
        Elige tu tamaño
      </h3>
      <span className="text-xs text-gray-700 bg-transparent border border-gray-300 rounded-full px-2 py-0.5">
        Obligatorio
      </span>
    </div>
    <p className="text-sm text-gray-500 mb-3">Seleccione mínimo 1 opción</p>

    <div className="divide-y divide-gray-200">
      {product.sizes.map((size, index) => {
        const selected = selectedSize?.label === size.label;
        return (
          <div
            key={index}
            onClick={() => setSelectedSize(size)}
            className="flex items-center justify-between py-3 cursor-pointer"
          >
            <div>
              <h4 className="text-sm text-gray-700">{size.label}</h4>
              <p className="text-base font-semibold text-gray-900">
                MXN {size.price.toFixed(2)}
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 ${
                selected ? 'border-rose-600 bg-rose-600' : 'border-gray-300 bg-white'
              } flex items-center justify-center`}
            >
              {selected && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

        </div>

        {/* Botones */}
        <div className="absolute bottom-0 left-0 w-full bg-white px-6 py-5 flex items-center justify-between gap-4 border-t border-gray-200">
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition ${
                quantity <= 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-base font-medium text-gray-900 px-4">
  {getDisplayQuantity()}
</span>

            <button
              onClick={() => handleQuantityChange(1)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:text-black transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-md"
          >
            Agregar MXN {totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
}






