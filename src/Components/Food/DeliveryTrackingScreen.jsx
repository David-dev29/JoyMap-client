import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, Phone, RotateCcw, Check, MapPin, Plus, Minus, Smartphone } from 'lucide-react';

export default function DeliveryTrackingScreen() {
  const [orderStatus, setOrderStatus] = useState('Pagado');
  const [isCompleted, setIsCompleted] = useState(false);
  const [mapZoom, setMapZoom] = useState(14);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/address", { replace: true });
  };


  // Simular actualización de estado del pedido
  useEffect(() => {
    const timer = setTimeout(() => {
      if (orderStatus === 'Pagado') {
        setOrderStatus('En preparación');
      } else if (orderStatus === 'En preparación') {
        setOrderStatus('En camino');
      } else if (orderStatus === 'En camino') {
        setOrderStatus('Completado');
        setIsCompleted(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [orderStatus]);

  const handleUpdateStatus = () => {
    if (orderStatus === 'Pagado') {
      setOrderStatus('En preparación');
    } else if (orderStatus === 'En preparación') {
      setOrderStatus('En camino');
    } else if (orderStatus === 'En camino') {
      setOrderStatus('Completado');
      setIsCompleted(true);
    } else {
      setOrderStatus('Pagado');
      setIsCompleted(false);
    }
  };

  const getStatusColor = () => {
    switch (orderStatus) {
      case 'Pagado': return 'bg-blue-500';
      case 'En preparación': return 'bg-yellow-500';
      case 'En camino': return 'bg-red-600';
      case 'Completado': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusBadgeColor = () => {
    switch (orderStatus) {
      case 'Pagado': return 'bg-blue-100 text-blue-800';
      case 'En preparación': return 'bg-yellow-100 text-yellow-800';
      case 'En camino': return 'bg-red-100 text-red-900';
      case 'Completado': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-white min-h-screen max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center">
          <button onClick={handleBack}>
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
            <div className="ml-3 flex items-center">
              <Smartphone className="w-6 h-6 text-gray-400 mr-2" />
              <span className="text-lg font-medium">A domicilio</span>
            </div>
          </div>
          <button className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            Contáctanos
          </button>
        </div>

        {/* Map Area */}
        <div className="relative h-80 bg-gray-100">
          {/* Simulated Map */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
            {/* Map controls */}
            <div className="absolute top-4 left-4 space-y-2">
              <button 
                onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
                className="bg-white shadow-md rounded p-2 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setMapZoom(prev => Math.max(prev - 1, 10))}
                className="bg-white shadow-md rounded p-2 hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Location Pin */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>

            {/* Leaflet attribution */}
            <div className="absolute bottom-2 right-2 bg-white bg-opacity-75 px-2 py-1 text-xs text-gray-600 rounded">
              🍃 Leaflet
            </div>
          </div>
        </div>

        {/* Order Completed Section */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          
          <div className="text-6xl font-bold text-gray-900 mb-2">#1</div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Pedido completado
          </h2>
          
          <p className="text-gray-600 mb-6">
            Gracias por su preferencia
          </p>
          
          <button 
            onClick={handleUpdateStatus}
            className="flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 mb-6 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Actualizar estado</span>
          </button>
        </div>

        {/* Customer Info */}
        <div className="px-6 mb-6">
          <div className="text-sm font-medium text-gray-900 mb-2">
            Dev** Mun** +52 2227583***
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">
            Avenida Ayuntamiento 195, 72048 Puebla, Puebla, MX
            (Ubicación exacta: Privada, #190 al fondo ) - 2° - Casa
            del fondo, somos amigos de Beto y Emir :)
          </div>
          <div className="text-xs text-gray-500 mt-1">
            M1-815123927
          </div>
        </div>

        {/* Payment Status */}
        <div className="px-6 mb-6">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm text-gray-600">Estado del pago</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Pagado
            </span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            Efectivo MXN 230.00
          </div>
        </div>

        {/* Contact Button */}
        <div className="px-6 pb-6">
          <button className="w-full bg-green-500 text-white font-medium py-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span>Consultar sobre mi pedido</span>
          </button>
        </div>
      </div>
    );
  }

  // Normal tracking view
  return (
    <div className="bg-white min-h-screen max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center">
        <button onClick={handleBack}>
  <ChevronLeft className="w-6 h-6 text-gray-600" />
</button>

          <div className="ml-3 flex items-center">
            <Smartphone className="w-6 h-6 text-gray-400 mr-2" />
            <span className="text-lg font-medium">A domicilio</span>
          </div>
        </div>
        <button className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <MessageCircle className="w-4 h-4 mr-1" />
          Contáctanos
        </button>
      </div>

      {/* Status Bar */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Estado del pago</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
              {orderStatus}
            </span>
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 mt-1">
          Efectivo MXN 230.00
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-80 bg-gray-100">
        {/* Simulated Map */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
          {/* Map controls */}
          <div className="absolute top-4 left-4 space-y-2">
            <button 
              onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
              className="bg-white shadow-md rounded p-2 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setMapZoom(prev => Math.max(prev - 1, 10))}
              className="bg-white shadow-md rounded p-2 hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Location Pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MapPin className="w-8 h-8 text-blue-500" />
          </div>

          {/* Leaflet attribution */}
          <div className="absolute bottom-2 right-2 bg-white bg-opacity-75 px-2 py-1 text-xs text-gray-600 rounded">
            🍃 Leaflet
          </div>
        </div>
      </div>

      {/* Order Status */}
      <div className="p-6 text-center">
        <div className={`w-16 h-16 ${getStatusColor()} rounded-full flex items-center justify-center mx-auto mb-4 transition-colors`}>
          {orderStatus === 'Completado' ? (
            <Check className="w-8 h-8 text-white" />
          ) : (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        
        <div className="text-6xl font-bold text-gray-900 mb-2">#1</div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {orderStatus === 'Completado' ? 'Pedido completado' : `Pedido ${orderStatus.toLowerCase()}`}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {orderStatus === 'Completado' ? 'Gracias por su preferencia' : 'Estamos preparando tu pedido'}
        </p>
        
        <button 
          onClick={handleUpdateStatus}
          className="flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 mb-6 mx-auto hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Actualizar estado</span>
        </button>
      </div>

      {/* Contact Button */}
      <div className="px-6 pb-6">
        <button className="w-full bg-green-500 text-white font-medium py-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>Consultar sobre mi pedido</span>
        </button>
      </div>
    </div>
  );
}