import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  X,
  User,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionSwitcher from "./SectionSwitcher";
import { useAuth } from "../context/AuthContext";

export default function HeaderUnified({
  isMapInteracting = false,
  onSearch,
  notificationCount = 0,
}) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchActive, setSearchActive] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState('Seleccionar ubicación');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/stores`)
      .then(res => res.json())
      .then(data => {
        setStoreData(data.store_data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Cargar dirección del usuario
  useEffect(() => {
    const stored = localStorage.getItem('userAddresses');
    if (stored) {
      const addresses = JSON.parse(stored);
      if (addresses.length > 0) {
        const selected = addresses.find(a => a.isSelected) || addresses[0];
        setUserAddress(selected.street?.substring(0, 35) + '...' || 'Mi ubicación');
      }
    }
  }, []);

  const logoUrl = storeData?.logoUrl || null;

  // Obtener inicial del usuario
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      {/* HEADER PRINCIPAL */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-soft">
        <div className="max-w-lg mx-auto">
          {/* Top Row */}
          <div className="h-14 px-4 flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
              ) : logoUrl ? (
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.parentElement.innerHTML = '<div class="w-full h-full bg-primary-500 flex items-center justify-center"><span class="text-white font-bold text-sm">JM</span></div>';
                    }}
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">JM</span>
                </div>
              )}
            </div>

            {/* Ubicación (Centro) */}
            <button
              onClick={() => navigate('/address')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors max-w-[200px]"
            >
              <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">
                {userAddress}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </button>

            {/* Acciones (Derecha) */}
            <div className="flex items-center gap-1.5">
              {/* Búsqueda */}
              <button
                onClick={() => setSearchActive(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              {/* Notificaciones */}
              <button
                onClick={() => setNotificationsOpen(true)}
                className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{notificationCount}</span>
                  </span>
                )}
              </button>

              {/* Perfil */}
              <button
                onClick={() => navigate(isAuthenticated ? '/profile' : '/new-user-info')}
                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
              >
                {isAuthenticated ? (
                  <div className="w-full h-full bg-primary-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{userInitial}</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Section Switcher */}
          <div className="px-4 pb-2">
            <SectionSwitcher />
          </div>
        </div>
      </header>

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
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
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
                      className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
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
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-[80] shadow-strong"
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

      {/* Spacer para el contenido debajo del header */}
      <div className="h-28" />
    </>
  );
}
