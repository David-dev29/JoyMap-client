import ProductCard from "./ProductCard.jsx";

const ProductGrid = ({ products, isTienda, onProductClick, onToggleFavorite }) => (
  <div className="px-4 py-4">
    <div className="flex flex-col gap-y-4 max-w-2xl mx-auto">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isTienda={isTienda}
          onProductClick={onProductClick}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  </div>
);

export default ProductGrid;






