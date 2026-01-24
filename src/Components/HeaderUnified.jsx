import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  X,
  User,
  MapPin,
  ChevronDown,
  ShoppingCart,
  Utensils,
  Store,
  Package,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HeaderUnified({
  isMapInteracting = false,
  onSearch,
  notificationCount = 0,
  cartCount = 0,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchActive, setSearchActive] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userAddress, setUserAddress] = useState('Seleccionar ubicación...');
  const [appConfig, setAppConfig] = useState({
    appName: 'JoyMap',
    appLogo: null,
  });
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Determinar sección activa
  const isComida = location.pathname === '/home' || location.pathname === '/';
  const isTienda = location.pathname === '/tienda';
  const isEnvios = location.pathname === '/envios';

  // Secciones del switcher
  const sections = [
    { id: 'comida', name: 'Comida', icon: Utensils, path: '/home', active: isComida },
    { id: 'tienda', name: 'Tienda', icon: Store, path: '/tienda', active: isTienda },
    { id: 'envios', name: 'Envíos', icon: Package, path: '/envios', active: isEnvios },
  ];

  // Cargar configuración de la app desde backend
  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        // Intentar obtener config de la app
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stores`);
        const data = await res.json();
        if (data.store_data) {
          setAppConfig({
            appName: data.store_data.name || 'JoyMap',
            appLogo: data.store_data.logoUrl || null,
          });
        }
      } catch (error) {
        // Usar valores por defecto si falla
        console.log('Using default app config');
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchAppConfig();
  }, []);

  // Cargar dirección del usuario
  useEffect(() => {
    const stored = localStorage.getItem('userAddresses');
    if (stored) {
      const addresses = JSON.parse(stored);
      if (addresses.length > 0) {
        const selected = addresses.find(a => a.isSelected) || addresses[0];
        setUserAddress(selected.street?.substring(0, 22) + '...' || 'Mi ubicación');
      }
    }
  }, []);

  // Cargar cantidad del carrito desde localStorage
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

  return (
    <>
      {/* HEADER FLOTANTE */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <header className="max-w-lg mx-auto bg-[#E53935] rounded-2xl shadow-lg overflow-hidden">
          {/* Primera fila: Logo/Ubicación + Iconos */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex justify-between items-center">
              {/* Izquierda: Logo + Ubicación */}
              <div className="flex items-center gap-2 max-w-[65%]">
                {/* Logo */}
                {loadingConfig ? (
                  <div className="w-8 h-8 rounded-lg bg-white/20 animate-pulse" />
                ) : appConfig.appLogo ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex-shrink-0">
                    <img
                      src={appConfig.appLogo}
                      alt={appConfig.appName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.parentElement.innerHTML = '<span class="w-full h-full flex items-center justify-center text-[#E53935] font-bold text-xs">JM</span>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-[#E53935] font-bold text-xs">JM</span>
                  </div>
                )}

                {/* Ubicación */}
                <button
                  onClick={() => navigate('/address')}
                  className="flex items-center gap-1 text-white hover:opacity-90 transition-opacity min-w-0"
                >
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold text-sm truncate">
                    {userAddress}
                  </span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>

              {/* Derecha: Iconos */}
              <div className="flex items-center gap-3">
                {/* Notificaciones */}
                <button
                  onClick={() => setNotificationsOpen(true)}
                  className="text-white relative hover:opacity-80 transition-opacity"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-[#E53935] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Carrito */}
                <button
                  onClick={() => navigate('/cart')}
                  className="text-white relative hover:opacity-80 transition-opacity"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {displayCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-[#E53935] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {displayCartCount > 9 ? '9+' : displayCartCount}
                    </span>
                  )}
                </button>

                {/* Perfil */}
                <button
                  onClick={() => navigate(isAuthenticated ? '/profile' : '/new-user-info')}
                  className="text-white hover:opacity-80 transition-opacity"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Segunda fila: Búsqueda */}
          <div className="px-4 pb-3">
            <button
              onClick={() => setSearchActive(true)}
              className="w-full bg-white rounded-full px-4 py-2.5 flex items-center gap-2 shadow-sm hover:shadow transition-shadow"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Buscar locales, platos y productos...</span>
            </button>
          </div>

          {/* Tercera fila: Section Switcher integrado */}
          <div className="px-4 pb-4">
            <div className="flex gap-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => navigate(section.path)}
                    className={`flex-1 py-2.5 px-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      section.active
                        ? 'bg-white text-[#E53935] shadow-md'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${section.active ? 'animate-bounce-subtle' : ''}`}
                      strokeWidth={2.5}
                    />
                    <span>{section.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>
      </div>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {searchActive && (
          <motion.div
            className="fixed inset-0 z-[60] bg-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-lg mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    autoFocus
                    placeholder="Buscar restaurantes, platillos..."
                    onChange={(e) => onSearch?.(e.target.value)}
                    className="flex-1 bg-transparent text-base outline-none placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={() => setSearchActive(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Sugerencias de búsqueda */}
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500 mb-3">Búsquedas populares</p>
                <div className="flex flex-wrap gap-2">
                  {['Pizza', 'Tacos', 'Hamburguesas', 'Sushi', 'Pollo', 'Postres'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => onSearch?.(tag)}
                      className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATIONS MODAL */}
      <AnimatePresence>
        {notificationsOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[70]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotificationsOpen(false)}
            />

            <motion.div
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-[80] shadow-xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Notificaciones</h2>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Lista */}
              <div className="overflow-y-auto h-[calc(100vh-56px)]">
                {notificationCount === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                    <Bell className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No tienes notificaciones</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {[
                      { title: "Tu pedido está en camino", desc: "El repartidor llegará en 15 min", time: "Hace 5 min", icon: "🚴" },
                      { title: "Pedido confirmado", desc: "Tu pedido #1234 fue confirmado", time: "Hace 1 hora", icon: "✅" },
                      { title: "Nuevo cupón disponible", desc: "20% de descuento en tu próximo pedido", time: "Hace 2 horas", icon: "🎉" },
                    ].map((notif, i) => (
                      <div key={i} className="px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                            {notif.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{notif.desc}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer para el contenido debajo del header flotante */}
      <div className="h-44" />

      {/* Animación sutil para el icono activo */}
      <style>
        {`
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          .animate-bounce-subtle {
            animation: bounce-subtle 1s ease-in-out infinite;
          }
        `}
      </style>
    </>
  );
}
