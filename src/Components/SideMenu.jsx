import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Heart, Clock, Gift, CheckCircle, Star, ChevronRight, Trash2 } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

const SideMenu = ({ isOpen, onClose, notifications = [], onClearNotifications, onBusinessSelect }) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const { favorites, removeFavorite } = useFavorites();

  const handleBusinessClick = (business) => {
    if (onBusinessSelect) {
      onBusinessSelect(business);
    }
    onClose();
  };

  // Usar Portal para renderizar fuera del stacking context
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay oscuro con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          {/* Sidebar desde la derecha */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[200] shadow-2xl flex flex-col rounded-l-2xl"
          >
            {/* Header del sidebar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Mi cuenta</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Tabs con diseño moderno */}
            <div className="flex bg-gray-50 p-1 mx-4 mt-4 rounded-xl">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Bell className="w-4 h-4" />
                Notificaciones
                {notifications.length > 0 && (
                  <span className="bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'favorites'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Heart className="w-4 h-4" />
                Favoritos
                {favorites?.length > 0 && (
                  <span className="bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {favorites.length > 9 ? '9+' : favorites.length}
                  </span>
                )}
              </button>
            </div>

            {/* Contenido según tab activo */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'notifications' ? (
                /* Tab de Notificaciones */
                <div>
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Bell className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No tienes notificaciones</p>
                      <p className="text-gray-400 text-sm mt-1">Te avisaremos cuando haya algo nuevo</p>
                    </div>
                  ) : (
                    <>
                      {/* Botón limpiar */}
                      <div className="flex justify-end mb-3">
                        <button
                          onClick={onClearNotifications}
                          className="text-xs text-red-600 font-medium hover:text-red-700"
                        >
                          Marcar como leídas
                        </button>
                      </div>

                      {/* Lista de notificaciones */}
                      <div className="space-y-3">
                        {notifications.map((notif, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                notif.type === 'order' ? 'bg-amber-100' :
                                notif.type === 'promo' ? 'bg-red-100' :
                                'bg-green-100'
                              }`}>
                                {notif.type === 'order' && <Clock className="w-5 h-5 text-amber-600" />}
                                {notif.type === 'promo' && <Gift className="w-5 h-5 text-red-600" />}
                                {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.desc}</p>
                                <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Tab de Favoritos */
                <div>
                  {!favorites || favorites.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Heart className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No tienes favoritos</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Guarda tus negocios favoritos tocando el corazón
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {favorites.map((business, i) => (
                        <motion.div
                          key={business.id || business._id || i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          {/* Logo del negocio */}
                          <div
                            onClick={() => handleBusinessClick(business)}
                            className="w-14 h-14 rounded-xl bg-white shadow-sm overflow-hidden flex-shrink-0 cursor-pointer"
                          >
                            {business.logo ? (
                              <img
                                src={business.logo.startsWith('http') ? business.logo : `${import.meta.env.VITE_API_URL}/${business.logo}`}
                                alt={business.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                                <span className="text-xl font-bold text-red-600">
                                  {business.name?.[0]?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Info del negocio */}
                          <div
                            onClick={() => handleBusinessClick(business)}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <p className="font-medium text-gray-900 truncate">{business.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500 truncate">
                                {business.category || 'Restaurante'}
                              </span>
                              {business.rating && (
                                <span className="flex items-center gap-0.5 text-xs text-amber-600">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  {business.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleBusinessClick(business)}
                              className="w-9 h-9 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => removeFavorite(business.id || business._id)}
                              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SideMenu;
