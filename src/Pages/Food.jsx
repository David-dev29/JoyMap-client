import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import ShareButton from '../Components/ShareButton.jsx';
import HeroBannerTienda from "../Components/Store/HeroBanner.jsx";
import CategoryIcons from "../Components/Store/ProfileBusiness.jsx";
import CategoryTabs from "../Components/Store/CategoryTabs.jsx";
import ProductGrid from "../Components/Store/ProductGrid.jsx";
import ProductModal from "../Components/Store/ProductModal.jsx";
import CartSummaryModal from "../Components/Store/CartSummaryModal.jsx";
import CartScreen from "../Components/Store/CartScreen.jsx";
import PromoModal from "../Components/Store/PromoModal.jsx";
import { useFavorites } from "../Components/Store/FavoritosContext.jsx";

const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;

// ✅ Helper para normalizar nombres
const normalizeString = (str) =>
  str?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-") || "";

function Food({ scrollContainerRef, selectedBusinessFromMap, 
  type = "comida" // ✅ NUEVO: tipo de productos/categorías
 }) { // 🔥 RECIBIR selectedBusinessFromMap
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [categoriesData, setCategoriesData] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cartItems")) || []
  );
  const [itemCount, setItemCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showCartScreen, setShowCartScreen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [productosConDescuento, setProductosConDescuento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refsReady, setRefsReady] = useState(false);
  const subcatRefs = useRef({});

  // 🔍 Cargar subcategorías desde el backend
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subcategories?type=${type}`);
        const result = await response.json();

        console.log("📦 Respuesta bruta de subcategorías:", result);

        const map = {};
        const categoriesInfo = [];

        result.data.forEach(cat => {
          if (!cat.categoryName || !cat.subcategories) return;

          const normalizedKey = normalizeString(cat.categoryName);
          
          map[normalizedKey] = cat.subcategories.map(sub => ({
            id: sub._id,
            name: sub.name,
            label: sub.name
          }));

          categoriesInfo.push({
            id: cat.categoryId,
            normalizedName: normalizedKey,
            originalName: cat.categoryName
          });
        });

        console.log("🗺️ subcategoriesMap generado:", map);
        console.log("📋 categoriesInfo generado:", categoriesInfo);
        
        setSubcategoriesMap(map);
        setCategoriesData(categoriesInfo);

        if (categoriesInfo.length > 0 && !activeCategory) {
          setActiveCategory(categoriesInfo[0].normalizedName);
        }
      } catch (error) {
        console.error("❌ Error al cargar subcategorías:", error);
      }
    };

    fetchSubcategories();
  }, [type]);

  // 🔍 Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);

        if (!response.ok) throw new Error("Error al cargar los productos");

        const data = await response.json();
        const productos = data.response || data;

        console.log("📦 Productos recibidos del backend:", productos);

        if (!Array.isArray(productos)) {
          throw new Error("Formato de datos inválido");
        }

        const processed = productos.map((p) => {
          const hasDiscount = Math.random() < 0.5;
          const discountPercentage = hasDiscount
            ? Math.floor(Math.random() * 21) + 10
            : 0;
          const discountedPrice = hasDiscount
            ? p.price * (1 - discountPercentage / 100)
            : p.price;

          return {
            ...p,
            id: p._id || p.id,
            hasDiscount,
            discountPercentage,
            discountedPrice,
            normalizedCategory: normalizeString(p.category)
          };
        });

        console.log("🧮 Productos procesados:", processed);

        setProductosConDescuento(processed);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 🔁 Crear refs dinámicas
  useEffect(() => {
    subcatRefs.current = {};
    setRefsReady(false);

    if (Array.isArray(subcategoriesMap[activeCategory])) {
      subcategoriesMap[activeCategory].forEach(({ id }) => {
        subcatRefs.current[id] = React.createRef();
      });
      setTimeout(() => setRefsReady(true), 0);
    }

    console.log("🎯 Categoría activa:", activeCategory);
    console.log("📍 Subcategorías disponibles:", subcategoriesMap[activeCategory]);
  }, [activeCategory, subcategoriesMap]);

  // ✅ Filtrado mejorado de productos
  const productosFiltrados = productosConDescuento.filter((p) => {
    const search = normalizeString(searchValue);
    return (
      normalizeString(p.name).includes(search) ||
      normalizeString(p.category).includes(search)
    );
  });

  // ✅ Establecer primera subcategoría al cambiar categoría
  useEffect(() => {
    const firstSubcat = subcategoriesMap[activeCategory]?.[0]?.id;
    if (firstSubcat) {
      console.log("🎯 Estableciendo primera subcategoría:", firstSubcat);
      setActiveSubcategory(firstSubcat);
    }
  }, [activeCategory, subcategoriesMap]);

  const handleSubcategoryClick = (subcatId) => {
    setActiveSubcategory(subcatId);
    const el = subcatRefs.current[subcatId]?.current;
    if (!el) return;
    const y = el.offsetTop - 80;
    
    // Scroll en el contenedor correcto
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({ top: y, behavior: "smooth" });
    } else {
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!refsReady) return;

    const handleScroll = () => {
      const categories = subcategoriesMap[activeCategory];
      if (!categories || !Array.isArray(categories)) return;

      const container = scrollContainerRef?.current;
      const scrollPos = container ? container.scrollTop + 80 : window.scrollY + 80;
      let closestSubcat = activeSubcategory;
      let minDistance = Infinity;

      categories.forEach(({ id }) => {
        const el = subcatRefs.current[id]?.current;
        if (!el) return;
        const distance = Math.abs(el.offsetTop - scrollPos);
        if (distance < minDistance) {
          minDistance = distance;
          closestSubcat = id;
        }
      });

      if (closestSubcat !== activeSubcategory)
        setActiveSubcategory(closestSubcat);
    };

    const container = scrollContainerRef?.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => container.removeEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [activeCategory, activeSubcategory, refsReady, subcategoriesMap, scrollContainerRef]);

  useEffect(() => {
    setItemCount(cartItems.reduce((acc, i) => acc + (i?.quantity || 0), 0));
    
    setTotalPrice(
      cartItems.reduce((acc, i) => {
        if (!i || !i.product) return acc;
        
        const price = i.product.discountedPrice || i.product.price || 0;
        const quantity = i.quantity || 0;
        
        return acc + (price * quantity);
      }, 0)
    );
  }, [cartItems]);

  // 🧩 Render principal
  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-red-600">
            <p className="text-xl mb-2">⚠️ Error al cargar productos</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : showCartScreen ? (
        <CartScreen
          cartItems={cartItems}
          onBack={() => setShowCartScreen(false)}
        />
      ) : (
        <>

        

          {/* 🔥 PASAR selectedBusinessFromMap */}
          <CategoryIcons
            activeCategory={activeCategory}
            setActiveCategory={(cat) => {
              console.log("🖱️ Categoría seleccionada:", cat);
              setActiveCategory(cat);
              
              if (scrollContainerRef?.current) {
                scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            cartItems={cartItems}
            isTienda={true}
            scrollContainerRef={scrollContainerRef}
            selectedBusinessFromMap={selectedBusinessFromMap} // 🔥 NUEVA PROP
             type={type} // ✅ PASAR EL TIPO
          />

          <HeroBannerTienda />

          <CategoryTabs
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
            onSubcategoryClick={handleSubcategoryClick}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            subcatRefs={subcatRefs}
            subcategoriesMap={subcategoriesMap}
          />

          {searchValue ? (
            productosFiltrados.length > 0 ? (
              <ProductGrid
                products={productosFiltrados}
                isTienda={true}
                onProductClick={setSelectedProduct}
                onToggleFavorite={toggleFavorite}
              />
            ) : (
              <div className="px-4 py-6 text-gray-500">
                No se encontraron productos.
              </div>
            )
          ) : (
            <div key={activeCategory}>
              {subcategoriesMap[activeCategory]?.map(({ id, name }) => {
                const productosSubcat = productosConDescuento.filter((p) => {
                  const matchCategory = p.normalizedCategory === activeCategory;
                  const matchSubcategory = normalizeString(p.subcategory || "") === normalizeString(name);

                  return matchCategory && matchSubcategory;
                });

                if (!productosSubcat.length) return null;

                return (
                  <div
                    key={id}
                    ref={subcatRefs.current[id]}
                    data-subcat={id}
                    className="mb-6"
                  >
                    <h2 className="text-xl font-bold text-gray-700 px-4 mt-6 mb-2">
                      {name}
                    </h2>
                    <ProductGrid
                      products={productosSubcat}
                      isTienda={true}
                      onProductClick={setSelectedProduct}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <ProductModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(product, quantity) => {
              setCartItems((prev) => {
                const productId = product.id || product._id;
                
                if (!productId) {
                  console.error('❌ Producto sin ID:', product);
                  return prev;
                }

                const idx = prev.findIndex((i) => {
                  const itemId = i.product?.id || i.product?._id;
                  return itemId === productId;
                });

                let updated = [...prev];
                
                if (idx >= 0) {
                  updated[idx] = {
                    ...updated[idx],
                    quantity: updated[idx].quantity + quantity,
                  };
                } else {
                  updated.push({ 
                    product: {
                      ...product,
                      id: productId,
                      image: product.image || ''
                    }, 
                    quantity 
                  });
                }

                localStorage.setItem("cartItems", JSON.stringify(updated));
                return updated;
              });
              setSelectedProduct(null);
            }}
            isFavorite={selectedProduct && favoriteIds.has(selectedProduct.id)}
            onToggleFavorite={() => toggleFavorite(selectedProduct)}
          />

          {itemCount > 0 && !selectedProduct && (
            <CartSummaryModal
              itemCount={itemCount}
              totalPrice={totalPrice}
              cartItems={cartItems}
              onViewCart={() => setShowCartScreen(true)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Food;