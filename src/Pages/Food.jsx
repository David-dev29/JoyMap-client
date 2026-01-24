import React, { useState, useEffect, useRef, useMemo } from "react";
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

  // Carrito
  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cartItems")) || []
  );
  const [itemCount, setItemCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Favoritos
  const { favoriteIds, toggleFavorite } = useFavorites();

  // Refs
  const categoryRefs = useRef({});

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

        // Endpoint por negocio con productos incluidos
        const response = await fetch(
          `${API_URL}/api/product-categories/business/${businessId}?populate=products`
        );

        if (!response.ok) {
          throw new Error("Error al cargar el menú");
        }

        const data = await response.json();

        // Soportar múltiples formatos de respuesta
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
            // Agregar descuentos aleatorios para demo
            hasDiscount: Math.random() < 0.3,
            discountPercentage: Math.floor(Math.random() * 21) + 10,
            get discountedPrice() {
              return this.hasDiscount
                ? this.price * (1 - this.discountPercentage / 100)
                : this.price;
            }
          }))
        }));

        // Filtrar categorías sin productos
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

        // Aplanar todos los productos
        const allProds = categoriesWithProducts.flatMap(cat => cat.products);
        setAllProducts(allProds);

        // Establecer primera categoría como activa
        if (categoriesWithProducts.length > 0 && !activeCategory) {
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

  // Crear refs para las categorías
  useEffect(() => {
    categoryRefs.current = {};
    categories.forEach(cat => {
      categoryRefs.current[cat.id] = React.createRef();
    });
  }, [categories]);

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

  // Productos de la categoría activa
  const productosCategoria = useMemo(() => {
    if (!activeCategory) return [];
    const category = categories.find(c => c.id === activeCategory);
    return category?.products || [];
  }, [categories, activeCategory]);

  // Manejar click en categoría
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);

    const el = categoryRefs.current[categoryId]?.current;
    if (el) {
      const y = el.offsetTop - 80;
      if (scrollContainerRef?.current) {
        scrollContainerRef.current.scrollTo({ top: y, behavior: "smooth" });
      } else {
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

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
            businessId: businessId // Incluir businessId del negocio actual
          },
          quantity,
          businessId: businessId // También a nivel de item para fácil acceso
        });
      }

      localStorage.setItem("cartItems", JSON.stringify(updated));
      return updated;
    });
    setSelectedProduct(null);
  };

  // Construir subcategoriesMap para CategoryTabs (compatibilidad)
  const subcategoriesMap = useMemo(() => {
    const map = {};
    categories.forEach(cat => {
      map[cat.slug] = [{
        id: cat.id,
        name: cat.name,
        label: cat.name
      }];
    });
    return map;
  }, [categories]);

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
        // Productos por categoría
        <div className="pb-24">
          {categories.map(category => (
            <div
              key={category.id}
              ref={categoryRefs.current[category.id]}
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
