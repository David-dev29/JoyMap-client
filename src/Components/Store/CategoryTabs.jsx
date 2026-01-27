import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { Search, X } from "lucide-react";

// Botón de categoría memoizado
const CategoryButton = memo(React.forwardRef(({ category, isActive, onClick, brandColor }, ref) => {
  const themeColor = brandColor || '#dc2626';

  return (
    <button
      ref={ref}
      data-category={category.id}
      onClick={() => onClick(category.id)}
      className={`tab-button relative py-2 px-3 text-sm font-medium focus:outline-none whitespace-nowrap transition-colors ${
        isActive ? "active" : "text-gray-700"
      }`}
      style={isActive ? { color: themeColor } : {}}
      role="tab"
      aria-selected={isActive}
    >
      {category.name}
    </button>
  );
}));

const CategoryTabs = ({
  categories = [],
  activeCategory,
  onCategoryClick,
  searchValue,
  setSearchValue,
  brandColor,
  scrollContainerRef,
  hasCoupon = false, // 🎟️ Para ajustar posición del sticky
}) => {
  // Color del tema
  const themeColor = brandColor || '#dc2626';
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const markerRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const activeTabRef = useRef(null);
  const searchInputRef = useRef(null);
  const [markerStyle, setMarkerStyle] = useState({ left: 0, width: 0 });

  // Shadow sticky - usar el scroll container como root
  useEffect(() => {
    const stickyEl = markerRef.current;
    if (!stickyEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      {
        root: scrollContainerRef?.current || null,
        threshold: 0,
        rootMargin: "-60px 0px 0px 0px"
      }
    );
    observer.observe(stickyEl);
    return () => observer.disconnect();
  }, [scrollContainerRef]);

  // ════════════════════════════════════════════════════════════════════════
  // AUTO-CENTRAR TAB ACTIVO cuando cambia activeCategory
  // ════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!tabsContainerRef.current || !activeCategory || isSearchOpen) return;

    // Pequeño delay para asegurar que el DOM esté actualizado
    const timeoutId = setTimeout(() => {
      const container = tabsContainerRef.current;
      const activeTab = container?.querySelector(`[data-category="${activeCategory}"]`);

      if (!activeTab || !container) return;

      const containerWidth = container.offsetWidth;
      const containerScrollLeft = container.scrollLeft;
      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;

      // Calcular posición para centrar el tab
      const scrollPosition = tabLeft - (containerWidth / 2) + (tabWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });

      // Actualizar posición del marcador
      setMarkerStyle({
        left: tabLeft,
        width: tabWidth
      });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [activeCategory, categories, isSearchOpen]);

  // Focus en input cuando se abre el buscador
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Handler para click en categoría
  const handleTabClick = useCallback((categoryId) => {
    onCategoryClick(categoryId);
  }, [onCategoryClick]);

  // Si no hay categorías
  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <div ref={markerRef} style={{ height: 1 }} />

      <div
        className={`sticky ${hasCoupon ? 'top-[120px]' : 'top-[68px]'} z-30 bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        {/* Barra de búsqueda expandida */}
        {isSearchOpen ? (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar en el menú..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[red-600]/20 focus:bg-white transition-all"
              />
              <button
                onClick={() => {
                  if (searchValue) {
                    setSearchValue("");
                  } else {
                    setIsSearchOpen(false);
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-gray-200 ml-4 mr-4" />

            <div className="px-4 sm:px-6 lg:px-8 relative">
              <nav
                ref={tabsContainerRef}
                className="flex items-center space-x-2 overflow-x-auto custom-scroll-hide py-1 relative"
                role="tablist"
              >
                {/* Botón de búsqueda */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-600 hover:text-[red-600] hover:bg-gray-100 rounded-lg flex-shrink-0 transition-colors"
                  aria-label="Buscar productos"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Separador */}
                <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

                {/* Categorías */}
                {categories.map(category => (
                  <CategoryButton
                    key={category.id}
                    ref={activeCategory === category.id ? activeTabRef : null}
                    category={category}
                    isActive={activeCategory === category.id}
                    onClick={handleTabClick}
                    brandColor={themeColor}
                  />
                ))}

                {/* Línea activa con color personalizado */}
                {categories.length > 0 && markerStyle.width > 0 && (
                  <div
                    className="absolute bottom-0 h-0.5 transition-all duration-300 ease-out"
                    style={{
                      left: markerStyle.left,
                      width: markerStyle.width,
                      backgroundColor: themeColor
                    }}
                  />
                )}
              </nav>
            </div>

            <div className="border-b border-gray-200 ml-4 mr-4" />
          </>
        )}
      </div>

      <style>{`
        .custom-scroll-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scroll-hide::-webkit-scrollbar {
          display: none;
        }
        .tab-button {
          transition: color 0.15s ease;
        }
        .tab-button.active {
          color: red-600;
        }
      `}</style>
    </>
  );
};

export default CategoryTabs;
