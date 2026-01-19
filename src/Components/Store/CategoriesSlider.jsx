import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoriesSlider({ 
  onCategorySelect,
  collapsed = false,
  searchActive = false,
  selectedCategory = null,
  type = "comida" // ✅ NUEVO: tipo de categorías a mostrar
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    // ✅ Fetch dinámico según el tipo
    fetch(`${import.meta.env.VITE_API_URL}/api/business-categories/type/${type}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const sanitized = (data.response || []).map(cat => ({
            _id: cat._id,
            name: cat.name || "Sin nombre",
            slug: cat.slug || "",
            icon: typeof cat.icon === "string" ? cat.icon : "🍽️",
            isActive: cat.isActive
          }));
          
          console.log(`✅ Categorías de tipo "${type}":`, sanitized);
          setCategories(sanitized);
        }
        setLoadingCategories(false);
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
        setLoadingCategories(false);
      });
  }, [type]); // ✅ Recargar cuando cambie el tipo

  return (
    <AnimatePresence mode="wait">
      {!collapsed && !searchActive && (
        <motion.div
          className="mt-1 flex gap-1.5 overflow-x-auto pointer-events-auto pb-1"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {loadingCategories ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="min-w-[90px] h-9 bg-gray-200 rounded-full animate-pulse"
                />
              ))}
            </>
          ) : (
            <>
              <button
                onClick={() => onCategorySelect?.(null)}
                className={`flex items-center gap-1 whitespace-nowrap 
                         border rounded-xl px-3 py-1.5 text-xs font-semibold 
                         shadow-sm hover:scale-105 active:scale-95 transition-all
                         min-h-[36px] ${
                  selectedCategory === null
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">
                  {type === 'tienda' ? '🏪' : type === 'envio' ? '📦' : '🍽️'}
                </span>
                Todos
              </button>

              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => onCategorySelect?.(cat.slug)}
                  className={`flex items-center gap-1 whitespace-nowrap 
                           border rounded-xl px-3 py-1.5 text-xs font-semibold 
                           shadow-sm hover:scale-105 active:scale-95 transition-all
                           min-h-[36px] ${
                    selectedCategory === cat.slug
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </>
          )}

          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}