import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Store, ShoppingCart } from 'lucide-react';

const HeaderStore = () => {
    const navigate = useNavigate();
  
    return (
      <header className="px-5 py-7 rounded-b-3xl shadow-xl select-none bg-red-500 text-white">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-3xl font-extrabold tracking-wide">EN•CORTO</h1>
          <Search className="w-6 h-6 cursor-pointer hover:text-white/80 transition-colors" />
        </div>
  
        <div className="relative flex bg-white rounded-full overflow-hidden shadow-inner h-14">
          <div
            className="absolute top-0 h-full w-1/2 bg-red-100 rounded-full transition-transform duration-500 ease-in-out"
            style={{ transform: 'translateX(0%)' }}
          />
  
          <button
            onClick={() => navigate('/tienda')}
            className="flex-1 text-center font-medium flex items-center justify-center gap-2 text-red-700 z-10"
          >
            <Store className="w-5 h-5 animate-bounce" />
            Tienda
          </button>
  
          <button
            onClick={() => navigate('/despensa')}
            className="flex-1 text-center font-medium flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 z-10"
          >
            <ShoppingCart className="w-5 h-5" />
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
  
  export default HeaderStore;
  
