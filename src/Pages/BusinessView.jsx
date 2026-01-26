import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HomeMap from '../Components/Store/HomeMap.jsx';
import CategoriesSlider from '../Components/Store/CategoriesSlider.jsx';
import BusinessMenuSheet from '../Components/BusinessMenuSheet.jsx';

export default function BusinessView({ type = "comida" }) {
  const { businessSlug } = useParams();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Estado para el mapa
  const [mapControls, setMapControls] = useState({
    recenter: null,
    hasUserLocation: false,
  });

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
        };

        setSelectedBusiness(businessData);
        setMenuOpen(true);
      } else {
        navigate(`/${type === 'comida' ? 'home' : 'tienda'}`, { replace: true });
      }
    } catch (error) {
      navigate(`/${type === 'comida' ? 'home' : 'tienda'}`, { replace: true });
    }
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

  const handleBusinessOpen = (business) => {
    setSelectedBusiness(business);
    setMenuOpen(true);

    const businessSlug = createSlug(business.name);
    const basePath = type === 'comida' ? 'home' : 'tienda';
    navigate(`/${basePath}/${businessSlug}`, { replace: false });
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
    setSelectedBusiness(null);

    const basePath = type === 'comida' ? 'home' : 'tienda';
    navigate(`/${basePath}`, { replace: false });
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
    <div className="fixed inset-0 overflow-hidden flex flex-col">
      {/* Spacer para el header */}
      <div className="h-[130px] flex-shrink-0" />

      {/* Contenedor del mapa */}
      <div className="flex-1 relative overflow-hidden">
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

      {/* BusinessMenuSheet */}
      <BusinessMenuSheet
        open={menuOpen}
        business={selectedBusiness}
        onClose={handleMenuClose}
        type={type}
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
