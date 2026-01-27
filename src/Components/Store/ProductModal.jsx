import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Minus, Plus, Star } from 'lucide-react';

export default function ProductModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onToggleFavorite, 
  isFavorite 
}) {
  const isFruit = product?.category === "Frutas";
  const GRAM_STEP = 250;
  const MIN_GRAMS = GRAM_STEP;

  const [quantity, setQuantity] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);

  // ✅ Normalizar URL de imagen
  const productImage = useMemo(() => {
    if (!product?.image) return null;
    
    if (product.image.startsWith('http')) {
      return product.image;
    }
    
    if (product.image.includes('cloudfront.net') || product.image.includes('amazonaws.com')) {
      return `https://${product.image}`;
    }
    
    return product.image;
  }, [product?.image]);

  const handleAdd = () => {
    const productToAdd = selectedSize
      ? { ...product, selectedSizeLabel: selectedSize.label, price: selectedSize.price }
      : product;

    onAddToCart(productToAdd, quantity);
  };

  const handleFavoriteClick = () => {
    onToggleFavorite?.(product);
  };

  useEffect(() => {
    if (isOpen && product) {
      const defaultQuantity = product.category === "Frutas" ? MIN_GRAMS : 1;
      setQuantity(defaultQuantity);
      setSelectedSize(product?.sizes?.[0] || null);
      setImageLoaded(false);
      setImageError(false);
      setDragY(0);
      setIsDragging(false);
      
      // Animación de entrada
      setTimeout(() => setModalVisible(true), 10);
    } else {
      setModalVisible(false);
    }
  }, [isOpen, product]);

  // ✅ Bloqueo de scroll sin afectar la posición
  useEffect(() => {
    if (isOpen) {
      // Guardar posición actual
      scrollTopRef.current = window.pageYOffset || document.documentElement.scrollTop;
      
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollTopRef.current}px`;
      document.body.style.width = '100%';
    } else {
      // Restaurar posición exacta
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollTopRef.current);
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!product || !isOpen) return null;

  const handleClose = () => {
    setModalVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // ✅ Touch handlers mejorados
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    
    // Verificar si el contenido está en la parte superior
    const content = contentRef.current;
    const isAtTop = content ? content.scrollTop === 0 : true;
    
    if (isAtTop) {
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - startYRef.current;
    
    // Solo permitir arrastrar hacia abajo y prevenir pull-to-refresh
    if (deltaY > 0) {
      e.preventDefault();
      setDragY(deltaY);
    } else {
      setIsDragging(false);
      setDragY(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Si arrastra más de 100px, cerrar
    if (dragY > 100) {
      handleClose();
    } else {
      // Volver a la posición original
      setDragY(0);
    }
  };

  // ✅ Click fuera del modal para cerrar
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
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
    <div 
      className={`fixed inset-0 z-50 flex items-end transition-all duration-300 ${
        modalVisible ? 'bg-black/30 backdrop-blur-md' : 'bg-transparent'
      }`}
      onClick={handleOverlayClick}
      style={{ touchAction: isDragging ? 'none' : 'auto' }}
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-t-[2rem] w-full max-w-md mx-auto max-h-[90vh] flex flex-col overflow-hidden shadow-xl transition-transform duration-300 ease-out"
        style={{
          transform: isDragging 
            ? `translateY(${dragY}px)` 
            : modalVisible 
              ? 'translateY(0)' 
              : 'translateY(100%)',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar para arrastrar */}
        <div 
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Imagen - Ahora ocupa todo el espacio */}
        <div 
          className="relative w-full h-64 overflow-hidden bg-white"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Skeleton Loader */}
          {!imageLoaded && !imageError && productImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          )}

          {/* Imagen del Producto - Cover para llenar el espacio */}
          {productImage && !imageError ? (
            <img
              src={productImage}
              alt={product.name}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="eager"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.error('Error cargando imagen:', productImage);
                setImageError(true);
              }}
            />
          ) : null}

          {/* Placeholder si no hay imagen */}
          {(imageError || !productImage) && (
            <div className="absolute inset-0 flex items-center justify-center ">
              <span className="text-6xl">🍽️</span>
            </div>
          )}

          {/* Overlay gradient para mejorar legibilidad del botón */}
          <div className="absolute inset-0  pointer-events-none"></div>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md backdrop-blur-md transition z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto px-6 pt-6 pb-36"
          style={{ 
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>

          {product.description && (
            <p className="text-gray-600 text-sm mt-2">{product.description}</p>
          )}

          {/* Precio + botón favoritos */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-lg font-bold text-gray-900">
              MXN {parseFloat(product.price).toFixed(2)}
            </p>
            <button
              onClick={handleFavoriteClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                isFavorite
                  ? 'bg-yellow-400 text-white border-yellow-400'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <Star
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-white' : 'fill-none'
                }`}
              />
              <span className="text-sm font-semibold">
                {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
              </span>
            </button>
          </div>

          <div className="mt-4 border-b border-gray-200"></div>

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
              <p className="text-sm text-gray-500 mb-3">
                Seleccione mínimo 1 opción
              </p>

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
                          selected
                            ? 'border-red-600 bg-red-600'
                            : 'border-gray-300 bg-white'
                        } flex items-center justify-center`}
                      >
                        {selected && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
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
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-md"
          >
            Agregar MXN {totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
}