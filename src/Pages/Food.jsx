import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import HeroBannerTienda from "../Components/Store/HeroBanner.jsx";
import CategoryIcons from "../Components/Store/ProfileBusiness.jsx";
import CategoryTabs from "../Components/Store/CategoryTabs.jsx";
import ProductGrid from "../Components/Store/ProductGrid.jsx";
import ProductModal from "../Components/Store/ProductModal.jsx";
import CartSummaryModal from "../Components/Store/CartSummaryModal.jsx";
import CartScreen from "../Components/Store/CartScreen.jsx";
import { useFavorites } from "../context/FavoritesContext";

const API_URL = import.meta.env.VITE_API_URL;

// Helper para normalizar nombres
const normalizeString = (str) =>
  str?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-") || "";

function Food({
  scrollContainerRef,
  selectedBusinessFromMap,
  type = "comida"
}) {
  // Estado de categorías y productos
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  // Estado de UI
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCartScreen, setShowCartScreen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noMenu, setNoMenu] = useState(false);

  // Estado para evitar conflicto entre click y scroll spy
  const [isScrollingByClick, setIsScrollingByClick] = useState(false);

  // Carrito
  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cartItems")) || []
  );
  const [itemCount, setItemCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Favoritos
  const { favoriteIds, toggleFavorite } = useFavorites();

  // Refs para las secciones de categorías (para scroll spy)
  const sectionRefs = useRef({});

  // Obtener businessId del negocio seleccionado
  const businessId = selectedBusinessFromMap?.id;

  // Cargar categorías y productos del negocio
  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      setNoMenu(true);
      return;
    }

    const fetchBusinessMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        setNoMenu(false);

        const response = await fetch(
          `${API_URL}/api/product-categories/business/${businessId}?populate=products`
        );

        if (!response.ok) {
          throw new Error("Error al cargar el menú");
        }

        const data = await response.json();
        const categoriesData = data.categories || data.response || data.data || [];

        if (!Array.isArray(categoriesData) || categoriesData.length === 0) {
          setNoMenu(true);
          setCategories([]);
          setAllProducts([]);
          setLoading(false);
          return;
        }

        // Procesar categorías
        const processedCategories = categoriesData.map(cat => ({
          id: cat._id,
          name: cat.name,
          slug: normalizeString(cat.name),
          products: (cat.products || []).map(p => ({
            ...p,
            id: p._id || p.id,
            categoryId: cat._id,
            categoryName: cat.name,
            normalizedCategory: normalizeString(cat.name),
            hasDiscount: Math.random() < 0.3,
            discountPercentage: Math.floor(Math.random() * 21) + 10,
            get discountedPrice() {
              return this.hasDiscount
                ? this.price * (1 - this.discountPercentage / 100)
                : this.price;
            }
          }))
        }));

        const categoriesWithProducts = processedCategories.filter(
          cat => cat.products.length > 0
        );

        if (categoriesWithProducts.length === 0) {
          setNoMenu(true);
          setCategories([]);
          setAllProducts([]);
          setLoading(false);
          return;
        }

        setCategories(categoriesWithProducts);

        const allProds = categoriesWithProducts.flatMap(cat => cat.products);
        setAllProducts(allProds);

        // Establecer primera categoría como activa
        if (categoriesWithProducts.length > 0) {
          setActiveCategory(categoriesWithProducts[0].id);
        }

      } catch (err) {
        console.error("Error fetching business menu:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessMenu();
  }, [businessId]);

  // ════════════════════════════════════════════════════════════════════════
  // SCROLL SPY - Detectar categoría visible al hacer scroll manual
  // ════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (categories.length === 0 || searchValue) return;

    const observerOptions = {
      root: scrollContainerRef?.current || null,
      rootMargin: '-20% 0px -60% 0px', // Detectar cuando está en la parte superior
      threshold: 0
    };

    const observerCallback = (entries) => {
      // Solo actualizar si no estamos haciendo scroll por click
      if (isScrollingByClick) return;

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.getAttribute('data-category-id');
          if (categoryId && categoryId !== activeCategory) {
            setActiveCategory(categoryId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar cada sección
    Object.entries(sectionRefs.current).forEach(([id, el]) => {
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [categories, isScrollingByClick, searchValue, scrollContainerRef]);

  // ════════════════════════════════════════════════════════════════════════
  // CLICK EN CATEGORÍA - Scroll inmediato a la sección
  // ════════════════════════════════════════════════════════════════════════
  const handleCategoryClick = useCallback((categoryId) => {
    // Marcar que estamos haciendo scroll por click
    setIsScrollingByClick(true);

    // Actualizar categoría activa inmediatamente
    setActiveCategory(categoryId);

    // Hacer scroll a la sección
    const section = sectionRefs.current[categoryId];
    if (section) {
      const scrollContainer = scrollContainerRef?.current;

      if (scrollContainer) {
        // Calcular posición dentro del contenedor
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const sectionTop = section.getBoundingClientRect().top;
        const offset = sectionTop - containerTop + scrollContainer.scrollTop - 80;

        scrollContainer.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      } else {
        // Scroll en window
        const yOffset = -80;
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }

    // Re-activar scroll spy después de que termine el scroll
    setTimeout(() => {
      setIsScrollingByClick(false);
    }, 800);
  }, [scrollContainerRef]);

  // Productos filtrados por búsqueda
  const productosFiltrados = useMemo(() => {
    if (!searchValue) return allProducts;

    const search = normalizeString(searchValue);
    return allProducts.filter(p =>
      normalizeString(p.name).includes(search) ||
      normalizeString(p.categoryName).includes(search) ||
      normalizeString(p.description || "").includes(search)
    );
  }, [allProducts, searchValue]);

  // Actualizar contadores del carrito
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

  // Agregar producto al carrito
  const handleAddToCart = (product, quantity) => {
    setCartItems((prev) => {
      const productId = product.id || product._id;

      if (!productId) {
        console.error('Producto sin ID:', product);
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
            image: product.image || '',
            businessId: businessId
          },
          quantity,
          businessId: businessId
        });
      }

      localStorage.setItem("cartItems", JSON.stringify(updated));
      return updated;
    });
    setSelectedProduct(null);
  };

  // Render principal
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53935] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-red-600">
          <p className="text-xl mb-2">Error al cargar el menú</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#D32F2F]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (noMenu || categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-xl font-medium text-gray-700 mb-2">
            Este negocio aún no tiene productos
          </p>
          <p className="text-gray-500">
            El menú estará disponible pronto
          </p>
        </div>
      </div>
    );
  }

  if (showCartScreen) {
    return (
      <CartScreen
        cartItems={cartItems}
        onBack={() => setShowCartScreen(false)}
      />
    );
  }

  return (
    <div>
      {/* Header con info del negocio */}
      <CategoryIcons
        activeCategory={activeCategory}
        setActiveCategory={handleCategoryClick}
        cartItems={cartItems}
        isTienda={true}
        scrollContainerRef={scrollContainerRef}
        selectedBusinessFromMap={selectedBusinessFromMap}
        type={type}
        categories={categories}
      />

      <HeroBannerTienda business={selectedBusinessFromMap} />

      {/* Tabs de categorías */}
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />

      {/* Productos */}
      {searchValue ? (
        // Resultados de búsqueda
        productosFiltrados.length > 0 ? (
          <ProductGrid
            products={productosFiltrados}
            isTienda={true}
            onProductClick={setSelectedProduct}
            onToggleFavorite={toggleFavorite}
          />
        ) : (
          <div className="px-4 py-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">No se encontraron productos para "{searchValue}"</p>
          </div>
        )
      ) : (
        // Productos por categoría con refs para scroll spy
        <div className="pb-24">
          {categories.map(category => (
            <div
              key={category.id}
              ref={el => sectionRefs.current[category.id] = el}
              data-category-id={category.id}
              id={`category-section-${category.id}`}
              className="mb-6"
            >
              <h2 className="text-xl font-bold text-gray-700 px-4 mt-6 mb-2">
                {category.name}
              </h2>
              {category.products.length > 0 ? (
                <ProductGrid
                  products={category.products}
                  isTienda={true}
                  onProductClick={setSelectedProduct}
                  onToggleFavorite={toggleFavorite}
                />
              ) : (
                <div className="px-4 py-4 text-gray-400 text-sm">
                  No hay productos en esta categoría
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de producto */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isFavorite={selectedProduct && favoriteIds.has(selectedProduct.id)}
        onToggleFavorite={() => toggleFavorite(selectedProduct)}
      />

      {/* Resumen del carrito */}
      {itemCount > 0 && !selectedProduct && (
        <CartSummaryModal
          itemCount={itemCount}
          totalPrice={totalPrice}
          cartItems={cartItems}
          onViewCart={() => setShowCartScreen(true)}
        />
      )}
    </div>
  );
}

export default Food;
