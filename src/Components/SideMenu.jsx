import { useState, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Heart, Clock, Gift, CheckCircle, Star, ChevronRight, Trash2 } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

const SideMenu = memo(({ isOpen, onClose, notifications = [], onClearNotifications, onBusinessSelect }) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const { favorites, removeFavorite } = useFavorites();

  const handleBusinessClick = useCallback((business) => {
    if (onBusinessSelect) {
      onBusinessSelect(business);
    }
    onClose();
  }, [onBusinessSelect, onClose]);

  // No renderizar nada si está cerrado
  if (!isOpen) return null;

  // Usar Portal para renderizar fuera del stacking context
  return createPortal(
    <>
      {/* CSS Keyframes para animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Overlay oscuro - CSS transition */}
      <div
        className="fixed inset-0 bg-black/60 z-[200]"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.15s ease-out' }}
      />

      {/* Sidebar desde la derecha - CSS transition */}
      <div
        className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[200] shadow-2xl flex flex-col rounded-l-2xl"
        style={{ animation: 'slideInRight 0.2s ease-out' }}
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
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === 'notifications'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notificaciones
            {notifications.length > 0 && (
              <span className="bg-rose-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === 'favorites'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart className="w-4 h-4" />
            Favoritos
            {favorites?.length > 0 && (
              <span className="bg-rose-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
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
                      className="text-xs text-rose-600 font-medium hover:text-rose-700"
                    >
                      Marcar como leídas
                    </button>
                  </div>

                  {/* Lista de notificaciones */}
                  <div className="space-y-3">
                    {notifications.map((notif, i) => (
                      <div
                        key={i}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                        style={{ animation: `fadeInUp 0.2s ease-out ${i * 0.03}s both` }}
                      >
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notif.type === 'order' ? 'bg-amber-100' :
                            notif.type === 'promo' ? 'bg-rose-100' :
                            'bg-green-100'
                          }`}>
                            {notif.type === 'order' && <Clock className="w-5 h-5 text-amber-600" />}
                            {notif.type === 'promo' && <Gift className="w-5 h-5 text-rose-600" />}
                            {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.desc}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
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
                    <div
                      key={business.id || business._id || i}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      style={{ animation: `fadeInUp 0.2s ease-out ${i * 0.03}s both` }}
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
                          <div className="w-full h-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center">
                            <span className="text-xl font-bold text-rose-600">
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
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => removeFavorite(business.id || business._id)}
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-rose-100 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
});

export default SideMenu;
