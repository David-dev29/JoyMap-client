import { useEffect, useState, useRef } from "react";
import Banner1 from "../../assets/nun.png";
import Banner2 from "../../assets/LOLL.png";
import Banner3 from "../../assets/kiki.png";

const HeroBannerTienda = () => {
  const [currentSlide, setCurrentSlide] = useState(1); // Iniciamos en el medio (Banner2)
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Usamos las imágenes importadas
  const slides = [Banner1, Banner2, Banner3];

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const goToSlide = (index) => {
    if (index === currentSlide || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const getCardStyle = (index) => {
    const current = currentSlide;
    const total = slides.length;
    
    // Calcular posición relativa
    let position = index - current;
    if (position > total / 2) position -= total;
    if (position < -total / 2) position += total;

    if (position === 0) {
      // Card principal (centro)
      return {
        transform: 'translateX(0%) scale(0.95)',
        opacity: 1,
        zIndex: 30,
        filter: 'brightness(1)',
      };
    } else if (position === 1) {
      // Card derecha (parcialmente visible con más espacio)
      return {
        transform: 'translateX(80%) scale(0.8)',
        opacity: 1,
        zIndex: 20,
        filter: 'brightness(1)',
      };
    } else if (position === -1) {
      // Card izquierda (parcialmente visible con más espacio)
      return {
        transform: 'translateX(-80%) scale(0.8)',
        opacity: 1,
        zIndex: 20,
        filter: 'brightness(1)',
      };
    } else {
      // Cards ocultas
      return {
        transform: position > 0 ? 'translateX(110%) scale(0.7)' : 'translateX(-110%) scale(0.7)',
        opacity: 0,
        zIndex: 10,
        filter: 'brightness(1)',
      };
    }
  };

  return (
    <div className="py-4">
      {/* Contenedor del carrusel */}
      <div 
        className="relative h-28 md:h-28 lg:h-32 overflow-hidden px-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cards flotantes */}
        {slides.map((slide, index) => {
          const cardStyle = getCardStyle(index);
          
          return (
            <div
              key={index}
              className="absolute top-0 left-0 w-full h-full transition-all duration-500 ease-out cursor-pointer"
              style={{
                transform: cardStyle.transform,
                opacity: cardStyle.opacity,
                zIndex: cardStyle.zIndex,
                filter: cardStyle.filter,
              }}
              onClick={() => goToSlide(index)}
            >
              {/* Card con sombra flotante */}
              <div className="mx-6 h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <img
                  src={slide}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                
                {/* Solo efecto de brillo en card activa */}
                {index === currentSlide && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 transform -translate-x-full hover:translate-x-full"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicadores de slide mejorados */}
      <div className="flex justify-center mt-4 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
            className={`transition-all duration-300 rounded-full disabled:opacity-50 ${
              index === currentSlide 
                ? "w-8 h-3 bg-red-600 shadow-lg" 
                : "w-3 h-3 bg-red-200 hover:bg-red-300 hover:scale-110"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBannerTienda;