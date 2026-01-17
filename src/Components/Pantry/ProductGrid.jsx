// ./Components/Pantry/ProductGrid.jsx
import ProductCard from "./ProductCard.jsx";

const ProductGrid = ({ products, isTienda }) => (
  <div className="px-4 py-4">
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} isTienda={isTienda} />
      ))}
    </div>
  </div>
);

export default ProductGrid;

