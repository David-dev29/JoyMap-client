import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, Utensils, Package } from 'lucide-react';

const SectionSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isComida = location.pathname === '/home' || location.pathname === '/';
  const isTienda = location.pathname === '/tienda';
  const isEnvios = location.pathname === '/envios';

  const getTranslate = () => {
    if (isComida) return 'translateX(0%)';
    if (isTienda) return 'translateX(100%)';
    if (isEnvios) return 'translateX(200%)';
  };

  const getBackgroundColor = () => {
    if (isComida) return 'bg-gradient-to-br from-[#FFCDD2] to-[#EF9A9A]/80';
    if (isTienda) return 'bg-gradient-to-br from-green-100 to-green-200/80';
    if (isEnvios) return 'bg-gradient-to-br from-[#FFCDD2] to-[#EF9A9A]/80';
  };

  return (
    <div className="w-full">
      <div className="relative flex bg-white rounded-xl overflow-hidden p-0.5 shadow-sm border border-gray-200/50 backdrop-blur-sm">

        {/* Fondo animado con gradiente y sombra */}
        <div
          className={`absolute top-0.5 left-0.5 bottom-0.5 w-[calc(33.333%-0.25rem)] rounded-[14px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg ${getBackgroundColor()}`}
          style={{
            transform: getTranslate(),
          }}
        />

        {/* Botón Comida */}
        <button
          onClick={() => navigate('/home')}
          className={`flex-1 relative z-10 font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 text-sm py-2.5 rounded-xl ${
            isComida
              ? 'text-[#D32F2F] scale-[1.02]'
              : 'text-gray-600 hover:text-gray-800 active:scale-95'
          }`}
        >
          <Utensils 
            className={`w-[18px] h-[18px] transition-transform duration-300 ${
              isComida ? 'animate-float' : ''
            }`} 
            strokeWidth={2.5}
          />
          <span>Comida</span>
        </button>

        {/* Botón Tienda */}
        <button
          onClick={() => navigate('/tienda')}
          className={`flex-1 relative z-10 font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 text-sm py-2.5 rounded-xl ${
            isTienda 
              ? 'text-green-600 scale-[1.02]' 
              : 'text-gray-600 hover:text-gray-800 active:scale-95'
          }`}
        >
          <Store 
            className={`w-[18px] h-[18px] transition-transform duration-300 ${
              isTienda ? 'animate-float' : ''
            }`}
            strokeWidth={2.5}
          />
          <span>Tienda</span>
        </button>

        {/* Botón Envíos */}
        <button
          onClick={() => navigate('/envios')}
          className={`flex-1 relative z-10 font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 text-sm py-2.5 rounded-xl ${
            isEnvios
              ? 'text-[#D32F2F] scale-[1.02]'
              : 'text-gray-600 hover:text-gray-800 active:scale-95'
          }`}
        >
          <Package 
            className={`w-[18px] h-[18px] transition-transform duration-300 ${
              isEnvios ? 'animate-float' : ''
            }`}
            strokeWidth={2.5}
          />
          <span>Envíos</span>
        </button>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          .animate-float {
            animation: float 2s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default SectionSwitcher;