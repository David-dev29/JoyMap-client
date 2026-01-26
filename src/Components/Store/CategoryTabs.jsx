import React, { useState, useEffect, useRef, memo } from "react";
import { Search, X } from "lucide-react";

// Botón de categoría memoizado
const CategoryButton = memo(({ category, isActive, onClick }) => {
  return (
    <button
      data-category={category.id}
      onClick={() => onClick(category.id)}
      className={`tab-button relative py-2 px-3 text-sm font-medium focus:outline-none whitespace-nowrap transition-colors ${
        isActive ? "active text-[#D32F2F]" : "text-gray-700 hover:text-[#E53935]"
      }`}
      role="tab"
      aria-selected={isActive}
    >
      {category.name}
    </button>
  );
});

const CategoryTabs = ({
  categories = [],
  activeCategory,
  onCategoryClick,
  searchValue,
  setSearchValue,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const markerRef = useRef(null);
  const tabsRef = useRef(null);
  const searchInputRef = useRef(null);
  const [markerStyle, setMarkerStyle] = useState({ left: 0, width: 0 });

  // Shadow sticky
  useEffect(() => {
    const stickyEl = markerRef.current;
    if (!stickyEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-60px 0px 0px 0px" }
    );
    observer.observe(stickyEl);
    return () => observer.disconnect();
  }, []);

  // Actualiza marcador y centra tab activo
  useEffect(() => {
    if (!tabsRef.current || !activeCategory) return;
    const activeTab = tabsRef.current.querySelector(`[data-category="${activeCategory}"]`);
    if (!activeTab) return;

    const { offsetLeft, offsetWidth } = activeTab;
    setMarkerStyle({ left: offsetLeft, width: offsetWidth });

    requestAnimationFrame(() => {
      activeTab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  }, [activeCategory, categories]);

  // Focus en input cuando se abre el buscador
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Si no hay categorías
  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <div ref={markerRef} style={{ height: 1 }} />

      <div
        className={`sticky top-[68px] z-30 bg-white transition-shadow duration-300 ${
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
                className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:bg-white transition-all"
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
                className="flex items-center space-x-2 overflow-x-auto custom-scroll-hide py-1 relative"
                role="tablist"
                ref={tabsRef}
              >
                {/* Botón de búsqueda */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-600 hover:text-[#E53935] hover:bg-gray-100 rounded-lg flex-shrink-0 transition-colors"
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
                    category={category}
                    isActive={activeCategory === category.id}
                    onClick={onCategoryClick}
                  />
                ))}

                {/* Línea activa */}
                {categories.length > 0 && (
                  <div
                    className="absolute bottom-0 h-0.5 bg-[#D32F2F] transition-all duration-300 ease-out"
                    style={{ left: markerStyle.left, width: markerStyle.width }}
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
          color: #E53935;
        }
      `}</style>
    </>
  );
};

export default CategoryTabs;
