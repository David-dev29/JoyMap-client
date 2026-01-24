import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  Check,
  Search,
  Banknote,
  Smartphone,
  MessageSquare,
  Tag,
  Heart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { useAddresses } from '../hooks/useAddresses';
import { createOrder } from '../services/orderService';
import { PAYMENT_METHODS, DELIVERY_FEE } from '../constants';

// Helper para normalizar URLs de imágenes
const normalizeImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.includes('cloudfront.net') || url.includes('amazonaws.com') || url.includes('.com/')) {
    return `https://${url}`;
  }
  return url;
};

// Card Section Component
function Section({ title, icon: Icon, children, defaultOpen = true, badge, onToggle }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onToggle?.(!isOpen);
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-soft overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={handleToggle}
        className="w-full px-4 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-500" />
            </div>
          )}
          <div className="text-left">
            <span className="font-semibold text-gray-900">{title}</span>
            {badge && (
              <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Tip Button Component
function TipButton({ amount, selected, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        selected
          ? 'bg-primary-500 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label || `$${amount}`}
    </button>
  );
}

// Payment Method Icon
function PaymentIcon({ method }) {
  switch (method) {
    case 'cash':
      return <Banknote className="w-5 h-5" />;
    case 'card':
      return <CreditCard className="w-5 h-5" />;
    case 'transfer':
      return <Smartphone className="w-5 h-5" />;
    default:
      return <CreditCard className="w-5 h-5" />;
  }
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

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [selectedTip, setSelectedTip] = useState(10);
  const [customTip, setCustomTip] = useState('');
  const [comment, setComment] = useState('');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);

  // Address states
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddressQuery, setNewAddressQuery] = useState('');

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Calculations
  const tipAmount = useMemo(() => {
    if (customTip && !isNaN(parseFloat(customTip))) {
      return parseFloat(customTip);
    }
    return selectedTip;
  }, [selectedTip, customTip]);

  const total = subtotal + DELIVERY_FEE + tipAmount;

  // Search addresses
  const handleAddressSearch = async () => {
    if (newAddressQuery.length >= 3) {
      await search(newAddressQuery);
    }
  };

  // Select address from search
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

  // Confirm order
  const handleConfirmOrder = async () => {
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

    if (isEmpty) {
      alert('Tu carrito está vacío');
      navigate('/cart');
      return;
    }

    setLoading(true);

    try {
      let currentUser = user;
      let authToken = null;

      if (!isAuthenticated) {
        const registerResult = await quickRegister(name.trim(), phone.trim(), selectedAddress);

        if (!registerResult.success) {
          throw new Error(registerResult.error || 'Error al registrar usuario');
        }

        currentUser = registerResult.user;
        authToken = registerResult.token;
      }

      const orderItems = cartItems.map(item => ({
        productId: item.product.id || item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

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

      const result = await createOrder(orderData, authToken);

      clearCart();
      navigate('/deliveryScreen', { replace: true });

    } catch (error) {
      console.error('Error creando orden:', error);
      alert(`Error al crear la orden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Empty cart view
  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 text-center mb-6">
          Agrega productos para continuar
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-md"
        >
          Explorar restaurantes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-soft">
        <div className="max-w-lg mx-auto flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 -ml-2"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="ml-2 text-lg font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* 1. DELIVERY ADDRESS */}
        <Section
          title="Dirección de entrega"
          icon={MapPin}
          defaultOpen={addresses.length === 0}
        >
          <div className="space-y-3">
            {addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => selectAddress(addr.street)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddress === addr.street
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className={`w-5 h-5 ${
                          selectedAddress === addr.street ? 'text-primary-500' : 'text-gray-400'
                        }`} />
                        <p className="text-sm font-medium text-gray-900">{addr.street}</p>
                      </div>
                      {selectedAddress === addr.street && (
                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No tienes direcciones guardadas
              </p>
            )}

            {!showNewAddress ? (
              <button
                onClick={() => setShowNewAddress(true)}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-primary-600 font-medium flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar nueva dirección
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar dirección..."
                    value={newAddressQuery}
                    onChange={(e) => setNewAddressQuery(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddressSearch}
                    disabled={searchLoading}
                    className="px-4 py-3 bg-primary-500 text-white rounded-xl"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1 bg-white rounded-xl border border-gray-200">
                    {searchResults.map((result, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectSearchResult(result)}
                        className="w-full text-left p-3 text-sm hover:bg-gray-50 border-b last:border-0"
                      >
                        {result.formatted}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowNewAddress(false);
                    setNewAddressQuery('');
                    clearSearch();
                  }}
                  className="w-full py-2 text-gray-600 text-sm"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* 2. CONTACT INFO */}
        <Section
          title="Datos de contacto"
          icon={User}
          badge={isAuthenticated ? 'Verificado' : null}
          defaultOpen={!isAuthenticated}
        >
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isAuthenticated}
                className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isAuthenticated ? 'bg-gray-100 text-gray-600' : 'bg-white'
                }`}
              />
            </div>

            <div className="flex gap-2">
              <div className="flex items-center px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
                <span className="text-base mr-1">🇲🇽</span>
                <span className="text-sm text-gray-600">+52</span>
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  disabled={isAuthenticated}
                  className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isAuthenticated ? 'bg-gray-100 text-gray-600' : 'bg-white'
                  }`}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* 3. ORDER SUMMARY */}
        <Section
          title="Tu pedido"
          icon={ShoppingBag}
          badge={`${cartItems.length} items`}
          defaultOpen={false}
        >
          <div className="space-y-3">
            {cartItems.map((item) => {
              const imageUrl = normalizeImageUrl(item.product.image || item.product.imageUrl);
              return (
                <div
                  key={item.product.id || item.product._id}
                  className="flex gap-3 py-3 border-b border-gray-100 last:border-0"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.product.name}</p>
                    <p className="text-primary-600 font-semibold text-sm mt-1">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id || item.product._id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id || item.product._id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id || item.product._id)}
                        className="ml-auto text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* 4. PAYMENT METHOD */}
        <Section title="Método de pago" icon={CreditCard} defaultOpen={true}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'cash', label: 'Efectivo', icon: Banknote },
              { value: 'card', label: 'Tarjeta', icon: CreditCard },
              { value: 'transfer', label: 'Transferencia', icon: Smartphone },
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setSelectedPayment(method.value)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedPayment === method.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <method.icon className={`w-6 h-6 ${
                  selectedPayment === method.value ? 'text-primary-500' : 'text-gray-500'
                }`} />
                <span className={`text-xs font-medium ${
                  selectedPayment === method.value ? 'text-primary-600' : 'text-gray-600'
                }`}>
                  {method.label}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* 5. TIP */}
        <Section title="Propina para el repartidor" icon={Heart} defaultOpen={true}>
          <p className="text-xs text-gray-500 mb-3">
            Tu propina ayuda a nuestros repartidores
          </p>
          <div className="flex flex-wrap gap-2">
            {[0, 10, 15, 20, 25].map((tip) => (
              <TipButton
                key={tip}
                amount={tip}
                label={tip === 0 ? 'Sin propina' : `$${tip}`}
                selected={selectedTip === tip && !customTip}
                onClick={() => {
                  setSelectedTip(tip);
                  setCustomTip('');
                }}
              />
            ))}
            <div className={`flex items-center border-2 rounded-xl px-3 transition-all ${
              customTip ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
            }`}>
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                placeholder="Otra"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                onFocus={() => setSelectedTip(0)}
                className="w-16 py-2.5 pl-1 text-sm outline-none bg-transparent"
              />
            </div>
          </div>
        </Section>

        {/* 6. NOTES & COUPON */}
        <Section title="Notas adicionales" icon={MessageSquare} defaultOpen={false}>
          <div className="space-y-4">
            <textarea
              placeholder="Instrucciones especiales para tu pedido..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl resize-none text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />

            <div className="relative">
              <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cupón de descuento"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </Section>

        {/* 7. COST SUMMARY */}
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <h3 className="font-bold text-gray-900 mb-4">Resumen de pago</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío</span>
              <span className="font-medium">${DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Propina</span>
              <span className="font-medium">${tipAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-bold text-gray-900 text-base">Total</span>
              <span className="font-bold text-primary-600 text-xl">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-up">
        <div className="max-w-lg mx-auto">
          <motion.button
            onClick={handleConfirmOrder}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 active:scale-[0.98]'
            } text-white shadow-md`}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              `Confirmar pedido - $${total.toFixed(2)}`
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
