import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

const ProductCard = ({ product, isTienda, onProductClick }) => {
  const buttonColorClass = isTienda
    ? "bg-primary-600 hover:bg-primary-700"
    : "bg-green-600 hover:bg-green-700";

  const { hasDiscount, discountPercentage } = product;
  const [showQualityTag, setShowQualityTag] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setShowQualityTag(
      ["Frutas", "Verduras"].includes(product.subcategory) && Math.random() < 0.5
    );
  }, [product.subcategory]);

  const handleRowClick = () => {
    onProductClick(product);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    onProductClick(product);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // SVG Placeholder bonito
  const ImagePlaceholder = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
      <svg class="w-6 h-6 text-gray-800 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">

<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 2.66667-1 2.66666 1L12 11l2.6667 1 2.6666-1L20 12m-1 5H5v1c0 1.1046.89543 2 2 2h10c1.1046 0 2-.8954 2-2v-1ZM5 9.00003h14v-1c0-2.20914-1.7909-4-4-4H9c-2.20914 0-4 1.79086-4 4v1ZM18.5 14h-13c-.82843 0-1.5.6716-1.5 1.5 0 .8285.67157 1.5 1.5 1.5h13c.8284 0 1.5-.6715 1.5-1.5 0-.8284-.6716-1.5-1.5-1.5Z"/>

</svg>
    </div>
  );

  return (
    <div
      onClick={handleRowClick}
      className="flex items-start py-4 border-b border-gray-200 cursor-pointer select-none hover:bg-gray-50 transition"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleRowClick();
        }
      }}
      aria-label={`Seleccionar ${product.name}`}
    >
      {/* Imagen con etiquetas */}
      <div className="relative flex-shrink-0 w-20 h-28">
        {!product.image || imageError ? (
          <ImagePlaceholder />
        ) : (
          <img
          src={
            product.image.startsWith("http")
              ? product.image
              : `https://${product.image}`
          }
          alt={product.name}
          className="w-full h-full object-contain rounded-xl"
          loading="lazy"
          onError={handleImageError}
        />
        
        )}

        {/* Etiqueta descuento */}
        {hasDiscount && (
          <div className="absolute top-0 -left-2 bg-primary-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-r-lg shadow whitespace-nowrap">
            -{discountPercentage}%
          </div>
        )}

        {/* Etiqueta Garantía de frescura */}
        {showQualityTag && (
          <div
            className="absolute bottom-2 right-[-8px] bg-green-500 text-white text-[8px] font-bold px-1.5 py-[1px] rounded-sm-full shadow whitespace-nowrap"
            style={{
              width: "fit-content",
              zIndex: 0
            }}
          >
            Garantía de frescura
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-col justify-between flex-1 h-28 mx-3 pr-2">
        <div className="flex-1 overflow-hidden">
          <h3
            className="text-base font-bold text-gray-800 leading-snug line-clamp-2 mb-1"
            title={product.name}
          >
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Precio */}
          <span className="text-lg font-bold text-gray-900">
            MXN ${product.price.toFixed(2)}
          </span>

          {/* Botón agregar */}
          <button
            aria-label={`Agregar ${product.name}`}
            onClick={handleButtonClick}
            type="button"
            className={`${buttonColorClass} w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${isTienda ? "primary-500" : "green-500"}`}
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