import { Search, MapPin, Store, ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import logo from '../../assets/ENCORTO3.png'

const HeaderPantry = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (section) => {
    if (section === 'Tienda') {
      navigate('/tienda');
    } else if (section === 'Despensa') {
      navigate('/despensa');
    }
  };

  // Determina cuál pestaña está activa
  const isTienda = location.pathname === '/tienda';
  const isDespensa = location.pathname === '/despensa';

  return (
    <header className="px-5 py-7 rounded-b-3xl shadow-xl select-none bg-green-600 text-white">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
                <img src={logo} alt="ENCORTO" className="w-40 sm:w-48 object-contain" />
              </div>
        <Search className="w-6 h-6 cursor-pointer hover:text-white/80 transition-colors" />
      </div>

      <div className="relative flex bg-white rounded-full overflow-hidden shadow-inner h-14">
        {/* Barra animada que se mueve según la pestaña activa */}
        <div
          className="absolute top-0 h-full w-1/2 bg-green-100 rounded-full transition-transform duration-500 ease-in-out"
          style={{ transform: isTienda ? 'translateX(0%)' : 'translateX(100%)' }}
        />

        <button
          onClick={() => handleNavigate('Tienda')}
          className={`flex-1 text-center font-medium flex items-center justify-center gap-2 z-10 ${
            isTienda ? 'text-green-600' : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <Store className={`w-5 h-5 ${isTienda ? 'animate-bounce' : ''}`} />
          Tienda
        </button>

        <button
          onClick={() => handleNavigate('Despensa')}
          className={`flex-1 text-center font-medium flex items-center justify-center gap-2 z-10 ${
            isDespensa ? 'text-green-600' : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <ShoppingCart className={`w-5 h-5 ${isDespensa ? 'animate-bounce' : ''}`} />
          Despensa
        </button>
      </div>

      <div className="flex items-center gap-2 mt-5 text-white text-sm">
        <MapPin className="w-4 h-4" />
        <span>Calle Ignacio Allende, 512</span>
      </div>
    </header>
  );
};

export default HeaderPantry;

