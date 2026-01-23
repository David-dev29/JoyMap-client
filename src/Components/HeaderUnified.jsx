import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  X,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionSwitcher from "./SectionSwitcher";
import { useAuth } from "../context/AuthContext";

export default function MapHeaderEncorto({
  isMapInteracting = false,
  onSearch,
  notificationCount = 3,
}) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchActive, setSearchActive] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const rotatingWords = [
    "negocios",
    "pizzerias",
    "comidas",
    "antojos",
    "taquerias",
    "panaderias",
    "gustitos",
  ];

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/stores`)
      .then(res => res.json())
      .then(data => {
        setStoreData(data.store_data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching store:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [loading, rotatingWords.length]);

  const logoUrl = storeData?.logoUrl || null;
  const textLogoUrl = storeData?.textLogoUrl || null;

  return (
    <>
      {/* HEADER - Z-INDEX ALTO PARA ESTAR SOBRE EL MAPA */}
      <div className="fixed top-2 left-4 right-4 z-40 max-w-lg mx-auto pointer-events-none">
        <div className="pointer-events-auto backdrop-blur-xl bg-red-600 border border-gray-200/60 shadow-lg rounded-2xl overflow-hidden">
          
          {/* TOP ROW */}
          <div className="px-4 py-2.5">
            {!searchActive ? (
              <div className="flex items-center justify-between gap-3">
                {/* Logo + Texto */}
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    {loading ? (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                    ) : logoUrl ? (
                      <>
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-red-600 shadow-md border border-gray-100">
                          <img 
                            src={logoUrl} 
                            alt={storeData?.businessName || "Logo"}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center"><span class="text-white font-bold text-lg">U</span></div>';
                            }}
                          />
                        </div>
                        
                        {notificationCount > 0 && (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotificationsOpen(true);
                            }}
                            className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full 
                                     flex items-center justify-center shadow-lg hover:bg-orange-600 
                                     transition-colors ring-2 ring-white px-1.5"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <span className="text-white text-[10px] font-bold">{notificationCount}</span>
                          </motion.button>
                        )}
                      </>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">U</span>
                      </div>
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    {loading ? (
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <>
                        {/* Logo tipográfico MÁS PEQUEÑO */}
                        {textLogoUrl ? (
                          <img 
                            src={textLogoUrl} 
                            alt="UbicaTu"
                            className="h-6 w-auto object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = document.createElement('span');
                              fallback.className = 'text-sm font-bold text-orange-600';
                              fallback.textContent = 'UbicaTu';
                              e.target.parentElement.insertBefore(fallback, e.target);
                            }}
                          />
                        ) : (
                          <span className="text-sm font-bold text-orange-600">UbicaTu</span>
                        )}
                        
                        {/* Palabras rotativas más pequeñas */}
                        <div className="text-xs font-normal text-white overflow-hidden h-4 flex items-center">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={currentWordIndex}
                              initial={{ y: 16, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -16, opacity: 0 }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                              className="inline-block"
                            >
                              {rotatingWords[currentWordIndex]}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-2">
                  {/* Usuario autenticado */}
                  {isAuthenticated && user && (
                    <button
                      onClick={() => navigate('/profile')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all"
                    >
                      <User className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700 max-w-[80px] truncate">
                        {user.name?.split(' ')[0] || 'Usuario'}
                      </span>
                    </button>
                  )}

                  {/* Botón de búsqueda */}
                  <button
                    onClick={() => setSearchActive(true)}
                    className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 hover:from-orange-50 hover:to-orange-100 flex items-center justify-center active:scale-95 transition-all shadow-sm"
                  >
                    <Search className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            ) : (
              // BUSCADOR - Transición más rápida
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex-1 flex items-center gap-2.5 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl px-4 py-2.5 border border-orange-200/50">
                  <Search className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <input
                    autoFocus
                    placeholder="Busca tacos, pizza, burgers..."
                    onChange={(e) => onSearch?.(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-medium outline-none placeholder-orange-400/70 text-gray-900"
                  />
                </div>
                <button
                  onClick={() => setSearchActive(false)}
                  className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center active:scale-95 transition-all"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </motion.div>
            )}
          </div>

          {/* SECTION SWITCHER - Solo visible cuando NO está buscando */}
          <AnimatePresence mode="wait">
            {!searchActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>
                <div className="px-4 py-3">
                  <SectionSwitcher />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL DE NOTIFICACIONES */}
      <AnimatePresence>
        {notificationsOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[650]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotificationsOpen(false)}
            />

            <motion.div
              className="fixed top-20 left-4 right-4 max-w-md mx-auto bg-white rounded-2xl shadow-2xl z-[700] overflow-hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-white" />
                  <h3 className="text-white font-bold text-base">Notificaciones</h3>
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {notificationCount}
                  </span>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="min-w-[44px] min-h-[44px] w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {[
                  { title: "¡Tu pedido está en camino! 🚀", time: "Hace 5 min", icon: "🍕" },
                  { title: "Nuevo descuento del 20% en tacos", time: "Hace 1 hora", icon: "🌮" },
                  { title: "Tu restaurante favorito abrió", time: "Hace 2 horas", icon: "⭐" },
                ].map((notif, i) => (
                  <button
                    key={i}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0 min-h-[60px]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{notif.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm leading-snug">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <button className="w-full text-center text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors min-h-[44px]">
                  Ver todas las notificaciones
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}