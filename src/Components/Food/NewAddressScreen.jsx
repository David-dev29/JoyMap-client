import React, { useState } from 'react';
import { ArrowLeft, MapPin, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewAddressScreen = () => {
  const [address, setAddress] = useState('');

  

  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  

  const handleSelectOnMap = () => {
    console.log('Seleccionar en el mapa');
  };

  const handleConfirm = () => {
    console.log('Confirmar dirección:', address);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header estandarizado */}
      <header className="sticky top-0 z-50 bg-white px-4 h-14 flex items-center gap-3 border-b border-gray-100 shadow-sm">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Nueva dirección</h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {/* Title */}
        <h2 className="text-base font-medium text-gray-900 mb-6">
          Ingresar dirección completa
        </h2>

        {/* Address Input */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Escribe aquí"
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-sm text-rose-700 mb-6 leading-relaxed">
          Incluye el número de tu casa o edificio para encontrar tu dirección.
        </p>

        {/* Map Selection Option */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-3">¿No encuentras tu ubicación?</p>
          <button
            onClick={handleSelectOnMap}
            className="flex items-center space-x-3 text-rose-700 hover:text-rose-800 transition-colors group"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <Map size={20} className="group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-base font-medium">Seleccionar en el mapa</span>
            <div className="ml-auto">
              <svg 
                className="w-5 h-5 text-rose-700" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="px-4 pb-6 pt-4">
        <button
          onClick={handleConfirm}
          disabled={!address.trim()}
          className={`w-full py-4 rounded-lg text-base font-semibold transition-colors ${
            address.trim()
              ? 'bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Confirmar dirección
        </button>
      </div>
    </div>
  );
};
 export default NewAddressScreen
