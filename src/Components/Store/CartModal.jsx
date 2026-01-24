import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function CartModal({ onClose, onGoToCart }) {
  useEffect(() => {
    // Bloquear scroll al abrir modal
    document.body.style.overflow = 'hidden';

    // Restaurar scroll al desmontar modal
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-sm w-full mx-4 relative shadow-lg">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Contenido del modal */}
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-tight">
            ¿Seguro que quieres<br />volver al carrito?
          </h2>
          
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Se perderá toda la información<br />rellenada.
          </p>

          {/* Botones */}
          <div className="space-y-3">
            <button
              onClick={onGoToCart}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
            >
              Ir al carrito
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


