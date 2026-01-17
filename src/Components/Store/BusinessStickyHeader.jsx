import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";

export default function BusinessStickyHeader({ business, visible, onClose }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-3">
            {business?.logo && (
              <img
                src={business.logo}
                className="w-9 h-9 rounded-xl object-contain"
              />
            )}

            <div>
              <p className="text-sm font-semibold">{business?.name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                {business?.rating || "4.5"}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 rounded-full"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
