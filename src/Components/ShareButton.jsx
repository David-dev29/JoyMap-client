import { Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ShareButton({ business, type = "comida" }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShouldAnimate(true);
      setTimeout(() => setShouldAnimate(false), 600);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const createSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const businessSlug = createSlug(business.name);
    const baseUrl = window.location.origin;
    const section = type === 'comida' ? 'home' : 'tienda';
    const shareUrl = `${baseUrl}/${section}/${businessSlug}`;
    
    // ✅ FIX: Priorizar mapIcon sobre emoji
    const emoji = business.mapIcon || business.emoji || '🍽️';
    
    const deliveryTimeText = business.deliveryTime 
      ? `${business.deliveryTime.min}-${business.deliveryTime.max} min`
      : '30-40 min';
    
    const deliveryCostText = business.deliveryCost === 0 
      ? 'Gratis' 
      : `$${business.deliveryCost || 25}`;
    
    const message = `${emoji} *${business.name}*\n` +
                   `━━━━━━━━━━━━━━━━\n` +
                   `📍 ${business.category || 'Restaurante'}\n` +
                   `⭐ ${business.rating}/5 estrellas\n` +
                   `🚚 Entrega: ${deliveryTimeText}\n` +
                   `💰 Envío: ${deliveryCostText}\n\n` +
                   `👉 ${shareUrl}\n\n` +
                   `¡Descubre más lugares cerca de ti con UbicaTu! 📲`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 100);
  };

  return (
    <>
      <button
        onClick={handleShare}
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className={`
          flex items-center gap-2 px-3 py-1.5
          bg-white/20 backdrop-blur-md
          border border-white/30
          rounded-full shadow-lg
          hover:bg-white/30 hover:scale-105
          active:scale-95
          transition-all duration-200
          ${shouldAnimate ? 'animate-professional-tilt' : ''}
        `}
      >
        <Share2 size={16} className="text-white drop-shadow-lg" />
        <span className="text-xs font-semibold text-white drop-shadow-lg">
          Compartir
        </span>
      </button>

      <style jsx>{`
        @keyframes professional-tilt {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          15% {
            transform: rotate(-3deg) scale(1.05);
          }
          30% {
            transform: rotate(3deg) scale(1.05);
          }
          45% {
            transform: rotate(-2deg) scale(1.03);
          }
          60% {
            transform: rotate(0deg) scale(1);
          }
        }

        .animate-professional-tilt {
          animation: professional-tilt 0.6s ease-in-out;
        }
      `}</style>
    </>
  );
}