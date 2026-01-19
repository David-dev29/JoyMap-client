import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronRight, ChevronDown, TruckElectric } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CartModal from './CartModal';

export default function DeliveryOrder() {
  const navigate = useNavigate();

  const [selectedTip, setSelectedTip] = useState('MXN 5');
  const [showMyData, setShowMyData] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [comment, setComment] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Cargar datos del carrito y usuario
  const [cartItems, setCartItems] = useState([]);
  const [userData, setUserData] = useState(null);
  const [userAddress, setUserAddress] = useState('');

  const dropdownRef = useRef(null);

  const tipOptions = [
    { label: 'No, gracias', value: 'none' },
    { label: 'MXN 5', value: 'MXN 5' },
    { label: 'MXN 10', value: 'MXN 10' },
    { label: 'MXN Otro', value: 'other' }
  ];

  const paymentOptions = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Tarjeta', value: 'card' },
    { label: 'Transferencia', value: 'transfer' },
  ];

  // ✅ Cargar datos al montar
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    const storedAddress = localStorage.getItem('userAddress');
    if (storedAddress) {
      setUserAddress(storedAddress);
    }
  }, []);

  // ✅ Calcular totales
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.price || 0;
    const quantity = item.quantity || 0;
    return acc + (price * quantity);
  }, 0);

  const deliveryFee = 15;
  
  const getTipAmount = () => {
    if (selectedTip === 'none') return 0;
    if (selectedTip === 'MXN 5') return 5;
    if (selectedTip === 'MXN 10') return 10;
    return 0; // Para "other" necesitarías un input adicional
  };

  const total = subtotal + deliveryFee + getTipAmount();

  // ✅ Crear orden
  const handleConfirmAddress = async () => {
    if (!userData) {
      alert('Por favor agrega tus datos primero');
      navigate('/new-user-info');
      return;
    }

    if (!selectedPayment) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    if (cartItems.length === 0) {
      alert('Tu carrito está vacío');
      navigate('/cart');
      return;
    }

    setLoading(true);

    try {
      const orderItems = cartItems.map(item => ({
        productId: item.product.id || item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      const orderData = {
        customerId: userData.id, // ✅ Ahora envías el ID del usuario
  customer: {
    name: userData.name,
    phone: userData.phone
  },
        items: orderItems,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        tip: getTipAmount(),
        total: total,
        deliveryAddress: {
          street: userAddress || 'Dirección no especificada',
          reference: comment || '',
          coordinates: []
        },
        paymentMethod: selectedPayment,
        paymentStatus: 'pending',
        notes: comment,
        coupon: coupon || null
      };

      console.log('📦 Creando orden:', orderData);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Orden creada:', result);
        localStorage.removeItem('cartItems');
        navigate("/deliveryScreen", { replace: true });
      } else {
        throw new Error(result.message || 'Error al crear la orden');
      }
    } catch (error) {
      console.error('❌ Error creando orden:', error);
      alert(`Error al crear la orden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCart = () => {
    navigate("/cart", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPaymentOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white text-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TruckElectric className='w-6 h-6' />
          <span className="text-lg font-medium">A domicilio</span>
        </div>
        <button onClick={() => setIsCartModalOpen(true)}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Order Summary */}
        <div
          className="bg-blue-50 rounded-lg p-4 cursor-pointer"
          onClick={() => navigate("/accountSummary", { replace: true })}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Resumen de cuenta</h2>
              <p className="text-gray-600">
                {cartItems.length} producto(s) <span className="font-semibold">MXN {total.toFixed(2)}</span>
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* My Data Section */}
        <div>
          <button 
            onClick={() => setShowMyData(!showMyData)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="font-semibold text-gray-900">Mis datos</h2>
            <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${showMyData ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Comment Section */}
        <div>
          <textarea
            placeholder="Agregar comentario (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Coupon Section */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Cupón</h3>
          <input
            type="text"
            placeholder="Ingresar cupón"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tip Section */}
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Propina - Gracias al repartidor tu pedido llega a tiempo
          </p>
          <div className="flex gap-1">
            {tipOptions.map((option) =>
              option.value !== 'other' ? (
                <button
                  key={option.value}
                  onClick={() => setSelectedTip(option.value)}
                  className={`px-2 py-1 min-w-[70px] rounded-lg border text-[11px] font-medium transition-colors ${
                    selectedTip === option.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {option.label}
                </button>
              ) : (
                <div
                  key={option.value}
                  className={`flex items-center rounded-lg border text-[11px] font-medium transition-colors px-2 min-w-[90px] ${
                    selectedTip === 'other'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="mr-1 text-[11px]">MXN</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Otro"
                    className="w-12 p-0.5 outline-none bg-transparent text-[11px]"
                    onFocus={() => setSelectedTip('other')}
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Payment Method Custom Dropdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-gray-900">Método de pago</span>
            <span className="text-xs text-gray-600">El pago se coordina luego</span>
          </div>

          <div className="relative">
            <button
              type="button"
              className="w-full p-2 border border-gray-300 rounded-lg flex justify-between items-center bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onClick={() => setIsPaymentOpen(!isPaymentOpen)}
            >
              {selectedPayment
                ? paymentOptions.find((opt) => opt.value === selectedPayment)?.label
                : 'Seleccione'}
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isPaymentOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown en flujo normal, empuja el contenido */}
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isPaymentOpen ? 'max-h-40 mt-2' : 'max-h-0 mt-0'
              } border border-gray-300 rounded-lg bg-white`}
            >
              {paymentOptions.map((option) => (
                <button
                  key={option.value}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm"
                  onClick={() => {
                    setSelectedPayment(option.value);
                    setIsPaymentOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-sm mx-auto">
          <button 
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
            } text-white`}
            onClick={handleConfirmAddress}
            disabled={loading}
          >
            {loading ? 'Procesando...' : `Pedir (MXN ${total.toFixed(2)})`}
          </button>
        </div>
      </div>

      {/* Modal */}
      {isCartModalOpen && (
        <CartModal 
          onClose={() => setIsCartModalOpen(false)}
          onGoToCart={handleGoToCart} 
        />
      )}

      <div className="h-20"></div>
    </div>
  );
}