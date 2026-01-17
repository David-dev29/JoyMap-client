import { Plus } from "lucide-react";

const ProductCardDespensa = ({ product }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col">
        <div className="w-full h-32 md:h-40 lg:h-48">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3 md:p-4 flex flex-col flex-grow">
          <h3 className="text-sm md:text-base font-medium text-gray-800 mb-1">
            {product.name}
          </h3>
          {product.badge && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-block">
              {product.badge}
            </span>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-base md:text-lg font-bold text-gray-900">
              $ {product.price}
            </span>
            <button className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardDespensa;


