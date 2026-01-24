import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronDown,
  MessageCircle,
  Phone,
  Check,
  MapPin,
  Clock,
  Store,
  Bike,
  Home,
  HelpCircle,
  Package,
  Star,
} from 'lucide-react';

// Timeline Step Component - Proper colors: green (done), amber (active), gray (pending)
function TimelineStep({ icon: Icon, title, subtitle, isCompleted, isActive, isLast }) {
  return (
    <div className="flex gap-4">
      {/* Icon & Line */}
      <div className="flex flex-col items-center">
        <motion.div
          className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
            isCompleted
              ? 'bg-green-500 text-white'
              : isActive
              ? 'bg-amber-500 text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
          initial={false}
          animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 1 }}
        >
          {isCompleted ? (
            <Check className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </motion.div>
        {!isLast && (
          <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <p className={`font-semibold ${
          isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'
        }`}>
          {title}
        </p>
        <p className={`text-sm ${
          isCompleted || isActive ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// Delivery Person Card - Neutral colors, gray icons
function DeliveryPersonCard({ name, rating, onCall, onMessage }) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <Bike className="w-7 h-7 text-gray-600" />
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm text-gray-600">{rating}</span>
            <span className="text-sm text-gray-400">• Repartidor</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onCall}
            className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors"
          >
            <Phone className="w-5 h-5 text-green-600" />
          </button>
          <button
            onClick={onMessage}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function DeliveryTrackingScreen() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(25);

  // Order data (would come from API/context in real app)
  const orderData = {
    orderId: '#1234',
    restaurant: 'Pizzería Roma',
    items: [
      { name: 'Pizza Margarita', quantity: 1, price: 180 },
      { name: 'Coca-Cola 600ml', quantity: 2, price: 50 },
    ],
    subtotal: 230,
    deliveryFee: 25,
    tip: 15,
    total: 270,
    address: 'Av. Reforma 123, Col. Centro',
    paymentMethod: 'Efectivo',
  };

  const steps = [
    { icon: Check, title: 'Pedido confirmado', subtitle: 'Tu pedido ha sido recibido' },
    { icon: Store, title: 'En preparación', subtitle: 'El restaurante está preparando tu pedido' },
    { icon: Bike, title: 'En camino', subtitle: 'Tu repartidor viene en camino' },
    { icon: Home, title: 'Entregado', subtitle: 'Disfruta tu comida' },
  ];

  // Simulate order progress
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });

      setEstimatedTime((prev) => Math.max(0, prev - 8));
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const isCompleted = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="font-bold text-gray-900">Seguir pedido</h1>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Estimated Time Card - Green when done, Amber when in progress */}
        <motion.div
          className={`rounded-2xl p-6 text-center ${
            isCompleted ? 'bg-green-500' : 'bg-amber-500'
          }`}
          layout
        >
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">¡Pedido entregado!</h2>
              <p className="text-white/80">Gracias por tu preferencia</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm">Tiempo estimado</span>
              </div>
              <motion.div
                className="text-5xl font-bold text-white mb-1"
                key={estimatedTime}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {estimatedTime} min
              </motion.div>
              <p className="text-white/80 text-sm">
                {steps[currentStep].title}
              </p>
            </>
          )}
        </motion.div>

        {/* Delivery Person (show when in transit) */}
        <AnimatePresence>
          {currentStep >= 2 && !isCompleted && (
            <DeliveryPersonCard
              name="Carlos García"
              rating="4.9"
              onCall={() => console.log('Call')}
              onMessage={() => console.log('Message')}
            />
          )}
        </AnimatePresence>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-6">Estado del pedido</h3>
          <div className="ml-1">
            {steps.map((step, index) => (
              <TimelineStep
                key={index}
                icon={step.icon}
                title={step.title}
                subtitle={step.subtitle}
                isCompleted={index < currentStep}
                isActive={index === currentStep}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Order Details (Collapsible) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Detalles del pedido</span>
            </div>
            <motion.div
              animate={{ rotate: showDetails ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                  {/* Restaurant */}
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{orderData.restaurant}</span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {orderData.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-900 font-medium">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${orderData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span>${orderData.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Propina</span>
                      <span>${orderData.tip.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <span className="text-[#E53935]">${orderData.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dirección de entrega</p>
                        <p className="text-sm text-gray-600">{orderData.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help Button - Red as CTA */}
        <button className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-center gap-2 text-[#E53935] font-semibold hover:bg-gray-50 transition-colors">
          <HelpCircle className="w-5 h-5" />
          ¿Necesitas ayuda con tu pedido?
        </button>

        {/* Rate Order (show when completed) */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-bold text-gray-900 mb-2">¿Cómo estuvo tu pedido?</h3>
              <p className="text-sm text-gray-500 mb-4">Tu opinión nos ayuda a mejorar</p>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-amber-100 transition-colors group"
                  >
                    <Star className="w-6 h-6 text-gray-400 group-hover:text-amber-400" />
                  </button>
                ))}
              </div>
              <button className="text-[#E53935] font-medium text-sm">
                Escribir reseña
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
