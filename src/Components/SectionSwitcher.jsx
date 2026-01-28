import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, Utensils, Package } from 'lucide-react';

// Configuración de secciones
const SECTIONS = [
  { id: 'comida', name: 'Comida', path: '/home', altPaths: ['/'], icon: Utensils },
  { id: 'tienda', name: 'Tienda', path: '/tienda', icon: Store },
  { id: 'envios', name: 'Envíos', path: '/envios', icon: Package },
];

const SectionSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const buttonRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isReady, setIsReady] = useState(false);

  // Determinar sección activa
  const activeSection = SECTIONS.find(
    s => s.path === location.pathname || s.altPaths?.includes(location.pathname)
  ) || SECTIONS[0];

  // Calcular posición del indicador
  const updateIndicator = () => {
    const activeButton = buttonRefs.current[activeSection.id];
    const container = containerRef.current;

    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
      setIsReady(true);
    }
  };

  // Actualizar indicador cuando cambia la sección activa
  useLayoutEffect(() => {
    updateIndicator();
  }, [activeSection.id]);

  // Actualizar en resize
  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeSection.id]);

  return (
    <div className="flex justify-center w-full">
      {/* Contenedor principal - Estilo futurista oscuro */}
      <div
        ref={containerRef}
        className="relative inline-flex items-center bg-gray-900/95 backdrop-blur-xl rounded-full p-1 shadow-2xl shadow-black/20 border border-white/5"
      >
        {/* Indicador deslizante con glow */}
        <div
          className={`
            absolute top-1 bottom-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full
            shadow-lg shadow-red-500/40
            transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
            ${isReady ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        >
          {/* Efecto glow interno */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20" />
        </div>

        {/* Botones de sección */}
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === activeSection.id;

          return (
            <button
              key={section.id}
              ref={el => buttonRefs.current[section.id] = el}
              onClick={() => navigate(section.path)}
              className={`
                relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full
                font-medium text-sm transition-all duration-300
                ${isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
                }
              `}
            >
              <Icon
                className={`w-[18px] h-[18px] transition-all duration-300 ${
                  isActive ? 'scale-110' : ''
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`transition-all duration-300 ${isActive ? 'font-semibold' : ''}`}>
                {section.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SectionSwitcher;
