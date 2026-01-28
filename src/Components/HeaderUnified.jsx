import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  ShoppingBag,
  Utensils,
  Store,
  Package,
  ArrowLeft,
  Clock,
  CheckCircle,
  Gift,
  Star,
  Loader2,
  Bell,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllBusinesses } from "../services/businessService";
import SideMenu from "./SideMenu";

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS DROPDOWN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
function NotificationsDropdown({ notifications, onClose, onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Notificaciones</h3>
        {notifications.length > 0 && (
          <button onClick={onClear} className="text-xs text-red-600 font-medium">
            Marcar como leídas
          </button>
        )}
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No tienes notificaciones</p>
          </div>
        ) : (
          notifications.map((notif, i) => (
            <div
              key={i}
              className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {notif.type === 'order' && <Clock className="w-5 h-5 text-amber-500" />}
                  {notif.type === 'promo' && <Gift className="w-5 h-5 text-red-600" />}
                  {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{notif.desc}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 text-center text-sm font-medium text-gray-600 hover:bg-gray-50 border-t border-gray-100"
      >
        Cerrar
      </button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function HeaderUnified({
  onSearch,
  onBusinessSelect,
  cartCount = 0,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);

  // States
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  // App config from backend
  const [appConfig, setAppConfig] = useState({
    appName: 'JoyMap',
    appLogo: null,
    logoText: null,
  });
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Notifications (mock - replace with real data from backend)
  const [notifications, setNotifications] = useState([
    { type: 'order', title: 'Tu pedido está en camino', desc: 'El repartidor llegará en 15 min', time: 'Hace 5 min' },
    { type: 'promo', title: 'Nuevo cupón disponible', desc: '20% de descuento en tu próximo pedido', time: 'Hace 2 horas' },
  ]);

  const notificationCount = notifications.length;

  // Determine active section
  const isComida = location.pathname === '/home' || location.pathname === '/';
  const isTienda = location.pathname === '/tienda';
  const isEnvios = location.pathname === '/envios';

  const sections = [
    { id: 'comida', name: 'Comida', icon: Utensils, path: '/home', active: isComida },
    { id: 'tienda', name: 'Tienda', icon: Store, path: '/tienda', active: isTienda },
    { id: 'envios', name: 'Envíos', icon: Package, path: '/envios', active: isEnvios },
  ];

  // Refs para el indicador del section switcher futurista
  const sectionButtonRefs = useRef({});
  const sectionContainerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [indicatorReady, setIndicatorReady] = useState(false);

  // Obtener la sección activa
  const activeSection = sections.find(s => s.active) || sections[0];

  // Calcular posición del indicador deslizante
  const updateIndicator = () => {
    const activeButton = sectionButtonRefs.current[activeSection.id];
    const container = sectionContainerRef.current;

    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
      setIndicatorReady(true);
    }
  };

  // Actualizar indicador cuando cambia la sección
  useLayoutEffect(() => {
    updateIndicator();
  }, [activeSection.id]);

  // Actualizar en resize
  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeSection.id]);

  // ═══════════════════════════════════════════════════════════════════════
  // FETCH APP CONFIG FROM BACKEND
  // ═══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        // Try /api/settings first
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`);
        const data = await res.json();
        if (data.success && data.settings) {
          setAppConfig({
            appName: data.settings.appName || 'JoyMap',
            appLogo: data.settings.logo || null,
            logoText: data.settings.logoText || null,
          });
        }
      } catch (error) {
        // Fallback to /api/stores
        try {
          const fallbackRes = await fetch(`${import.meta.env.VITE_API_URL}/api/stores`);
          const fallbackData = await fallbackRes.json();
          if (fallbackData.store_data) {
            setAppConfig({
              appName: fallbackData.store_data.name || 'JoyMap',
              appLogo: fallbackData.store_data.logoUrl || null,
              logoText: fallbackData.store_data.logoTextUrl || null,
            });
          }
        } catch {
          // Use defaults
        }
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchAppConfig();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // LOAD ALL BUSINESSES FOR SEARCH
  // ═══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const businesses = await getAllBusinesses();
        setAllBusinesses(businesses);
      } catch (error) {
        console.error('Error loading businesses for search:', error);
      }
    };
    loadBusinesses();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // CART COUNT FROM LOCALSTORAGE
  // ═══════════════════════════════════════════════════════════════════════
  const [localCartCount, setLocalCartCount] = useState(0);
  useEffect(() => {
    const updateCartCount = () => {
      const stored = localStorage.getItem('cartItems');
      if (stored) {
        const items = JSON.parse(stored);
        const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setLocalCartCount(count);
      }
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const displayCartCount = cartCount || localCartCount;

  // ═══════════════════════════════════════════════════════════════════════
  // SEARCH FUNCTIONALITY WITH DEBOUNCE
  // ═══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);

      // Client-side search (filter local businesses)
      const query = searchQuery.toLowerCase().trim();
      const filtered = allBusinesses.filter(business => {
        const name = (business.name || '').toLowerCase();
        const category = (business.category?.name || business.category || '').toLowerCase();
        const description = (business.description || '').toLowerCase();

        return name.includes(query) ||
               category.includes(query) ||
               description.includes(query);
      }).slice(0, 10); // Limit to 10 results

      setSearchResults(filtered);
      setIsSearching(false);
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [searchQuery, allBusinesses]);

  // Focus search input when entering search mode
  useEffect(() => {
    if (isSearchMode && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchMode]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  const handleSearch = (query) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSelectBusiness = (business) => {
    setIsSearchMode(false);
    setSearchQuery('');
    setSearchResults([]);

    // Notify parent component
    onBusinessSelect?.(business);

    // Navigate to business
    const slug = business.slug || createSlug(business.name);
    const basePath = isTienda ? 'tienda' : 'home';
    navigate(`/${basePath}/${slug}`);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNotifications && !e.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  // Helper to build image URL
  const buildImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <>
      <AnimatePresence mode="wait">
        {!isSearchMode ? (
          /* ═══════════════════════════════════════════════════════════════
             ESTADO NORMAL - Header con logo, búsqueda, carrito y tabs
             ═══════════════════════════════════════════════════════════════ */
          <motion.header
            key="normal-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-20 px-4 pt-4 notifications-container"
          >
            {/* FONDO SÓLIDO ROJO - SIN GRADIENTE */}
            <div className="max-w-lg mx-auto bg-red-600 rounded-2xl shadow-lg overflow-hidden">
              {/* Fila principal: Logo tipográfico | Búsqueda + Notificaciones + Carrito */}
              <div className="px-4 py-3 flex items-center justify-between">
                {/* Izquierda: Solo logo tipográfico */}
                <div className="flex items-center">
                  {loadingConfig ? (
                    <div className="h-6 w-24 bg-white/20 rounded animate-pulse" />
                  ) : appConfig.logoText ? (
                    <img
                      src={buildImageUrl(appConfig.logoText)}
                      alt={appConfig.appName}
                      className="h-6 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-white font-bold text-xl">{appConfig.appName || 'JoyMap'}</span>
                  )}
                </div>

                {/* Derecha: Búsqueda + Notificaciones + Carrito */}
                <div className="flex items-center gap-3">
                  {/* Botón búsqueda */}
                  <button
                    onClick={() => setIsSearchMode(true)}
                    className="text-white hover:opacity-80 transition-opacity"
                  >
                    <Search className="w-6 h-6" />
                  </button>

                  {/* Botón notificaciones - abre menú lateral */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSideMenuOpen(true);
                    }}
                    className="relative text-white hover:opacity-80 transition-opacity"
                  >
                    <Bell className="w-6 h-6" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-white text-red-600 text-[10px] font-bold rounded-full flex items-center justify-center">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>

                  {/* Botón carrito */}
                  <button onClick={() => navigate('/cart')} className="relative text-white hover:opacity-80 transition-opacity">
                    <ShoppingBag className="w-6 h-6" />
                    {displayCartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-white text-red-600 text-[10px] font-bold rounded-full flex items-center justify-center">
                        {displayCartCount > 9 ? '9+' : displayCartCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Section Switcher - Tema claro, indicador neutro */}
              <div className="px-3 pb-3">
                <div
                  ref={sectionContainerRef}
                  className="relative inline-flex items-center w-full bg-white/90 backdrop-blur-sm rounded-full p-1"
                >
                  {/* Indicador deslizante - neutro (blanco con sombra) */}
                  <div
                    className={`
                      absolute top-1 bottom-1 bg-white rounded-full shadow-md
                      transition-all duration-300 ease-out
                      ${indicatorReady ? 'opacity-100' : 'opacity-0'}
                    `}
                    style={{
                      left: indicatorStyle.left,
                      width: indicatorStyle.width,
                    }}
                  />

                  {/* Botones de sección */}
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        ref={el => sectionButtonRefs.current[section.id] = el}
                        onClick={() => navigate(section.path)}
                        className={`
                          relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full
                          font-medium text-sm transition-all duration-200
                          ${section.active
                            ? 'text-gray-900'
                            : 'text-gray-400 hover:text-gray-600'
                          }
                        `}
                      >
                        <Icon
                          className="w-4 h-4 transition-transform duration-200"
                          strokeWidth={2.5}
                        />
                        <span>{section.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </motion.header>
        ) : (
          /* ═══════════════════════════════════════════════════════════════
             MODO BÚSQUEDA - Header transformado en barra de búsqueda
             ═══════════════════════════════════════════════════════════════ */
          <motion.header
            key="search-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-20 px-4 pt-4"
          >
            {/* Search bar */}
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => {
                  setIsSearchMode(false);
                  setSearchQuery('');
                  setSearchResults([]);
                  onSearch?.('');
                }}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex-1 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar locales, platos, productos..."
                  className="flex-1 outline-none text-gray-700 text-base placeholder-gray-400"
                />
              </div>

              {isSearching && (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              )}

              {searchQuery && !isSearching && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    onSearch?.('');
                    searchInputRef.current?.focus();
                  }}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Search results */}
            <div className="max-w-lg mx-auto mt-2">
              {searchResults.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg max-h-[300px] overflow-y-auto"
                >
                  {searchResults.map((business) => (
                    <button
                      key={business._id}
                      onClick={() => handleSelectBusiness(business)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                    >
                      {/* Business logo */}
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {business.logo ? (
                          <img
                            src={buildImageUrl(business.logo)}
                            alt={business.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            {business.mapIcon || business.emoji || '🏪'}
                          </div>
                        )}
                      </div>

                      {/* Business info */}
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{business.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">
                            {business.category?.name || business.category || 'Restaurante'}
                          </span>
                          {business.rating && (
                            <span className="flex items-center gap-0.5 text-xs text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {business.rating}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </motion.div>
              ) : searchQuery && !isSearching ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6 text-center"
                >
                  <Search className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500 text-sm">No se encontraron resultados para "{searchQuery}"</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-4"
                >
                  <p className="text-xs font-medium text-gray-500 mb-3">Búsquedas populares</p>
                  <div className="flex flex-wrap gap-2">
                    {['Pizza', 'Tacos', 'Hamburguesas', 'Sushi', 'Pollo', 'Postres', 'Café', 'Helados'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleSearch(tag)}
                        className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Spacer para el contenido */}
      <div className={isSearchMode ? 'h-32' : 'h-[130px]'} />

      {/* Menú lateral (notificaciones y favoritos) */}
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        notifications={notifications}
        onClearNotifications={() => setNotifications([])}
        onBusinessSelect={onBusinessSelect}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
function createSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
