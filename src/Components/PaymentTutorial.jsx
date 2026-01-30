import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiXBold } from 'react-icons/pi';

const PaymentTutorial = ({ onComplete, carouselRef }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const steps = [
    {
      title: "Elige cómo pagar",
      description: "Desliza para elegir tu medio de pago o agregar uno nuevo.",
      buttonText: "Siguiente"
    },
    {
      title: "Importante",
      description: "No podrás cambiarlo luego de confirmar el pedido.",
      buttonText: "Entendido"
    }
  ];

  // Auto-scroll de las cards durante el tutorial
  useEffect(() => {
    if (carouselRef?.current) {
      const carousel = carouselRef.current;
      const cardWidth = 236; // w-56 (224px) + gap-3 (12px)
      let currentIndex = 0;

      const autoScroll = setInterval(() => {
        currentIndex = (currentIndex + 1) % 3;
        carousel.scrollTo({
          left: currentIndex * cardWidth,
          behavior: 'smooth'
        });
      }, 1200);

      return () => clearInterval(autoScroll);
    }
  }, [carouselRef]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // localStorage.setItem('paymentTutorialSeen', 'true'); // Comentado para pruebas
      onComplete();
    }
  };

  const handleSkip = () => {
    // localStorage.setItem('paymentTutorialSeen', 'true'); // Comentado para pruebas
    onComplete();
  };

  const currentStep = steps[step - 1];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] pointer-events-auto"
      >
        {/* Spotlight effect - overlays separados para dejar visible la sección de pago */}

        {/* Overlay superior (solo el header) */}
        <div
          className="absolute top-0 left-0 right-0 h-14 bg-black/70"
          onClick={handleSkip}
        />

        {/* Overlay inferior (debajo de la sección de métodos de pago) */}
        <div
          className="absolute top-[232px] left-0 right-0 bottom-0 bg-black/70"
          onClick={handleSkip}
        />

        {/* Tooltip compacto con flecha */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-[242px] left-4 right-4 z-10"
        >
          <div className="max-w-xs mx-auto">
            {/* Flecha apuntando arriba */}
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0
                border-l-[10px] border-l-transparent
                border-r-[10px] border-r-transparent
                border-b-[10px] border-b-white"
            />

            {/* Contenido del tooltip - más compacto */}
            <div className="bg-white rounded-xl p-4 shadow-lg relative">
              {/* Botón cerrar (solo en paso 2) */}
              {step === 2 && (
                <button
                  onClick={handleSkip}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <PiXBold className="w-4 h-4 text-gray-400" />
                </button>
              )}

              {/* Icono de deslizar - más pequeño */}
              <div className="flex justify-center mb-2">
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 text-rose-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Título - más pequeño */}
              <h3 className="font-semibold text-base text-gray-900 text-center mb-1">
                {currentStep.title}
              </h3>

              {/* Descripción - más pequeña */}
              <p className="text-gray-500 text-center text-xs mb-3 leading-relaxed">
                {currentStep.description}
              </p>

              {/* Footer: indicador + botón - más compacto */}
              <div className="flex items-center justify-between">
                {/* Indicador de pasos (líneas más pequeñas) */}
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-0.5 rounded-full transition-all duration-300 ${
                        i < step
                          ? 'w-5 bg-rose-600'
                          : 'w-5 bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Botón más pequeño */}
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-rose-600 text-white font-medium text-sm rounded-full hover:bg-rose-700 transition-colors active:scale-95"
                >
                  {currentStep.buttonText}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentTutorial;
