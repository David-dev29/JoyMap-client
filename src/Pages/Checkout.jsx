import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { useAddresses } from '../hooks/useAddresses';
import { createOrder } from '../services/orderService';
import { PAYMENT_METHODS, DELIVERY_FEE } from '../constants';

// Helper para normalizar URLs de imágenes
const normalizeImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Si tiene dominio pero no protocolo
  if (url.includes('cloudfront.net') || url.includes('amazonaws.com') || url.includes('.com/')) {
    return `https://${url}`;
  }
  return url;
};

// Sección colapsable reutilizable
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false, badge }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-orange-500" />}
          <span className="font-semibold text-gray-900">{title}</span>
          {badge && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, quickRegister } = useAuth();
  const { items: cartItems, removeItem, updateQuantity, clearCart, subtotal, isEmpty } = useCart();
  const {
    addresses,
    selectedAddress,
    selectAddress,
    addAddress,
    removeAddress,
    search,
    searchResults,
    searchLoading,
    clearSearch
  } = useAddresses();

  // Estados del formulario
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedTip, setSelectedTip] = useState(5);
  const [customTip, setCustomTip] = useState('');
  const [comment, setComment] = useState('');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado para nueva dirección
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddressQuery, setNewAddressQuery] = useState('');

  // Pre-llenar datos si está autenticado
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Cálculos
  const tipAmount = useMemo(() => {
    if (customTip && !isNaN(parseFloat(customTip))) {
      return parseFloat(customTip);
    }
    return selectedTip;
  }, [selectedTip, customTip]);

  const total = subtotal + DELIVERY_FEE + tipAmount;

  // Buscar direcciones
  const handleAddressSearch = async () => {
    if (newAddressQuery.length >= 3) {
      await search(newAddressQuery);
    }
  };

  // Seleccionar dirección de búsqueda
  const handleSelectSearchResult = (result) => {
    const newAddr = addAddress({
      street: result.formatted,
      coordinates: result.coordinates
    });
    selectAddress(newAddr.street);
    setShowNewAddress(false);
    setNewAddressQuery('');
    clearSearch();
  };

  // Confirmar pedido
  const handleConfirmOrder = async () => {
    // Validaciones
    if (!name.trim() || !phone.trim()) {
      alert('Por favor completa tus datos (nombre y teléfono)');
      return;
    }

    if (phone.length < 10) {
      alert('El teléfono debe tener al menos 10 dígitos');
      return;
    }

    if (!selectedAddress && addresses.length === 0) {
      alert('Por favor agrega una dirección de entrega');
      return;
    }

    if (!selectedPayment) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    if (isEmpty) {
      alert('Tu carrito está vacío');
      navigate('/cart');
      return;
    }

    setLoading(true);

    try {
      let currentUser = user;
      let authToken = null;

      // Si no está autenticado, registrar primero
      if (!isAuthenticated) {
        const registerResult = await quickRegister(name.trim(), phone.trim(), selectedAddress);

        if (!registerResult.success) {
          throw new Error(registerResult.error || 'Error al registrar usuario');
        }

        currentUser = registerResult.user;
        authToken = registerResult.token; // Obtener token directamente del registro
      }

      // Preparar datos de la orden
      const orderItems = cartItems.map(item => ({
        productId: item.product.id || item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      // Obtener businessId del carrito (todos los items son del mismo negocio)
      const businessId = cartItems[0]?.businessId || cartItems[0]?.product?.businessId;

      if (!businessId) {
        throw new Error('No se pudo identificar el negocio. Por favor, vuelve a agregar los productos.');
      }

      const orderData = {
        businessId: businessId,
        customerId: currentUser._id,
        customer: {
          name: currentUser.name || name,
          phone: currentUser.phone || phone
        },
        items: orderItems,
        subtotal: subtotal,
        deliveryFee: DELIVERY_FEE,
        tip: tipAmount,
        total: total,
        deliveryAddress: {
          street: selectedAddress || addresses[0]?.street || 'Dirección no especificada',
          reference: comment || '',
          coordinates: []
        },
        paymentMethod: selectedPayment,
        paymentStatus: 'pending',
        notes: comment,
        coupon: coupon || null
      };

      // Pasar el token directamente si se acaba de registrar
      const result = await createOrder(orderData, authToken);

      clearCart();
      navigate('/deliveryScreen', { replace: true });

    } catch (error) {
      console.error('❌ Error creando orden:', error);
      alert(`Error al crear la orden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Si el carrito está vacío
  if (isEmpty) {
    return (
      <div className="bg-gray-50 min-h-screen max-w-sm mx-auto flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 text-center mb-6">
          Agrega productos para continuar
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          Explorar productos
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen max-w-sm mx-auto pb-32">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 flex items-center p-4 border-b border-gray-100">
        <button onClick={() => navigate('/cart')}>
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="ml-4 text-lg font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 1. RESUMEN DE PRODUCTOS */}
        <CollapsibleSection
          title="Resumen de productos"
          icon={ShoppingBag}
          badge={`${cartItems.length} items`}
          defaultOpen={false}
        >
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.product.id || item.product._id} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                {/* Imagen */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {(() => {
                    const imageUrl = normalizeImageUrl(item.product.image || item.product.imageUrl);
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null;
                  })()}
                  <div
                    className="w-full h-full items-center justify-center text-2xl"
                    style={{ display: normalizeImageUrl(item.product.image || item.product.imageUrl) ? 'none' : 'flex' }}
                  >
                    🍽️
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.product.name}</p>
                  <p className="text-orange-600 font-semibold text-sm">
                    MXN {(item.product.price * item.quantity).toFixed(2)}
                  </p>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item.product.id || item.product._id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id || item.product._id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id || item.product._id)}
                      className="ml-auto text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2 flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">MXN {subtotal.toFixed(2)}</span>
            </div>
          </div>
        </CollapsibleSection>

        {/* 2. DATOS DEL CLIENTE */}
        <CollapsibleSection
          title="Datos del cliente"
          icon={User}
          badge={isAuthenticated ? 'Verificado' : null}
          defaultOpen={!isAuthenticated}
        >
          <div className="space-y-3">
            {/* Nombre */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isAuthenticated}
                maxLength={50}
                className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  isAuthenticated ? 'bg-gray-100 text-gray-600' : 'bg-white'
                }`}
              />
            </div>

            {/* Teléfono */}
            <div className="flex gap-2">
              <div className="flex items-center px-3 py-3 border border-gray-300 rounded-lg bg-gray-50">
                <span className="text-lg mr-1">🇲🇽</span>
                <span className="text-sm text-gray-600">+52</span>
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Teléfono (10 dígitos)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  disabled={isAuthenticated}
                  maxLength={10}
                  className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    isAuthenticated ? 'bg-gray-100 text-gray-600' : 'bg-white'
                  }`}
                />
              </div>
            </div>

            {!isAuthenticated && (
              <p className="text-xs text-gray-500">
                Al confirmar, crearemos tu cuenta automáticamente
              </p>
            )}
          </div>
        </CollapsibleSection>

        {/* 3. DIRECCIÓN DE ENTREGA */}
        <CollapsibleSection
          title="Dirección de entrega"
          icon={MapPin}
          defaultOpen={addresses.length === 0}
        >
          <div className="space-y-3">
            {/* Lista de direcciones */}
            {addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => selectAddress(addr.street)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAddress === addr.street
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{addr.street}</p>
                        {addr.reference && (
                          <p className="text-xs text-gray-500">{addr.reference}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedAddress === addr.street && (
                          <Check className="w-5 h-5 text-orange-500" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAddress(addr.id);
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                No tienes direcciones guardadas
              </p>
            )}

            {/* Agregar nueva dirección */}
            {!showNewAddress ? (
              <button
                onClick={() => setShowNewAddress(true)}
                className="w-full p-3 border border-dashed border-gray-300 rounded-lg text-orange-600 font-medium flex items-center justify-center gap-2 hover:bg-orange-50"
              >
                <Plus className="w-4 h-4" />
                Agregar nueva dirección
              </button>
            ) : (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar dirección..."
                    value={newAddressQuery}
                    onChange={(e) => setNewAddressQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddressSearch}
                    disabled={searchLoading}
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {searchResults.map((result, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectSearchResult(result)}
                        className="w-full text-left p-2 text-sm hover:bg-white rounded"
                      >
                        {result.formatted}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowNewAddress(false);
                      setNewAddressQuery('');
                      clearSearch();
                    }}
                    className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* 4. MÉTODO DE PAGO */}
        <CollapsibleSection
          title="Método de pago"
          icon={CreditCard}
          defaultOpen={true}
        >
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.value}
                onClick={() => setSelectedPayment(method.value)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedPayment === method.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{method.label}</span>
                  {selectedPayment === method.value && (
                    <Check className="w-5 h-5 text-orange-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </CollapsibleSection>

        {/* 5. PROPINA */}
        <CollapsibleSection title="Propina" defaultOpen={true}>
          <div>
            <p className="text-xs text-gray-500 mb-3">
              Gracias al repartidor tu pedido llega a tiempo
            </p>
            <div className="flex flex-wrap gap-2">
              {[0, 5, 10, 15, 20].map((tip) => (
                <button
                  key={tip}
                  onClick={() => {
                    setSelectedTip(tip);
                    setCustomTip('');
                  }}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedTip === tip && !customTip
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {tip === 0 ? 'No, gracias' : `MXN ${tip}`}
                </button>
              ))}
              <div className="flex items-center border border-gray-300 rounded-lg px-2">
                <span className="text-sm text-gray-500">MXN</span>
                <input
                  type="number"
                  placeholder="Otro"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  onFocus={() => setSelectedTip(0)}
                  className="w-16 p-2 text-sm outline-none"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 6. COMENTARIOS Y CUPÓN */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Comentarios (opcional)
            </label>
            <textarea
              placeholder="Instrucciones especiales para tu pedido..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Cupón de descuento
            </label>
            <input
              type="text"
              placeholder="Ingresa tu cupón"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* 7. RESUMEN DE COSTOS */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Resumen</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>MXN {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío</span>
              <span>MXN {DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Propina</span>
              <span>MXN {tipAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-orange-600">MXN {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón fijo de confirmar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-sm mx-auto">
          <button
            onClick={handleConfirmOrder}
            disabled={loading}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            } text-white`}
          >
            {loading ? 'Procesando...' : `Confirmar Pedido - MXN ${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
