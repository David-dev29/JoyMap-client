import { useState, useEffect } from 'react';
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

  // ✅ Cargar negocio desde la URL cuando hay un slug
  useEffect(() => {
    if (businessSlug) {
      console.log(`🔗 URL detectada para negocio: ${businessSlug}`);
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
        console.log('✅ Negocio encontrado:', data.response);
        
        // ✅ CONSTRUIR OBJETO CORRECTAMENTE
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
          mapIcon: data.response.mapIcon || '🍽️', // ✅ AGREGAR mapIcon
          emoji: data.response.emoji, // ✅ AGREGAR emoji como fallback
        };
        
        setSelectedBusiness(businessData);
        setMenuOpen(true);
      } else {
        console.log('⚠️ Negocio no encontrado, redirigiendo...');
        navigate(`/${type === 'comida' ? 'home' : 'tienda'}`, { replace: true });
      }
    } catch (error) {
      console.error('❌ Error cargando negocio:', error);
      navigate(`/${type === 'comida' ? 'home' : 'tienda'}`, { replace: true });
    }
  };

  // ✅ Helper para construir URLs de imágenes
  const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `https://${path}`;
  };

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug);
    console.log(`📂 Categoría de ${type} seleccionada:`, categorySlug || "Todos");
  };

  // ✅ Manejar apertura de negocio desde el mapa
  const handleBusinessOpen = (business) => {
    setSelectedBusiness(business);
    setMenuOpen(true);
    
    // ✅ Actualizar URL sin recargar la página
    const businessSlug = createSlug(business.name);
    const basePath = type === 'comida' ? 'home' : 'tienda';
    navigate(`/${basePath}/${businessSlug}`, { replace: false });
  };

  // ✅ Manejar cierre del menú
  const handleMenuClose = () => {
    setMenuOpen(false);
    setSelectedBusiness(null);
    
    // ✅ Limpiar URL cuando se cierra
    const basePath = type === 'comida' ? 'home' : 'tienda';
    navigate(`/${basePath}`, { replace: false });
  };

  return (
    <div className="relative w-full h-screen">
      {/* Slider de categorías */}
      <div className="absolute top-36 left-0 right-0 z-40 px-4 pt-2 bg-transparent pb-4 pointer-events-none">
        <div className="pointer-events-auto">
          <CategoriesSlider 
            onCategorySelect={handleCategorySelect}
            searchActive={searchActive}
            selectedCategory={selectedCategory}
            type={type}
          />
        </div>
      </div>

      {/* Mapa con los negocios filtrados */}
      <HomeMap 
        selectedCategory={selectedCategory} 
        type={type}
        onBusinessOpen={handleBusinessOpen}
        initialBusiness={selectedBusiness}
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

// ✅ Helper para crear slug
function createSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}