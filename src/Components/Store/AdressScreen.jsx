import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronUp, ChevronDown, Plus,
  MapPin, User, Phone, Trash2, Check, Clock, Search, X
} from 'lucide-react';

export default function AddressScreen() {
  const [showData, setShowData] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Cargar datos del usuario y direcciones
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      setUserData(JSON.parse(stored));
    } else {
      navigate('/new-user-info', { replace: true });
    }

    const savedAddresses = localStorage.getItem('userAddresses');
    if (savedAddresses) {
      const parsed = JSON.parse(savedAddresses);
      setAddresses(parsed);
      if (parsed.length > 0) {
        setSelectedAddress(parsed[0].id);
      }
    }
  }, [navigate]);

  // ✅ Detectar ubicación automáticamente
  useEffect(() => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${import.meta.env.VITE_OPENCAGE_KEY}`
            );
            const data = await response.json();
            const result = data?.results?.[0]?.formatted;
            if (result) setNewAddress(result);
          } catch (error) {
            console.error('Error al obtener la dirección:', error);
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Error de geolocalización:', error);
          setLoadingLocation(false);
        }
      );
    }
  }, []);

  // ✅ Buscar direcciones con Radar API
  const handleSearchAddress = async () => {
    if (!newAddress.trim() || newAddress.length < 3) {
      alert('Por favor ingresa al menos 3 caracteres');
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://api.radar.io/v1/geocode/forward?query=${encodeURIComponent(newAddress)}&country=MX`,
        {
          headers: {
            'Authorization': import.meta.env.VITE_RADAR_KEY
          }
        }
      );
      const data = await response.json();
      
      if (data.addresses && data.addresses.length > 0) {
        setSearchResults(data.addresses);
      } else {
        setSearchResults([]);
        alert('No se encontraron direcciones coincidentes');
      }
    } catch (error) {
      console.error('Error al buscar dirección:', error);
      alert('Error al buscar direcciones');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/cart", { replace: true });
  };

  const handleAddAddress = () => {
    if (!newAddress.trim()) {
      alert('Por favor ingresa una dirección válida');
      return;
    }

    const address = {
      id: Date.now(),
      address: newAddress.trim(),
      createdAt: new Date().toLocaleDateString()
    };

    const updated = [...addresses, address];
    setAddresses(updated);
    localStorage.setItem('userAddresses', JSON.stringify(updated));
    setSelectedAddress(address.id);
    setNewAddress('');
    setSearchResults([]);
    setShowNewAddress(false);
  };

  const handleSelectFromSearch = (result) => {
    setNewAddress(result.formattedAddress);
    setSearchResults([]);
  };

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter(addr => addr.id !== id);
    setAddresses(updated);
    localStorage.setItem('userAddresses', JSON.stringify(updated));
    
    if (selectedAddress === id) {
      setSelectedAddress(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleConfirmAddress = () => {
    if (!selectedAddress) {
      alert('Por favor selecciona una dirección');
      return;
    }
    
    const selected = addresses.find(a => a.id === selectedAddress);
    localStorage.setItem('selectedAddress', JSON.stringify(selected));
    navigate("/deliveryOrder", { replace: true });
  };

  const maskText = (text, showFirst = 3, showLast = 2) => {
    if (!text || text.length <= showFirst + showLast) return text;
    const masked = '*'.repeat(text.length - showFirst - showLast);
    return text.substring(0, showFirst) + masked + text.substring(text.length - showLast);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen max-w-sm mx-auto pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center p-4">
          <button onClick={handleBack} className="hover:bg-gray-100 p-2 rounded-lg transition">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="ml-2 text-xl font-bold text-gray-900">Tu dirección de entrega</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Mis datos section */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
            onClick={() => setShowData(!showData)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-rose-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Información personal</h2>
            </div>
            {showData ? 
              <ChevronUp className="w-5 h-5 text-rose-600" /> : 
              <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </div>

          {showData && userData && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Nombre</span>
                    <p className="text-sm font-semibold text-gray-900">{maskText(userData.name, 4, 2)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/new-user-info')}
                  className="text-rose-600 text-xs font-bold hover:text-rose-700 transition"
                >
                  CAMBIAR
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</span>
                  <p className="text-sm font-semibold text-gray-900">{maskText(userData.phone, 3, 3)}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 mt-3 p-3 bg-blue-50 rounded-lg">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-blue-700 leading-relaxed">Tus datos están protegidos y cifrados</p>
              </div>
            </div>
          )}
        </div>

        {/* Direcciones guardadas */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-rose-600" />
            <span>Tus direcciones</span>
          </h2>

          {addresses.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm font-medium">No tienes direcciones guardadas</p>
              <p className="text-gray-500 text-xs mt-1">Agrega una para empezar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedAddress === addr.id
                      ? 'border-rose-600 bg-rose-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mt-1 flex-shrink-0 ${
                        selectedAddress === addr.id 
                          ? 'bg-rose-600' 
                          : 'bg-gray-100'
                      }`}>
                        {selectedAddress === addr.id ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <MapPin className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 break-words">{addr.address}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{addr.createdAt}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(addr.id);
                      }}
                      className="ml-2 p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agregar nueva dirección */}
        {!showNewAddress ? (
          <button
            onClick={() => setShowNewAddress(true)}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 border border-gray-200"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar nueva dirección</span>
          </button>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Nueva dirección</h3>
              <button
                onClick={() => {
                  setShowNewAddress(false);
                  setNewAddress('');
                  setSearchResults([]);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Dirección</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Ej: Calle Principal 123"
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-600 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                />
                <button
                  onClick={handleSearchAddress}
                  disabled={searchLoading || newAddress.trim().length < 3}
                  className="px-4 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center justify-center"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              {loadingLocation && (
                <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>Detectando ubicación...</span>
                </p>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Resultados encontrados ({searchResults.length})
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectFromSearch(result)}
                      className="w-full p-3 text-left bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-300 rounded-lg transition group"
                    >
                      <p className="text-sm font-medium text-gray-900 group-hover:text-rose-700">
                        {result.formattedAddress}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3 border-t pt-4">
              <button
                onClick={() => {
                  setShowNewAddress(false);
                  setNewAddress('');
                  setSearchResults([]);
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAddress}
                disabled={!newAddress.trim()}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition active:scale-95"
              >
                Guardar dirección
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-sm mx-auto">
          <button
            onClick={handleConfirmAddress}
            disabled={!selectedAddress}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all active:scale-95 shadow-md"
          >
            Confirmar dirección
          </button>
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
}