import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PiCaretLeftBold,
  PiCreditCardBold,
  PiPlusBold,
  PiMagnifyingGlassBold,
  PiTicketBold,
  PiXBold,
  PiMapPinBold,
  PiMinusBold,
  PiTrashBold,
  PiShoppingBagBold,
  PiHeartBold,
  PiCaretDownBold,
} from 'react-icons/pi';
import { HiBanknotes, HiBuildingLibrary } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { useAddresses } from '../hooks/useAddresses';
import { createOrder } from '../services/orderService';
import { DELIVERY_FEE } from '../constants';
import PaymentTutorial from '../Components/PaymentTutorial';

// Helper para normalizar URLs de imágenes
const normalizeImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.includes('cloudfront.net') || url.includes('amazonaws.com') || url.includes('.com/')) {
    return `https://${url}`;
  }
  return url;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, quickRegister } = useAuth();
  const { items: cartItems, removeItem, updateQuantity, clearCart, subtotal, isEmpty } = useCart();
  const {
    addresses,
    selectedAddress,
    selectAddress,
    addAddress,
    search,
    searchResults,
    searchLoading,
    clearSearch
  } = useAddresses();

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedTip, setSelectedTip] = useState(10);
  const [customTip, setCustomTip] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // UI states
  const [isOrderExpanded, setIsOrderExpanded] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddressQuery, setNewAddressQuery] = useState('');

  // Coupon states
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Card modal states
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // Payment carousel ref for scroll snap
  const paymentCarouselRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const paymentSectionRef = useRef(null);
  const paymentMethods = ['card', 'cash', 'transfer'];

  // Sticky banner visibility
  const [showStickyBanner, setShowStickyBanner] = useState(false);

  // Payment tutorial (onboarding)
  const [showPaymentTutorial, setShowPaymentTutorial] = useState(false);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Show payment tutorial on first visit
  useEffect(() => {
    // TEMPORALMENTE: Mostrar siempre para pruebas
    const timer = setTimeout(() => setShowPaymentTutorial(true), 800);
    return () => clearTimeout(timer);

    // PARA PRODUCCIÓN: Descomentar esto y comentar lo de arriba
    // const tutorialSeen = localStorage.getItem('paymentTutorialSeen');
    // if (!tutorialSeen) {
    //   const timer = setTimeout(() => setShowPaymentTutorial(true), 800);
    //   return () => clearTimeout(timer);
    // }
  }, []);

  // Load applied coupon from localStorage
  useEffect(() => {
    const savedCoupon = localStorage.getItem('appliedCoupon');
    if (savedCoupon) {
      try {
        const coupon = JSON.parse(savedCoupon);
        const currentBusinessId = cartItems[0]?.businessId || cartItems[0]?.product?.businessId;
        if (coupon.businessId === currentBusinessId) {
          setAppliedCoupon(coupon);
          setCouponCode(coupon.code);
        } else {
          localStorage.removeItem('appliedCoupon');
        }
      } catch (e) {
        localStorage.removeItem('appliedCoupon');
      }
    }
  }, [cartItems]);

  // Scroll snap auto-selection for payment methods (with debounce)
  useEffect(() => {
    const carousel = paymentCarouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      // Clear previous timeout to debounce
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Wait for scroll to settle before selecting
      scrollTimeoutRef.current = setTimeout(() => {
        const scrollLeft = carousel.scrollLeft;
        const cardWidth = 224 + 12; // w-56 (224px) + gap-3 (12px)
        const index = Math.round(scrollLeft / cardWidth);
        const method = paymentMethods[index];

        if (method) {
          setSelectedPayment(method);
        }
      }, 150); // Wait 150ms after scroll stops
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => {
      carousel.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Intersection Observer for sticky banner
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky banner when payment section is NOT visible
        setShowStickyBanner(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (paymentSectionRef.current) {
      observer.observe(paymentSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Block background scroll when modals are open
  useEffect(() => {
    if (showCardModal || showAddressModal) {
      // Save current scroll position and lock body
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [showCardModal, showAddressModal]);

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    localStorage.removeItem('appliedCoupon');
    toast('Cupón eliminado');
  };

  // Calculate tip amount
  const tipAmount = useMemo(() => {
    if (customTip && !isNaN(parseFloat(customTip))) {
      return parseFloat(customTip);
    }
    return selectedTip;
  }, [selectedTip, customTip]);

  // Calculate coupon discount
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minOrder && subtotal < appliedCoupon.minOrder) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (subtotal * appliedCoupon.discount) / 100;
    }
    return Math.min(appliedCoupon.discount, subtotal);
  }, [appliedCoupon, subtotal]);

  const total = subtotal + DELIVERY_FEE + tipAmount - couponDiscount;

  // Check if can proceed
  const hasAddress = selectedAddress || addresses.length > 0;
  const hasPayment = selectedPayment !== null;
  const canProceed = hasAddress && hasPayment && name.trim() && phone.trim();

  // Search addresses - limitado a zona Cholula
  const handleAddressSearch = async () => {
    if (newAddressQuery.length >= 3) {
      // Agregar "Cholula, Puebla" al query para limitar resultados
      const searchQuery = `${newAddressQuery} Cholula, Puebla, México`;
      await search(searchQuery);
    }
  };

  // Select address from search
  const handleSelectSearchResult = (result) => {
    const newAddr = addAddress({
      street: result.formatted,
      coordinates: result.coordinates
    });
    selectAddress(newAddr.street);
    setShowAddressModal(false);
    setNewAddressQuery('');
    clearSearch();
  };

  // Confirm order
  const handleConfirmOrder = async () => {
    if (!canProceed) {
      if (!hasAddress) {
        toast.error('Por favor agrega una dirección de entrega');
      } else if (!hasPayment) {
        toast.error('Por favor selecciona un método de pago');
      } else {
        toast.error('Por favor completa tus datos');
      }
      return;
    }

    if (phone.length < 10) {
      toast.error('El teléfono debe tener al menos 10 dígitos');
      return;
    }

    if (isEmpty) {
      toast.error('Tu carrito está vacío');
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
        businessId,
        customerId: currentUser._id,
        customer: {
          name: currentUser.name || name,
          phone: currentUser.phone || phone
        },
        items: orderItems,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        tip: tipAmount,
        couponCode: appliedCoupon?.code || null,
        couponDiscount,
        couponId: appliedCoupon?.couponId || null,
        total,
        deliveryAddress: {
          street: selectedAddress || addresses[0]?.street || 'Dirección no especificada',
          reference: comment || '',
          coordinates: []
        },
        paymentMethod: selectedPayment,
        paymentStatus: 'pending',
        notes: comment
      };

      await createOrder(orderData, authToken);

      if (appliedCoupon) {
        try {
          const usedCoupons = JSON.parse(localStorage.getItem('usedCoupons') || '[]');
          usedCoupons.push({
            code: appliedCoupon.code,
            businessId: appliedCoupon.businessId,
            usedAt: new Date().toISOString()
          });
          localStorage.setItem('usedCoupons', JSON.stringify(usedCoupons));
        } catch (e) {
          console.error('Error saving used coupon:', e);
        }
      }

      clearCart();
      localStorage.removeItem('appliedCoupon');
      toast.success('¡Pedido confirmado! Te avisaremos cuando esté en camino');
      navigate('/deliveryScreen', { replace: true });

    } catch (error) {
      console.error('Error creando orden:', error);
      toast.error(`Error al crear la orden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Empty cart view
  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <PiShoppingBagBold className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 text-center mb-6">Agrega productos para continuar</p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-rose-600 text-white rounded-full font-semibold hover:bg-rose-700 transition-colors shadow-md"
        >
          Explorar negocios
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header sticky - DEBE estar fuera de cualquier overflow para funcionar */}
      <header className="sticky top-0 z-50 bg-white px-4 h-14 flex items-center gap-3 border-b border-gray-100 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-100"
        >
          <PiCaretLeftBold className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Último paso</h1>
      </header>

      {/* Banner sticky de método de pago - z-40, solo cuando la sección no es visible */}
      <AnimatePresence>
        {showStickyBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 left-0 right-0 z-40 px-4 py-2 bg-white shadow-md touch-none"
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="max-w-lg mx-auto w-full">
              {selectedPayment ? (
                <div className={`py-2 px-4 flex items-center justify-center gap-2 rounded-xl ${
                  selectedPayment === 'cash' ? 'bg-green-600' :
                  selectedPayment === 'transfer' ? 'bg-purple-600' :
                  'bg-cyan-600'
                }`}>
                  {selectedPayment === 'cash' && <HiBanknotes className="w-5 h-5 text-white" />}
                  {selectedPayment === 'transfer' && <HiBuildingLibrary className="w-5 h-5 text-white" />}
                  {selectedPayment === 'card' && <PiCreditCardBold className="w-5 h-5 text-white" />}
                  <span className="text-white font-medium text-sm">
                    {selectedPayment === 'cash' && 'Pagarás en efectivo'}
                    {selectedPayment === 'transfer' && 'Pagarás por transferencia'}
                    {selectedPayment === 'card' && 'Pagarás con tarjeta'}
                  </span>
                </div>
              ) : (
                <div className="py-2 px-4 flex items-center justify-center gap-2 rounded-xl bg-gray-100">
                  <PiCreditCardBold className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600 text-sm">Selecciona un método de pago</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECCIÓN 1: ¿Cómo quieres pagar? */}
      <section ref={paymentSectionRef} className="pt-4 pb-2 relative overflow-x-hidden">
        <h2 className="text-lg font-bold text-gray-900 mb-3 px-4">¿Cómo quieres pagar?</h2>

        {/* Carrusel horizontal - borde a borde */}
        <div
          ref={paymentCarouselRef}
          className="flex gap-3 overflow-x-auto py-4 px-4 snap-x snap-mandatory scroll-smooth overscroll-x-contain"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Opción 1: Tarjeta */}
          <button
            onClick={() => {
              setSelectedPayment('card');
              setShowCardModal(true);
            }}
            className={`snap-center [scroll-snap-stop:always] flex-shrink-0 w-56 h-20 border-2 border-dashed rounded-2xl p-4 flex items-center gap-3 transition-all duration-300 ease-out ${
              selectedPayment === 'card'
                ? 'border-cyan-500 bg-cyan-50 scale-110 shadow-lg z-20'
                : 'border-gray-300 bg-cyan-50/50 scale-95 opacity-70 z-10'
            }`}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <PiCreditCardBold className="w-7 h-7 text-cyan-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-gray-900">Agregar tarjeta</p>
              <p className="text-sm text-gray-500">Débito o crédito</p>
            </div>
          </button>

          {/* Opción 2: Efectivo */}
          <button
            onClick={() => setSelectedPayment('cash')}
            className={`snap-center [scroll-snap-stop:always] flex-shrink-0 w-56 h-20 rounded-2xl p-4 flex items-center gap-3 transition-all duration-300 ease-out bg-green-600 ${
              selectedPayment === 'cash'
                ? 'scale-110 shadow-lg z-20'
                : 'scale-95 opacity-70 z-10'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <HiBanknotes className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-white">Efectivo</p>
              <p className="text-sm text-white/80">Paga al recibir</p>
            </div>
          </button>

          {/* Opción 3: Transferencia */}
          <button
            onClick={() => setSelectedPayment('transfer')}
            className={`snap-center [scroll-snap-stop:always] flex-shrink-0 w-56 h-20 rounded-2xl p-4 flex items-center gap-3 transition-all duration-300 ease-out bg-purple-600 ${
              selectedPayment === 'transfer'
                ? 'scale-110 shadow-lg z-20'
                : 'scale-95 opacity-70 z-10'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <HiBuildingLibrary className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-white">Transferencia</p>
              <p className="text-sm text-white/80">SPEI o depósito</p>
            </div>
          </button>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-4 space-y-4">

        {/* SECCIÓN 2: Cupón - Fila separada */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <PiTicketBold className="w-6 h-6 text-green-600" />
                <div>
                  <span className="text-green-800 font-semibold">{appliedCoupon.code}</span>
                  <p className="text-xs text-green-600">
                    {appliedCoupon.discountType === 'percentage'
                      ? `${appliedCoupon.discount}% de descuento`
                      : `-$${appliedCoupon.discount}`}
                  </p>
                </div>
              </div>
              <button onClick={handleRemoveCoupon} className="p-2 hover:bg-gray-100 rounded-full">
                <PiXBold className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          ) : showCouponInput ? (
            <div className="flex gap-2 p-4">
              <input
                type="text"
                placeholder="Código del cupón"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowCouponInput(false);
                  setCouponCode('');
                }}
                className="px-4 py-3 text-gray-500 font-medium"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCouponInput(true)}
              className="flex items-center justify-between w-full p-4"
            >
              <div className="flex items-center gap-3">
                <PiTicketBold className="w-6 h-6 text-gray-600" />
                <span className="text-gray-900">¿Tienes un cupón?</span>
              </div>
              <span className="font-semibold text-rose-600">Agregar</span>
            </button>
          )}
        </div>

        {/* SECCIÓN 3: Dirección */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <button
            onClick={() => setShowAddressModal(true)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                hasAddress ? 'bg-green-100' : 'bg-rose-100'
              }`}>
                <PiMapPinBold className={`w-5 h-5 ${hasAddress ? 'text-green-600' : 'text-rose-600'}`} />
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className={`font-medium ${hasAddress ? 'text-gray-900' : 'text-rose-600'}`}>
                  Lo recibes en
                </p>
                {hasAddress ? (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {selectedAddress || addresses[0]?.street}
                  </p>
                ) : (
                  <p className="text-sm text-rose-500">⚠️ Agrega tu dirección</p>
                )}
              </div>
            </div>
            <span className="text-rose-600 font-semibold flex-shrink-0 ml-2">
              {hasAddress ? 'Cambiar' : 'Agregar'}
            </span>
          </button>

          {/* Datos de contacto */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isAuthenticated}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                isAuthenticated ? 'bg-gray-100' : 'bg-white'
              }`}
            />
            <div className="flex gap-2 items-stretch">
              <div className="flex items-center px-3 border border-gray-300 rounded-xl bg-gray-50 flex-shrink-0">
                <span className="text-sm whitespace-nowrap">🇲🇽 +52</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="Teléfono (10 dígitos)"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={isAuthenticated}
                className={`flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                  isAuthenticated ? 'bg-gray-100' : 'bg-white'
                }`}
              />
            </div>
            <textarea
              placeholder="Notas para el repartidor (opcional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* SECCIÓN 4: Tu pedido - Expandible/Contraíble */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header clickeable */}
          <button
            onClick={() => setIsOrderExpanded(!isOrderExpanded)}
            className="flex items-center justify-between w-full p-4"
          >
            <div className="flex items-center gap-2">
              <PiShoppingBagBold className="w-5 h-5 text-gray-700" />
              <span className="font-semibold text-gray-900">Tu pedido</span>
              <span className="text-gray-500 text-sm">({cartItems.length} productos)</span>
            </div>
            <PiCaretDownBold
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                isOrderExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Contenido expandible */}
          <AnimatePresence>
            {isOrderExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 pb-4 space-y-3">
                  {cartItems.map((item) => {
                    const imageUrl = normalizeImageUrl(item.product.image || item.product.imageUrl);
                    return (
                      <div
                        key={item.product.id || item.product._id}
                        className="flex gap-3 py-3 border-t border-gray-100"
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
                          <p className="text-gray-700 font-semibold text-sm mt-1">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.product.id || item.product._id, item.quantity - 1);
                              }}
                              className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                              <PiMinusBold className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.product.id || item.product._id, item.quantity + 1);
                              }}
                              className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                            >
                              <PiPlusBold className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(item.product.id || item.product._id);
                              }}
                              className="ml-auto text-rose-500 hover:text-rose-600"
                            >
                              <PiTrashBold className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECCIÓN 5: Propina para el repartidor */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <PiHeartBold className="w-5 h-5 text-rose-500" />
            Propina para el repartidor
          </h3>
          <p className="text-xs text-gray-500 mb-4">Tu propina ayuda a nuestros repartidores</p>

          <div className="flex flex-wrap gap-2">
            {[0, 10, 15, 20, 25].map((tip) => (
              <button
                key={tip}
                onClick={() => {
                  setSelectedTip(tip);
                  setCustomTip('');
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedTip === tip && !customTip
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tip === 0 ? 'Sin propina' : `$${tip}`}
              </button>
            ))}
            <div className={`flex items-center border-2 rounded-xl px-3 transition-all ${
              customTip ? 'border-rose-600 bg-rose-50' : 'border-gray-200'
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
        </div>

        {/* SECCIÓN 6: Resumen de pago */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
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

            {/* Coupon Discount */}
            {appliedCoupon && couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <PiTicketBold className="w-4 h-4" />
                  Descuento ({appliedCoupon.code})
                </span>
                <span className="font-medium">-${couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-bold text-gray-900 text-base">Total</span>
              <span className="font-bold text-rose-700 text-xl">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER FIJO */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4 shadow-lg">
        <div className="max-w-lg mx-auto w-full">
          <motion.button
            onClick={handleConfirmOrder}
            disabled={loading || !canProceed}
            className={`w-full py-4 rounded-full font-semibold text-base transition-all ${
              loading || !canProceed
                ? 'bg-rose-300 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 active:scale-[0.98]'
            } text-white shadow-md`}
            whileTap={{ scale: loading || !canProceed ? 1 : 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              'Hacer pedido'
            )}
          </motion.button>
          {!canProceed && (
            <p className="text-center text-xs text-gray-500 mt-2">
              {!hasPayment && 'Selecciona un método de pago'}
              {hasPayment && !hasAddress && 'Agrega tu dirección'}
              {hasPayment && hasAddress && (!name.trim() || !phone.trim()) && 'Completa tus datos'}
            </p>
          )}
        </div>
      </footer>

      {/* Modal de dirección - Sin drag, scroll interno */}
      <AnimatePresence>
        {showAddressModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => {
              setShowAddressModal(false);
              setNewAddressQuery('');
              clearSearch();
            }}
            onTouchMove={(e) => e.preventDefault()}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag={false}
              className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden touch-none"
              onClick={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Header fijo */}
              <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Dirección de entrega</h3>
                  <button
                    onClick={() => {
                      setShowAddressModal(false);
                      setNewAddressQuery('');
                      clearSearch();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <PiXBold className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Zona Cholula, Puebla</p>
              </div>

              {/* Contenido con scroll interno */}
              <div className="overflow-y-auto overscroll-contain p-6 touch-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
                {/* Buscar dirección */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Ingresa tu dirección</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Buscar calle, colonia..."
                      value={newAddressQuery}
                      onChange={(e) => setNewAddressQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddressSearch}
                      disabled={searchLoading || newAddressQuery.length < 3}
                      className="px-4 py-3 bg-rose-600 text-white rounded-xl disabled:bg-gray-300"
                    >
                      {searchLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <PiMagnifyingGlassBold className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-1 bg-gray-50 rounded-xl border overflow-hidden">
                      {searchResults.map((result, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectSearchResult(result)}
                          className="w-full text-left p-3 text-sm hover:bg-gray-100 border-b last:border-0 flex items-center gap-2"
                        >
                          <PiMapPinBold className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="line-clamp-2">{result.formatted}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal para agregar tarjeta */}
      <AnimatePresence>
        {showCardModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowCardModal(false)}
            onTouchMove={(e) => e.preventDefault()}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag={false}
              className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden touch-none"
              onClick={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Agregar tarjeta</h3>
                  <button
                    onClick={() => setShowCardModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <PiXBold className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Formulario */}
              <div className="p-6 space-y-4 overflow-y-auto touch-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                {/* Número de tarjeta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de tarjeta
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardData.number}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\s/g, '')
                        .replace(/\D/g, '')
                        .replace(/(\d{4})/g, '$1 ')
                        .trim();
                      setCardData({ ...cardData, number: value });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>

                {/* Nombre en la tarjeta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre en la tarjeta
                  </label>
                  <input
                    type="text"
                    placeholder="JUAN PÉREZ"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>

                {/* Fecha y CVV en fila */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vencimiento
                    </label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setCardData({ ...cardData, expiry: value });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Botón guardar */}
                <button
                  onClick={() => {
                    if (cardData.number && cardData.name && cardData.expiry && cardData.cvv) {
                      setShowCardModal(false);
                      toast.success('Tarjeta agregada correctamente');
                    } else {
                      toast.error('Por favor completa todos los campos');
                    }
                  }}
                  className="w-full mt-4 py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-full transition-colors"
                >
                  Guardar tarjeta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tutorial de métodos de pago - solo la primera vez */}
      {showPaymentTutorial && (
        <PaymentTutorial
          onComplete={() => setShowPaymentTutorial(false)}
          carouselRef={paymentCarouselRef}
        />
      )}
    </div>
  );
}
