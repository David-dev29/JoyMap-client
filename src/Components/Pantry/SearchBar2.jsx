import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const rotatingWords = [
  "productos",
  "abarrotes",
  "aceite",
  "fruta",
  "pasta",
  "leche",
  "aceite",
  "detergente",
  "tortilla",
  "limpieza",
];

export default function SearchBar2({ searchQuery, setSearchQuery, handleKeyPress, toggleSearch }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  

  return (
    <div className="relative w-full">
      {/* INPUT */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder=""
        className="w-full bg-gray-100 rounded-2xl px-4 py-3 pr-12 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E53935] placeholder-transparent"
      />

      {/* PLACEHOLDER ANIMADO */}
      {searchQuery === "" && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex gap-1 text-base">
          <span>Buscar</span>
          <div className="relative w-[100px] h-[24px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={rotatingWords[currentIndex]}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute"
              >
                {rotatingWords[currentIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ÍCONO */}
      <button
        onClick={toggleSearch}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        {searchQuery ? (
          <X className="w-5 h-5 text-gray-400" />
        ) : (
          <Search className="w-5 h-5 text-gray-400" />
        )}
      </button>
    </div>
  );
}