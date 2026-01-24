import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Clock, Star } from 'lucide-react';

// ✅ Componente memoizado para cada categoría
const CategoryCard = ({ cat, onClick, isExpanded }) => (
  <div
    onClick={() => onClick(cat.id)}
    className={`group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 border border-gray-100 ${
      isExpanded ? 'ring-2 ring-[#E53935]' : ''
    }`}
  >
    <div className="p-4 h-28 flex flex-col justify-between">
      <div className="relative z-10">
        <h3 className="text-gray-900 font-bold text-base leading-tight mb-1">
          {cat.line1}
        </h3>
        {cat.line2 && (
          <h3 className="text-gray-900 font-bold text-base leading-tight">
            {cat.line2}
          </h3>
        )}
      </div>

      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs text-gray-500 font-medium group-hover:text-[#E53935] transition-colors">
          Ver negocios
        </span>
        <div className="w-6 h-6 rounded-full bg-[#E53935] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={14} className="text-white" />
        </div>
      </div>
    </div>

    {cat.iconImage && (
      <div className="absolute bottom-0 right-0 w-16 h-16 opacity-90 group-hover:opacity-100 transition-opacity">
        <img
          src={cat.iconImage}
          alt={cat.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-200"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    )}

    <div className="absolute inset-0 bg-gradient-to-br from-[#E53935]/0 to-red-500/0 group-hover:from-[#E53935]/5 group-hover:to-red-500/5 transition-all duration-200"></div>
  </div>
);

// ✅ Componente para tarjeta de negocio
const BusinessCard = ({ business, onClick, index }) => (
  <div
    onClick={() => onClick(business.id)}
    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 animate-slideUp"
    style={{
      animationDelay: `${index * 50}ms`,
      animationFillMode: 'both'
    }}
  >
    {/* Banner del negocio */}
    <div className="relative h-24 bg-gradient-to-br from-[#FFCDD2] to-red-100 overflow-hidden">
      {business.bannerImage && (
        <img
          src={business.bannerImage}
          alt={business.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      
      {/* Logo flotante */}
      <div className="absolute -bottom-6 left-4">
        <div className="w-12 h-12 bg-white rounded-xl shadow-lg p-1.5">
          {business.iconImage ? (
            <img
              src={business.iconImage}
              alt={business.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#FFCDD2] rounded-lg"></div>
          )}
        </div>
      </div>
    </div>

    {/* Información del negocio */}
    <div className="pt-8 px-4 pb-4">
      <h3 className="font-bold text-gray-900 text-base mb-1 leading-tight">
        {business.name}
      </h3>
      
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{business.deliveryTime || '20-30 min'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span>{business.rating || '4.5'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">
          Envío: <span className="font-semibold text-gray-900">${business.deliveryFee || '15'}</span>
        </span>
        <span className="text-gray-600">
          Mín: <span className="font-semibold text-gray-900">${business.minOrder || '50'}</span>
        </span>
      </div>
    </div>
  </div>
);

export default function FloatingCategoriesButton({ categories, setActiveCategory, cartItems = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(24);
  const roRef = useRef(null);
  const moRef = useRef(null);
  const rafRef = useRef(null);

  // Datos de ejemplo de negocios (esto vendría de tu API)
  const mockBusinesses = useMemo(() => [
    {
      id: 1,
      name: "Tacos El Paisa",
      rating: "4.8",
      deliveryTime: "15-25 min",
      deliveryFee: "10",
      minOrder: "40",
      iconImage: null,
      bannerImage: null
    },
    {
      id: 2,
      name: "Pizza Roma",
      rating: "4.6",
      deliveryTime: "25-35 min",
      deliveryFee: "15",
      minOrder: "60",
      iconImage: null,
      bannerImage: null
    },
    {
      id: 3,
      name: "Sushi Express",
      rating: "4.7",
      deliveryTime: "30-40 min",
      deliveryFee: "20",
      minOrder: "80",
      iconImage: null,
      bannerImage: null
    },
    {
      id: 4,
      name: "Burger House",
      rating: "4.5",
      deliveryTime: "20-30 min",
      deliveryFee: "12",
      minOrder: "50",
      iconImage: null,
      bannerImage: null
    }
  ], []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setExpandedCategory(null);
  }, []);

  const measureAndSetOffset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const el = document.getElementById('cart-summary');
      setBottomOffset(el ? el.offsetHeight + 16 : 24);
    });
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const toggleVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.pageYOffset > 80);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();
    
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  useEffect(() => {
    measureAndSetOffset();

    let timeoutId;
    const mo = new MutationObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(measureAndSetOffset, 100);
    });
    
    mo.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false,
      characterData: false
    });
    moRef.current = mo;

    const el = document.getElementById('cart-summary');
    if (el) {
      const ro = new ResizeObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(measureAndSetOffset, 100);
      });
      ro.observe(el);
      roRef.current = ro;
    }

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(measureAndSetOffset, 100);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
      if (moRef.current) moRef.current.disconnect();
      if (roRef.current) roRef.current.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [measureAndSetOffset]);

  useEffect(() => {
    if (isModalOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isModalOpen]);

  const handleCategoryClick = useCallback((categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  }, [expandedCategory]);

  const handleBusinessClick = useCallback((businessId) => {
    // Aquí iría la lógica para seleccionar el negocio
    console.log('Negocio seleccionado:', businessId);
    setActiveCategory(expandedCategory);
    closeModal();
    
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [expandedCategory, setActiveCategory, closeModal]);

  const handleBackToCategories = useCallback(() => {
    setExpandedCategory(null);
  }, []);

  const categoryList = useMemo(() => categories, [categories]);
  const selectedCategory = useMemo(() => 
    categoryList.find(cat => cat.id === expandedCategory),
    [categoryList, expandedCategory]
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-200 ${
          isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeModal}
        style={{ willChange: isModalOpen ? 'opacity' : 'auto' }}
      />

      <button
        onClick={openModal}
        className={`fixed right-6 w-16 h-16 bg-gradient-to-tr from-[#E53935] to-red-500 rounded-full flex flex-col items-center justify-center shadow-2xl z-[50] transition-all duration-200 transform hover:scale-110 active:scale-95 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
        style={{ 
          bottom: bottomOffset,
          willChange: isVisible ? 'transform' : 'auto'
        }}
        aria-label="Abrir categorías"
      >
        <span className="text-xl mb-0.5 flex" aria-hidden="true">
          <span className="-mr-2">🍔</span>
          <span>🌭</span>
        </span>
        <span className="text-white text-[7px] font-semibold text-center tracking-wide">
          CATEGORÍAS
        </span>
      </button>

      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[51] transition-transform duration-300 ease-out shadow-2xl ${
          isModalOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          maxHeight: '85vh',
          willChange: isModalOpen ? 'transform' : 'auto'
        }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Vista de categorías */}
        {!expandedCategory && (
          <>
            <div className="flex items-center justify-between px-6 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
                <p className="text-sm text-gray-500 mt-0.5">¿Qué se te antoja hoy?</p>
              </div>
              <button 
                onClick={closeModal} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors active:scale-95"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div 
              className="px-4 pb-6 overflow-y-auto" 
              style={{ 
                maxHeight: 'calc(85vh - 100px)',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                {categoryList.map((cat) => (
                  <CategoryCard 
                    key={cat.id} 
                    cat={cat} 
                    onClick={handleCategoryClick}
                    isExpanded={expandedCategory === cat.id}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Vista expandida con negocios */}
        {expandedCategory && selectedCategory && (
          <div className="animate-bubbleExpand">
            {/* Header con categoría seleccionada */}
            <div className="px-6 pb-4">
              <button
                onClick={handleBackToCategories}
                className="flex items-center gap-2 text-[#D32F2F] font-semibold mb-3 hover:gap-3 transition-all"
              >
                <ChevronLeft size={20} />
                <span>Volver a categorías</span>
              </button>
              
              <div className="flex items-center gap-3">
                {selectedCategory.iconImage && (
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FFCDD2] to-red-100 rounded-2xl p-2 shadow-md">
                    <img
                      src={selectedCategory.iconImage}
                      alt={selectedCategory.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory.line1}
                    {selectedCategory.line2 && ` ${selectedCategory.line2}`}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {mockBusinesses.length} negocios disponibles
                  </p>
                </div>
              </div>
            </div>

            {/* Grid de negocios */}
            <div 
              className="px-4 pb-6 overflow-y-auto" 
              style={{ 
                maxHeight: 'calc(85vh - 150px)',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="grid grid-cols-1 gap-3">
                {mockBusinesses.map((business, index) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    onClick={handleBusinessClick}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes bubbleExpand {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            50% {
              transform: scale(1.02);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-bubbleExpand {
            animation: bubbleExpand 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
        `}
      </style>
    </>
  );
}