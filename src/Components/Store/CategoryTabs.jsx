import React, { useState, useEffect, useRef, memo } from "react";
import { Search } from "lucide-react";

// ✅ Botón memoizado
const SubcategoryButton = memo(({ subcat, label, isActive, onClick }) => {
  return (
    <button
      data-subcat={subcat}
      onClick={() => onClick(subcat)}
      className={`tab-button relative py-2 px-1 text-sm font-medium focus:outline-none whitespace-nowrap ${
        isActive ? "active" : ""
      }`}
      role="tab"
      aria-selected={isActive}
    >
      {label}
    </button>
  );
});

const CategoryTabs = ({
  activeCategory,
  activeSubcategory,
  onSubcategoryClick,
  searchValue,
  setSearchValue,
  subcategoriesMap,
}) => {
  const subcategories = subcategoriesMap[activeCategory] || [];
  
  console.log("🔍 CategoryTabs render:");
  console.log("  - activeCategory:", activeCategory);
  console.log("  - subcategoriesMap keys:", Object.keys(subcategoriesMap));
  console.log("  - subcategories encontradas:", subcategories.length);
  console.log("  - subcategories:", subcategories);
  
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const markerRef = useRef(null);
  const tabsRef = useRef(null);
  const [markerStyle, setMarkerStyle] = useState({ left: 0, width: 0 });

  // ✅ Shadow sticky
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

  // ✅ Actualiza marcador y centra tab activo
  useEffect(() => {
    if (!tabsRef.current) return;
    const activeTab = tabsRef.current.querySelector(`[data-subcat="${activeSubcategory}"]`);
    if (!activeTab) return;

    const { offsetLeft, offsetWidth } = activeTab;
    setMarkerStyle({ left: offsetLeft, width: offsetWidth });

    requestAnimationFrame(() => {
      activeTab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  }, [activeSubcategory, subcategories]);

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
            className="flex items-center space-x-4 overflow-x-auto custom-scroll-hide py-1 relative"
            role="tablist"
            ref={tabsRef}
          >
            {/* 🔍 Buscador */}
            {!isSearchOpen ? (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1 text-gray-600 hover:text-orange-500 flex-shrink-0"
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
                  className="text-sm font-bold text-orange-600 hover:underline"
                >
                  Cerrar
                </button>
              </div>
            )}

            {/* ✅ Subcategorías */}
            {!isSearchOpen && subcategories.length > 0 ? (
              subcategories.map(({ id, label }) => (
                <SubcategoryButton
                  key={id}
                  subcat={id}
                  label={label}
                  isActive={activeSubcategory === id}
                  onClick={onSubcategoryClick}
                />
              ))
            ) : !isSearchOpen ? (
              <div className="text-sm text-gray-500 py-2">
                No hay subcategorías disponibles
              </div>
            ) : null}

            {/* Línea activa */}
            {!isSearchOpen && subcategories.length > 0 && (
              <div
                className="absolute bottom-0 h-0.5 bg-orange-600 transition-all duration-300 ease-out"
                style={{ left: markerStyle.left, width: markerStyle.width }}
              />
            )}
          </nav>
        </div>

        {!isSearchOpen && <div className="border-b border-gray-200 ml-4 mr-4" />}
      </div>

      <style jsx>{`
        .custom-scroll-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scroll-hide::-webkit-scrollbar {
          display: none;
        }
        .tab-button {
          color: #1f2937;
          transition: color 0.15s ease;
        }
        .tab-button:hover {
          color: #f97316;
        }
        .tab-button.active {
          color: #ea580c;
        }
      `}</style>
    </>
  );
};

export default CategoryTabs;