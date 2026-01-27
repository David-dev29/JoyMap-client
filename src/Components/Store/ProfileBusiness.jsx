import { useState, useEffect, useMemo, useCallback } from "react";
import { socket } from "../../sockets/socket.js";
import ShareButton from "../ShareButton.jsx";
import { Banknote, CreditCard, Smartphone, Ticket, Copy, Check } from "lucide-react";

// ✅ Helper para normalizar nombres
const normalizeString = (str) =>
  str?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-") || "";

// ✅ Helper para parsear paymentMethods (puede venir como string JSON)
const parsePaymentMethods = (pm) => {
  if (!pm) return null;
  if (typeof pm === 'string') {
    try {
      return JSON.parse(pm);
    } catch {
      return null;
    }
  }
  return pm;
};

// 🎟️ Componente CouponBanner COMPACTO con 3 estados
const CouponBanner = ({ coupon, brandColor, onApply, applied, businessId }) => {
  const [isUsed, setIsUsed] = useState(false);

  // Verificar si el cupón ya fue usado en un pedido anterior
  useEffect(() => {
    if (!coupon || !businessId) return;

    try {
      const usedCoupons = JSON.parse(localStorage.getItem('usedCoupons') || '[]');
      const used = usedCoupons.some(
        uc => uc.code === coupon.code && uc.businessId === businessId
      );
      setIsUsed(used);
    } catch (e) {
      console.error('Error checking used coupons:', e);
    }
  }, [coupon, businessId]);

  if (!coupon) return null;

  // ESTADO 3: Cupón ya usado (GRIS)
  if (isUsed) {
    return (
      <div className="w-full bg-gray-400 pl-4 pr-3 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-white/70" />
            <span className="text-white/80 text-sm font-medium line-through">
              {coupon.code} - Cupón usado
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ESTADO 2: Cupón aplicado (VERDE)
  if (applied) {
    return (
      <div className="w-full bg-gradient-to-r from-green-500 to-green-600 pl-4 pr-3 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-medium">
              {coupon.code} - {coupon.discount}% OFF aplicado
            </span>
          </div>
          <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded">
            Listo
          </span>
        </div>
      </div>
    );
  }

  // ESTADO 1: Cupón disponible (NARANJA)
  return (
    <div className="w-full bg-gradient-to-r from-amber-500 to-orange-500 pl-4 pr-15 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-white" />
          <span className="text-white text-sm font-medium">
            {coupon.code} - {coupon.discount}% OFF
          </span>
        </div>
        {onApply && (
          <button
            onClick={() => onApply(coupon)}
            className="bg-white text-orange-600 px-3 py-1 rounded text-xs font-semibold hover:bg-orange-50 transition-colors flex-shrink-0"
          >
            Aplicar
          </button>
        )}
      </div>
    </div>
  );
};

// ✅ Cache de imágenes en memoria
const imageCache = new Map();

const BusinessProfile = ({
  activeCategory,
  setActiveCategory,
  cartItems = [],
  scrollContainerRef,
  selectedBusinessFromMap, // 🔥 NUEVA PROP desde el mapa
  type = "comida", // ✅ NUEVA PROP
  hasCoupon = false // 🎟️ Para ajustar posición del sticky
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

// ✅ SOCKET: escuchar actualizaciones de negocios
  useEffect(() => {
  const onBusinessUpdated = (updatedBusiness) => {
    console.log("📡 Business updated:", updatedBusiness);

    const buildImageUrl = (path) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;

      // 🔥 cache-busting
      return `${import.meta.env.VITE_API_URL}/${path}?t=${Date.now()}`;
    };

    setCategories((prev) =>
      prev.map((cat) =>
        cat.backendId === updatedBusiness._id
          ? {
              ...cat,
              isOpen: updatedBusiness.isOpen,
              deliveryTime: updatedBusiness.deliveryTime,
              deliveryCost: updatedBusiness.deliveryCost,
              minOrderAmount: updatedBusiness.minOrderAmount,
              rating: updatedBusiness.rating,
              iconImage: buildImageUrl(updatedBusiness.logo),
              bannerImage: buildImageUrl(updatedBusiness.banner),
            }
          : cat
      )
    );
  };

  socket.on("business:updated", onBusinessUpdated);

  return () => {
    socket.off("business:updated", onBusinessUpdated);
  };
}, []);




  // ✅ Scroll listener simple y eficiente
  useEffect(() => {
    if (!scrollContainerRef?.current) return;

    const handleScroll = () => {
      const scrollPos = scrollContainerRef.current.scrollTop;
      setShowSticky(scrollPos > 250);
    };

    const container = scrollContainerRef.current;
    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  // ✅ Formato de nombre memoizado
  const formatCategoryName = useCallback((name) => {
    if (name.length > 10) {
      const words = name.split(" ");
      if (words.length >= 2) {
        const mid = Math.ceil(words.length / 2);
        return {
          line1: words.slice(0, mid).join(" "),
          line2: words.slice(mid).join(" "),
        };
      }
    }
    return { line1: name, line2: "" };
  }, []);

  // --- Obtener negocios del backend ---
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("${import.meta.env.VITE_API_URL}/api/businesses/businesses");

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Transformar negocios a formato de categorías
      const transformedCategories = (data.response || []).map((business) => {
        const { line1, line2 } = formatCategoryName(business.name);
        const normalizedId = normalizeString(business.name);
      
        // Helper para construir URLs completas
       const buildImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  return `${import.meta.env.VITE_API_URL}/${path}`;
};

      
        return {
          id: normalizedId,
          backendId: business._id,
          name: business.name,
          line1,
          line2,
          category: business.category,
          location: business.location,
          deliveryTime: business.deliveryTime,
          deliveryCost: business.deliveryCost,
          minOrderAmount: business.minOrderAmount,
          rating: business.rating || 4.5,
          isOpen: business.isOpen !== false,
          iconImage: buildImageUrl(business.logo),
          bannerImage: buildImageUrl(business.banner),
        };
      });

      setCategories(transformedCategories);
      setError(null);

      if (!activeCategory && transformedCategories.length > 0) {
        setActiveCategory(transformedCategories[0].id);
      }

      // Precargar imágenes si existen
      if (transformedCategories.length > 0) {
        const firstCat = transformedCategories[0];
        const imagesToPreload = [firstCat.iconImage, firstCat.bannerImage].filter(Boolean);
        if (imagesToPreload.length > 0) {
          preloadImages(imagesToPreload);
        }
      }
    } catch (err) {
      console.error("Error fetching businesses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, setActiveCategory, formatCategoryName]);

  // 🔥 Si hay un negocio desde el mapa, usarlo directamente
  useEffect(() => {
    if (selectedBusinessFromMap) {
      console.log("🗺️ Negocio desde mapa:", selectedBusinessFromMap);
      console.log("💳 Payment methods (raw):", selectedBusinessFromMap?.paymentMethods);
      console.log("💳 Payment methods (parsed):", parsePaymentMethods(selectedBusinessFromMap?.paymentMethods));
      console.log("🎨 Brand color:", selectedBusinessFromMap?.brandColor);
      
      const { line1, line2 } = formatCategoryName(selectedBusinessFromMap.name);
      
      // Helper para construir URLs completas
      const buildImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  return `${import.meta.env.VITE_API_URL}/${path}`;
};

      
      // Crear una categoría temporal con los datos del mapa
      const businessCategory = {
        id: normalizeString(selectedBusinessFromMap.name),
        backendId: selectedBusinessFromMap.id,
        name: selectedBusinessFromMap.name,
        line1,
        line2,
        category: selectedBusinessFromMap.category,
        deliveryTime: selectedBusinessFromMap.deliveryTime,
        deliveryCost: selectedBusinessFromMap.deliveryCost,
        minOrderAmount: selectedBusinessFromMap.minOrderAmount,
        rating: selectedBusinessFromMap.rating || 4.5,
        isOpen: selectedBusinessFromMap.isOpen !== false,
        iconImage: buildImageUrl(selectedBusinessFromMap.logo),
        bannerImage: buildImageUrl(selectedBusinessFromMap.banner),
      };
      
      console.log("📸 URLs de imágenes construidas:", {
        logo: businessCategory.iconImage,
        banner: businessCategory.bannerImage
      });
      
      setCategories([businessCategory]);
      setActiveCategory(businessCategory.id);
      setLoading(false);
      
      // Precargar imágenes si existen
      const imagesToPreload = [businessCategory.iconImage, businessCategory.bannerImage].filter(Boolean);
      if (imagesToPreload.length > 0) {
        preloadImages(imagesToPreload);
      }
      
      return;
    }
    
    // Si no hay negocio del mapa, cargar todos normalmente
    fetchCategories();
  }, [selectedBusinessFromMap, formatCategoryName]);

  // ✅ Precarga optimizada de imágenes
  const preloadImages = useCallback((urls) => {
    urls.forEach(url => {
      if (!imageCache.has(url)) {
        const img = new Image();
        img.src = url;
        img.onload = () => imageCache.set(url, true);
      }
    });
  }, []);




  // ✅ Precarga lazy de otras imágenes después del mount
  useEffect(() => {
    if (categories.length > 1 && !selectedBusinessFromMap) {
      const timeout = setTimeout(() => {
        const otherImages = categories
          .slice(1)
          .flatMap(cat => [cat.iconImage, cat.bannerImage])
          .filter(Boolean);
        if (otherImages.length > 0) {
          preloadImages(otherImages);
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [categories, preloadImages, selectedBusinessFromMap]);

  // ✅ Categoría activa memoizada
  const activeCat = useMemo(
    () => categories.find((cat) => cat.id === activeCategory) || categories[0],
    [categories, activeCategory]
  );

  const formattedName = useMemo(
    () => activeCat ? formatCategoryName(activeCat.name) : { line1: "", line2: "" },
    [activeCat, formatCategoryName]
  );

  // ✅ Skeleton optimizado
  if (loading) {
    return (
      <div className="bg-white">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-b-2xl"></div>
          <div className="px-4 py-2">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-300 rounded-2xl -mt-8"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-b border-red-100">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-semibold text-sm">Error al cargar negocios</p>
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="px-4 py-4 text-center">
          <p className="text-gray-600 font-medium">Sin negocios disponibles</p>
          <p className="text-gray-500 text-sm mt-1">No hay negocios activos en este momento</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Sticky - Mini perfil que aparece al hacer scroll */}
      {showSticky && (
        <div
          className={`sticky ${hasCoupon ? 'top-[52px]' : 'top-0'} left-0 right-0 z-40 border-b border-white/20 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300`}
          style={{
            backgroundImage: activeCat?.bannerImage
              ? `linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.9) 100%), url("${encodeURI(activeCat.bannerImage)}`
              : "linear-gradient(135deg, rgba(102,126,234,0.9) 0%, rgba(118,75,162,0.9) 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              {/* Logo del negocio */}
              {/* Y también para el header sticky: */}
{activeCat?.iconImage ? (
  <div className="w-11 h-11 bg-white rounded-xl shadow-sm ring-1 ring-gray-200 shrink-0 overflow-hidden">
    <img
      src={activeCat.iconImage}
      alt={activeCat.name}
      className="w-full h-full object-cover"
      loading="eager"
    />
  </div>
) : (
  <div className="w-11 h-11 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
    <span className="text-lg font-bold text-purple-600">
      {activeCat?.name?.[0]?.toUpperCase() || "?"}
    </span>
  </div>
)}


              {/* Info del negocio */}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-gray-900 truncate mb-0.5">
                  {activeCat?.name || "Cargando..."}
                </h2>
                
                {/* Métricas compactas */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-900">
                      {activeCat?.rating?.toFixed(1) || '4.8'}
                    </span>
                  </div>
                  
                  <div className="h-2.5 w-px bg-gray-300"></div>
                  
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-gray-600 font-medium">
                      {activeCat?.deliveryTime 
                        ? `${activeCat.deliveryTime.min}-${activeCat.deliveryTime.max} min`
                        : '10-20 min'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido original - Sin animaciones de framer motion */}
      <div className="px-4 pb-0 pt-3">
        {/* Banner del negocio */}
        {/* Banner del negocio */}
<div className="relative h-32 overflow-hidden rounded-2xl shadow-md">
  <div 
    className="absolute inset-0"
    style={{
      backgroundImage: activeCat?.bannerImage
        ? `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%), url("${encodeURI(activeCat.bannerImage)}`
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    {/* ✅ BOTÓN DE COMPARTIR con Glassmorphism */}
<div className="absolute top-3 left-3 z-10">
  <ShareButton 
    business={{
      name: activeCat?.name,
      category: activeCat?.category,
      rating: activeCat?.rating,
      deliveryTime: activeCat?.deliveryTime,
      deliveryCost: activeCat?.deliveryCost,
      minOrderAmount: activeCat?.minOrderAmount,
      mapIcon: activeCat?.mapIcon || activeCat?.emoji, // ✅ AGREGAR ESTO
      emoji: activeCat?.emoji,
      logo: activeCat?.iconImage,
      banner: activeCat?.bannerImage,
      isOpen: activeCat?.isOpen,
      id: activeCat?.backendId,
    }}
    type={type}
  />
</div>
  </div>
          
          {/* Indicador de navegación - Solo si hay múltiples negocios */}
          {!selectedBusinessFromMap && categories.length > 1 && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center space-x-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <span className="text-white text-xs font-medium">
                  {categories.findIndex(cat => cat.id === activeCategory) + 1}/{categories.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Información del negocio */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-start space-x-3 mb-3">
            {/* Logo del negocio - VERSIÓN COMPLETA */}
<div className="-mt-10 relative z-10">
  {activeCat?.iconImage ? (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg ring-4 ring-white overflow-hidden">
      <img
        src={activeCat.iconImage}
        alt={activeCat.name}
        className="w-full h-full object-cover"
        loading="eager"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          e.target.style.display = "none";
        }}
        style={{
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.2s ease-in'
        }}
      />
      {!imageLoaded && (
        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
      )}
    </div>
  ) : (
    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-lg ring-4 ring-white flex items-center justify-center">
      <span className="text-2xl font-bold text-purple-600">
        {activeCat?.name?.[0]?.toUpperCase() || "?"}
      </span>
    </div>
  )}
</div>

            {/* Nombre y estado */}
            <div className="flex-1 pt-1">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {formattedName.line1}
                {formattedName.line2 && ` ${formattedName.line2}`}
              </h1>

              {/* Estado, servicio y métodos de pago */}
              <div className="flex flex-col gap-1.5 mt-1.5">
                {/* Primera línea: Estado y tipo de servicio */}
                <div className="flex items-center gap-2">
                  <span className={`flex items-center text-xs font-medium ${
                    activeCat?.isOpen ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      activeCat?.isOpen ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    {activeCat?.isOpen ? 'Abierto' : 'Cerrado'}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">A domicilio</span>
                </div>

                {/* Segunda línea: Métodos de pago como chips */}
                {(() => {
                  const paymentMethods = parsePaymentMethods(selectedBusinessFromMap?.paymentMethods);
                  if (!paymentMethods) return null;

                  const hasAnyMethod = paymentMethods.cash || paymentMethods.card || paymentMethods.transfer;
                  if (!hasAnyMethod) return null;

                  return (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {paymentMethods.cash && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                          <Banknote className="w-3 h-3" />
                          Efectivo
                        </span>
                      )}
                      {paymentMethods.card && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                          <CreditCard className="w-3 h-3" />
                          Tarjeta
                        </span>
                      )}
                      {paymentMethods.transfer && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                          <Smartphone className="w-3 h-3" />
                          Transferencia
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Métricas del negocio */}
          <div className="flex items-center justify-between py-3 px-1 border-t border-gray-100">
            <div className="flex flex-col items-center flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Entrega</p>
              <p className="text-sm font-semibold text-gray-900">
                {activeCat?.deliveryTime 
                  ? `${activeCat.deliveryTime.min}-${activeCat.deliveryTime.max} min`
                  : '10-20 min'
                }
              </p>
            </div>
            
            <div className="w-px h-10 bg-gray-200"></div>
            
            <div className="flex flex-col items-center flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Envío</p>
              <p className="text-sm font-semibold text-gray-900">
                {activeCat?.deliveryCost !== undefined
                  ? (activeCat.deliveryCost === 0 ? 'Gratis' : `$${activeCat.deliveryCost}`)
                  : '$15'
                }
              </p>
            </div>
            
            <div className="w-px h-10 bg-gray-200"></div>
            
            <div className="flex flex-col items-center flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Pedido min.</p>
              <p className="text-sm font-semibold text-gray-900">
                {activeCat?.minOrderAmount !== undefined
                  ? (activeCat.minOrderAmount === 0 ? 'Sin mínimo' : `$${activeCat.minOrderAmount}`)
                  : '$50'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

// Exportar CouponBanner para uso externo
export { CouponBanner };
export default BusinessProfile;