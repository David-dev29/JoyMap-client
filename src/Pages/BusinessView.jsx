import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from 'lucide-react';
import HomeMap from '../Components/Store/HomeMap.jsx';
import CategoriesSlider from '../Components/Store/CategoriesSlider.jsx';
import BusinessMenuSheet from '../Components/BusinessMenuSheet.jsx';

export default function BusinessView({ type = null }) {
  const { businessSlug } = useParams();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState(null);

  // Estado para el mapa
  const [mapControls, setMapControls] = useState({
    recenter: null,
    hasUserLocation: false,
  });

  // Fetch cupón activo cuando cambia el negocio
  useEffect(() => {
    const fetchActiveCoupon = async () => {
      const businessId = selectedBusiness?.id;
      if (!businessId) {
        setActiveCoupon(null);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/coupons/business/${businessId}/active`
        );
        const data = await response.json();

        if (data.success && data.coupon) {
          console.log('🎟️ Cupón activo encontrado:', data.coupon);
          setActiveCoupon(data.coupon);
        } else {
          setActiveCoupon(null);
        }
      } catch (error) {
        console.error('Error fetching active coupon:', error);
        setActiveCoupon(null);
      }
    };

    fetchActiveCoupon();
  }, [selectedBusiness?.id]);

  // Cargar negocio desde la URL cuando hay un slug
  useEffect(() => {
    if (businessSlug) {
      loadBusinessFromSlug(businessSlug);
    } else {
      setMenuOpen(false);
      setSelectedBusiness(null);
    }
  }, [businessSlug]);

  const loadBusinessFromSlug = async (slug) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/businesses/slug/${slug}`);
      const data = await res.json();

      if (data.success && data.response) {
        const businessData = {
          id: data.response._id,
          name: data.response.name,
          rating: data.response.rating || 4.5,
          category: data.response.category?.name || 'Sin categoría',
          categorySlug: data.response.category?.slug,
          logo: buildImageUrl(data.response.logo),
          banner: buildImageUrl(data.response.banner),
          deliveryTime: data.response.deliveryTime || { min: 30, max: 40 },
          deliveryCost: data.response.deliveryCost || 25,
          minOrderAmount: data.response.minOrderAmount || 50,
          isOpen: data.response.isOpen !== false,
          mapIcon: data.response.mapIcon || '🍽️',
          emoji: data.response.emoji,
          // Agregar métodos de pago y color personalizado
          paymentMethods: data.response.paymentMethods,
          brandColor: data.response.brandColor,
          activeCoupon: data.response.activeCoupon,
        };

        setSelectedBusiness(businessData);
        setMenuOpen(true);
      } else {
        navigate(getBasePath(), { replace: true });
      }
    } catch (error) {
      navigate(getBasePath(), { replace: true });
    }
  };

  // Helper para obtener la ruta base según el tipo
  const getBasePath = () => {
    if (!type) return '/';
    if (type === 'comida') return '/home';
    if (type === 'tienda') return '/tienda';
    return '/';
  };

  const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `https://${path}`;
  };

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug);
  };

  const handleBusinessOpen = async (business) => {
    // Mostrar inmediatamente con datos básicos del mapa
    setSelectedBusiness(business);
    setMenuOpen(true);

    const businessSlug = createSlug(business.name);
    // Usar 'home' como fallback para negocios cuando no hay tipo seleccionado
    const basePath = type === 'tienda' ? 'tienda' : 'home';
    navigate(`/${basePath}/${businessSlug}`, { replace: false });

    // Fetch datos completos del negocio (incluye paymentMethods, brandColor, etc.)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/businesses/${business.id}`);
      const data = await res.json();

      if (data.success && data.response) {
        const fullBusinessData = {
          id: data.response._id,
          name: data.response.name,
          rating: data.response.rating || 4.5,
          category: data.response.category?.name || 'Sin categoría',
          categorySlug: data.response.category?.slug,
          logo: buildImageUrl(data.response.logo),
          banner: buildImageUrl(data.response.banner),
          deliveryTime: data.response.deliveryTime || { min: 30, max: 40 },
          deliveryCost: data.response.deliveryCost || 25,
          minOrderAmount: data.response.minOrderAmount || 50,
          isOpen: data.response.isOpen !== false,
          mapIcon: data.response.mapIcon || '🍽️',
          emoji: data.response.emoji,
          paymentMethods: data.response.paymentMethods,
          brandColor: data.response.brandColor,
          activeCoupon: data.response.activeCoupon,
        };

        // Actualizar con datos completos
        setSelectedBusiness(fullBusinessData);
        console.log('✅ Business data completa:', fullBusinessData);
      }
    } catch (error) {
      console.error('Error fetching full business data:', error);
      // Mantener datos básicos si falla el fetch
    }
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
    setSelectedBusiness(null);

    // Volver a la ruta base según el tipo
    const basePath = !type ? '/' : (type === 'tienda' ? '/tienda' : '/home');
    navigate(basePath, { replace: false });
  };

  // Callback cuando el mapa está listo
  const handleMapReady = useCallback((controls) => {
    setMapControls(controls);
  }, []);

  // Función para centrar el mapa
  const handleCenterMap = useCallback(() => {
    if (mapControls.recenter) {
      mapControls.recenter();
    }
  }, [mapControls]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Contenedor del mapa - ocupa toda la pantalla, el header flota encima */}
      <div className="absolute inset-0">
        <HomeMap
          selectedCategory={selectedCategory}
          type={type}
          onBusinessOpen={handleBusinessOpen}
          initialBusiness={selectedBusiness}
          onMapReady={handleMapReady}
        />
      </div>

      {/* Bottom Sheet con categorías + botón de centrar */}
      <CategoriesSlider
        onCategorySelect={handleCategorySelect}
        searchActive={searchActive}
        selectedCategory={selectedCategory}
        type={type}
        onCenterMap={handleCenterMap}
        showCenterButton={true}
        hasUserLocation={mapControls.hasUserLocation}
      />

      {/* Botón de centrar mapa independiente cuando no hay categorías (type=null) */}
      {!type && (
        <div className="fixed bottom-6 right-4 z-40">
          <button
            onClick={handleCenterMap}
            className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center
                       hover:bg-blue-50 transition-all text-gray-700 hover:text-blue-600
                       active:scale-95 group relative"
            title="Ir a mi ubicación"
          >
            <Navigation
              className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
              fill="currentColor"
            />
            {mapControls.hasUserLocation && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      )}

      {/* BusinessMenuSheet */}
      <BusinessMenuSheet
        open={menuOpen}
        business={selectedBusiness}
        onClose={handleMenuClose}
        type={type}
        activeCoupon={activeCoupon}
      />
    </div>
  );
}

function createSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
