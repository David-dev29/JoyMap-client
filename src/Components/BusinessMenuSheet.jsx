import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Food from "../Pages/Food";
import { X } from "lucide-react";
import { CouponBanner } from "./Store/ProfileBusiness";

export default function BusinessMenuSheet({ open, onClose, business, activeCoupon }) {
  const scrollRef = useRef(null);
  const businessId = business?.id;

  // Estado del cupón aplicado (persistente)
  const [couponApplied, setCouponApplied] = useState(false);

  // Verificar si el cupón ya está aplicado al cargar
  useEffect(() => {
    if (!activeCoupon || !businessId) return;

    const savedCoupon = localStorage.getItem('appliedCoupon');
    if (savedCoupon) {
      try {
        const parsed = JSON.parse(savedCoupon);
        if (parsed.code === activeCoupon.code && parsed.businessId === businessId) {
          setCouponApplied(true);
        }
      } catch (e) {
        console.error('Error parsing saved coupon:', e);
      }
    }
  }, [activeCoupon, businessId]);

  // Función para aplicar cupón
  const handleApplyCoupon = useCallback((coupon) => {
    localStorage.setItem('appliedCoupon', JSON.stringify({
      code: coupon.code,
      discount: coupon.discount,
      discountType: coupon.discountType || 'percentage',
      description: coupon.description,
      businessId: businessId,
      minOrder: coupon.minOrder || 0,
      couponId: coupon._id || coupon.id
    }));
    setCouponApplied(true);
    console.log('🎟️ Cupón aplicado:', coupon.code);
  }, [businessId]);

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
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-2xl mx-auto"
            style={{ maxHeight: '85vh' }}
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
            {/* Contenedor interno */}
            <div className="relative flex flex-col h-[85vh] max-h-[85vh] rounded-t-3xl overflow-hidden">

              {/* SECCIÓN STICKY - No scrollea */}
              <div className="flex-shrink-0 relative">
                {/* Handle centrado superpuesto */}
                <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-2 pointer-events-none">
                  <div className="w-10 h-1 bg-white/60 rounded-full pointer-events-auto cursor-grab active:cursor-grabbing" />
                </div>

                {/* Botón cerrar superpuesto */}
                <motion.button
                  onClick={onClose}
                  className="absolute top-2 right-3 z-40 w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>

                {/* Banner de cupón - FIJO, no scrollea */}
                {activeCoupon && (
                  <div className="mb-0">
                    <CouponBanner
                      coupon={activeCoupon}
                      brandColor={business?.brandColor}
                      onApply={handleApplyCoupon}
                      applied={couponApplied}
                      businessId={businessId}
                    />
                  </div>
                )}

                {/* Espaciador si no hay cupón */}
                {!activeCoupon && <div className="h-8"></div>}
              </div>

              {/* SECCIÓN SCROLLEABLE - Solo esta parte scrollea */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent',
                }}
              >
                <Food
                  scrollContainerRef={scrollRef}
                  selectedBusinessFromMap={business}
                  activeCoupon={null}
                />
              </div>

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