import { Plus } from "lucide-react";

const ProductCard = ({ product, isTienda, onProductClick }) => {
  const buttonColorClass = isTienda
    ? "bg-[#D32F2F] hover:bg-[#C62828]"
    : "bg-green-600 hover:bg-green-700";

  const handleRowClick = () => {
    onProductClick(product);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    onProductClick(product);
  };

  const { hasDiscount, discountPercentage, discountedPrice } = product;
  const priceToShow = discountedPrice ?? product.price;

  return (
    <div
      onClick={handleRowClick}
      className="flex items-start justify-between py-3 border-b border-gray-200 cursor-pointer select-none hover:bg-gray-50 transition"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleRowClick();
        }
      }}
      aria-label={`Seleccionar ${product.name}`}
    >
      {/* Imagen cuadrada */}
      <div className="flex-shrink-0 w-20 h-20">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col justify-between mx-2 overflow-hidden flex-1">
        <h3
          className="text-sm font-semibold text-gray-700 truncate leading-tight"
          title={product.name}
        >
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Precio y botón */}
        <div className="mt-1 text-sm font-semibold text-gray-900 flex items-center gap-2 flex-wrap justify-between">
          <div className="flex items-center gap-1">
            MXN ${priceToShow.toFixed(2)}
            {hasDiscount && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-[#E53935] text-white font-bold">
                  -{discountPercentage}%
                </span>
              </>
            )}
          </div>

          <button
            aria-label={`Agregar ${product.name}`}
            className={`${buttonColorClass} w-9 h-9 rounded-lg flex items-center justify-center transition-colors shadow-sm hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isTienda ? "focus:ring-[#E53935]" : "focus:ring-green-500"}`}
            onClick={handleButtonClick}
            type="button"
          >
            <Plus
              className="w-4 h-4 text-white"
              strokeWidth={3}
              style={{ fill: "white" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;





