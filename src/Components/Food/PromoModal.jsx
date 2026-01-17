import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const PromoModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Mostrar el modal solo si no se ha mostrado antes (en esta sesión)
  useEffect(() => {
    const hasShownModal = sessionStorage.getItem('promoShown');
    if (!hasShownModal) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('promoShown', 'true'); // Guardar bandera de que ya se mostró
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Bloquear scroll del fondo
  useEffect(() => {
    document.body.style.overflow = isVisible ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  const closeModal = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <div className="fixed inset-0 z-40 bg-black opacity-50" onClick={closeModal} />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed z-50 inset-0 flex items-center justify-center"
          >
            <div className="relative mx-4 w-full max-w-[300px]">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="https://i.pinimg.com/736x/76/40/e4/7640e4a523ab08d60d0dafaf0bc49d1a.jpg"
                  alt="Anuncio"
                  className="w-full h-full object-cover rounded-2xl"
                />
                <button
                  onClick={closeModal}
                  className="absolute bottom-4 right-4 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 text-sm"
                >
                  Pide ya
                </button>
              </div>
            </div>
          </motion.div>

          <button
            onClick={closeModal}
            className="fixed bottom-26 left-1/2 transform -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-white shadow-xl transition-all hover:bg-gray-50 hover:scale-110 border-2 border-gray-100 z-50"
          >
            <X size={20} />
          </button>
        </>
      )}
    </AnimatePresence>
  );
};

export default PromoModal;




