import React, { useState, useEffect, useRef, memo } from "react";
import { Search } from "lucide-react";

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
        {!isSearchOpen && <div className="border-b border-gray-200 ml-4 mr-4" />}

        <div className="px-4 sm:px-6 lg:px-8 relative">
          <nav
            className="flex items-center space-x-2 overflow-x-auto custom-scroll-hide py-1 relative"
            role="tablist"
            ref={tabsRef}
          >
            {/* Buscador */}
            {!isSearchOpen ? (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1 text-gray-600 hover:text-[#E53935] flex-shrink-0"
                aria-label="Buscar productos"
              >
                <Search className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex-1 flex items-center gap-3 bg-white h-full rounded-xl px-2">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 outline-none text-sm"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchValue("");
                  }}
                  className="text-sm font-bold text-[#D32F2F] hover:underline"
                >
                  Cerrar
                </button>
              </div>
            )}

            {/* Categorías */}
            {!isSearchOpen && categories.map(category => (
              <CategoryButton
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onClick={onCategoryClick}
              />
            ))}

            {/* Línea activa */}
            {!isSearchOpen && categories.length > 0 && (
              <div
                className="absolute bottom-0 h-0.5 bg-[#D32F2F] transition-all duration-300 ease-out"
                style={{ left: markerStyle.left, width: markerStyle.width }}
              />
            )}
          </nav>
        </div>

        {!isSearchOpen && <div className="border-b border-gray-200 ml-4 mr-4" />}
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
