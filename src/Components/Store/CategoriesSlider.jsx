import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Navigation } from "lucide-react";

// Mapeo de nombre de icono a emoji
const ICON_TO_EMOJI = {
  'utensils': '🍽️',
  'pizza': '🍕',
  'hamburger': '🍔',
  'coffee': '☕',
  'taco': '🌮',
  'ice-cream': '🍦',
  'cake': '🎂',
  'beer': '🍺',
  'wine': '🍷',
  'cocktail': '🍸',
  'soup': '🍲',
  'salad': '🥗',
  'fish': '🐟',
  'meat': '🥩',
  'chicken': '🍗',
  'drumstick': '🍗',
  'egg': '🥚',
  'cheese': '🧀',
  'bread': '🍞',
  'rice': '🍚',
  'noodles': '🍜',
  'sushi': '🍣',
  'cookie': '🍪',
  'candy': '🍬',
  'popcorn': '🍿',
  'hotdog': '🌭',
  'sandwich': '🥪',
  'burrito': '🌯',
  'fries': '🍟',
  'bacon': '🥓',
  'carrot': '🥕',
  'apple': '🍎',
  'lemon': '🍋',
  'pepper': '🌶️',
  'bowl': '🥣',
  'cup': '☕',
  'glass': '🥛',
  'bottle': '🍾',
  'store': '🏪',
  'shop': '🛒',
  'truck': '🚚',
  'package': '📦',
  'box': '📦',
  'bag': '🛍️',
  'cart': '🛒',
  'donut': '🍩',
  'croissant': '🥐',
  'pretzel': '🥨',
  'bagel': '🥯',
  'pancakes': '🥞',
  'waffle': '🧇',
  'shrimp': '🦐',
  'crab': '🦀',
  'lobster': '🦞',
  'oyster': '🦪',
  'steak': '🥩',
  'poultry': '🍗',
  'lamb': '🍖',
  'pork': '🥓',
  'vegetable': '🥬',
  'fruit': '🍇',
  'dessert': '🍰',
  'breakfast': '🍳',
  'lunch': '🥗',
  'dinner': '🍽️',
  'snack': '🍿',
  'drink': '🥤',
  'smoothie': '🥤',
  'juice': '🧃',
  'tea': '🍵',
  'milk': '🥛',
  'water': '💧',
  'soda': '🥤',
  'alcohol': '🍺',
  'wine-glass': '🍷',
  'martini': '🍸',
  'tropical': '🍹',
  'beer-mug': '🍺',
};

// Función para obtener emoji desde el nombre del icono
const getEmojiFromIcon = (iconName) => {
  if (!iconName) return null;
  // Si ya es un emoji (caracteres unicode especiales), devolverlo
  if (/[\u{1F300}-\u{1F9FF}]/u.test(iconName)) {
    return iconName;
  }
  // Buscar en el mapeo
  const lowerIcon = iconName.toLowerCase().trim();
  return ICON_TO_EMOJI[lowerIcon] || null;
};

export default function CategoriesSlider({
  onCategorySelect,
  collapsed = false,
  searchActive = false,
  selectedCategory = null,
  type = null, // null = todos los negocios, sin categorías
  onCenterMap, // Nueva prop para centrar el mapa
  showCenterButton = true, // Mostrar botón de centrar
  hasUserLocation = false // Indica si hay ubicación del usuario
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  // Sheet cerrado por defecto cuando no hay tipo seleccionado
  const [isSheetOpen, setIsSheetOpen] = useState(!!type);

  useEffect(() => {
    // No cargar categorías si no hay tipo seleccionado
    if (!type) {
      setCategories([]);
      setLoadingCategories(false);
      return;
    }

    setLoadingCategories(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/business-categories/type/${type}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const sanitized = (data.response || []).map(cat => ({
            _id: cat._id,
            name: cat.name || "Sin nombre",
            slug: cat.slug || "",
            icon: cat.icon || "",
            isActive: cat.isActive
          }));

          setCategories(sanitized);
        }
        setLoadingCategories(false);
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
        setLoadingCategories(false);
      });
  }, [type]);

  // Abrir el sheet cuando se selecciona un tipo
  useEffect(() => {
    if (type) {
      setIsSheetOpen(true);
    }
  }, [type]);

  // No mostrar si está colapsado, búsqueda activa, o no hay tipo seleccionado
  if (collapsed || searchActive || !type) return null;

  // Variantes de animación para el sheet
  const sheetVariants = {
    open: { y: 0 },
    closed: { y: 'calc(100% - 28px)' }
  };

  // Emoji por defecto según el tipo
  const defaultEmoji = type === 'tienda' ? '🏪' : type === 'envio' ? '📦' : '🍽️';

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40"
      initial="open"
      animate={isSheetOpen ? 'open' : 'closed'}
      variants={sheetVariants}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(event, info) => {
        if (info.offset.y > 50) {
          setIsSheetOpen(false);
        }
        if (info.offset.y < -30) {
          setIsSheetOpen(true);
        }
      }}
    >
      {/* Botón de centrar mapa - se mueve junto con el sheet */}
      {showCenterButton && onCenterMap && (
        <div className="absolute -top-16 right-4">
          <button
            onClick={onCenterMap}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center
                       hover:bg-blue-50 transition-all text-gray-700 hover:text-blue-600
                       active:scale-95 group relative"
            title="Ir a mi ubicación"
          >
            <Navigation
              className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
              fill="currentColor"
            />
            {hasUserLocation && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </button>
        </div>
      )}

      {/* Sheet content */}
      <div className="bg-white rounded-t-[28px] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {/* Handle - área de arrastre */}
        <div
          className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onClick={() => setIsSheetOpen(!isSheetOpen)}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Contenido colapsable */}
        <AnimatePresence>
          {isSheetOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-4 pb-4"
            >
              {/* Categorías con scroll horizontal - Sin título */}
              <div
                className="flex gap-2 overflow-x-auto"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {loadingCategories ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-24 h-8 bg-gray-200 rounded-full animate-pulse"
                      />
                    ))}
                  </>
                ) : (
                  <>
                    {/* Botón "Todos" */}
                    <button
                      onClick={() => onCategorySelect?.(null)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full transition-all text-sm font-medium whitespace-nowrap ${
                        selectedCategory === null
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Todos
                    </button>

                    {/* Categorías del backend */}
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => onCategorySelect?.(category.slug)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full transition-all text-sm font-medium whitespace-nowrap ${
                          selectedCategory === category._id || selectedCategory === category.slug
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </motion.div>
  );
}
