import React, { useState } from 'react';
import { ChevronLeft, User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AddUserInfo() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!name.trim() || !phone.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (phone.length < 10) {
      alert('El teléfono debe tener al menos 10 dígitos');
      return;
    }

    setLoading(true);

    try {
      // ✅ Crear usuario en el backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Guardar usuario en localStorage (incluye el ID)
        const userData = {
          id: result.user._id,
          name: result.user.name,
          phone: result.user.phone
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        console.log('✅ Usuario guardado:', userData);
        
        // Regresar a la pantalla de dirección
        navigate('/address', { replace: true });
      } else {
        throw new Error(result.message || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error al guardar datos:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen max-w-sm mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-100">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="ml-4 text-lg font-bold text-gray-900">
          Agrega tu nombre y teléfono
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Nombre */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre:
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribe tu nombre completo"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              maxLength={50}
            />
          </div>
        </div>

        {/* Teléfono */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <div className="flex space-x-2">
            {/* Código de país */}
            <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg px-3 py-3">
              <span className="text-2xl mr-2">🇲🇽</span>
              <span className="text-sm font-medium text-gray-700">+52</span>
            </div>

            {/* Input de teléfono */}
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setPhone(value);
                }}
                placeholder="2221234567"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={10}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            10 dígitos sin espacios ni guiones
          </p>
        </div>
      </div>

      {/* Botón fijo abajo */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleConfirm}
          disabled={loading || !name.trim() || !phone.trim()}
          className={`w-full py-4 rounded-lg font-medium transition-all ${
            loading || !name.trim() || !phone.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
          }`}
        >
          {loading ? 'Guardando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
}