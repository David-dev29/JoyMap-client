import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import Food from "../Pages/Food";
import { X } from "lucide-react";

export default function BusinessMenuSheet({ open, onClose, business }) {
  const scrollRef = useRef(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col max-w-2xl mx-auto overflow-hidden"
            style={{ height: "80vh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 400 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            dragMomentum={false}
            onDragEnd={(e, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) {
                onClose();
              }
            }}
          >
            {/* Handle de arrastre */}
            <div className="absolute top-0 left-0 right-0 z-[50] flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing">
              <motion.div
                className="w-10 h-1 bg-gray-300 rounded-full"
                whileHover={{ width: 48, backgroundColor: "#9ca3af" }}
                transition={{ duration: 0.2 }}
              />
            </div>

            {/* Botón cerrar */}
            <motion.button
              onClick={onClose}
              className="absolute top-2 right-3 z-[50] p-2 bg-white/95 hover:bg-white shadow-lg rounded-full transition-all hover:scale-110"
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} className="text-gray-700" />
            </motion.button>

            {/* Contenido scrolleable - SIN overflow-x */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db transparent',
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="pt-6"
              >
                {/* 🔥 PASAR business como prop */}
                <Food 
                  scrollContainerRef={scrollRef} 
                  selectedBusinessFromMap={business}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Estilos para scrollbar */}
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-track {
              background: transparent;
            }
            div::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}