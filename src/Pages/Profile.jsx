import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Phone, MapPin, Package, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authGet } from '../utils/authFetch';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    // Cargar direcciones guardadas
    const storedAddresses = localStorage.getItem('userAddresses');
    if (storedAddresses) {
      try {
        setAddresses(JSON.parse(storedAddresses));
      } catch {
        setAddresses([]);
      }
    }

    // Cargar historial de pedidos
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        setLoadingOrders(false);
        return;
      }

      try {
        const response = await authGet(`${import.meta.env.VITE_API_URL}/api/me/orders`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      navigate('/', { replace: true });
    }
  };

  // Si no está autenticado, redirigir
  if (!isAuthenticated || !user) {
    return (
      <div className="bg-white min-h-screen max-w-sm mx-auto flex flex-col items-center justify-center p-4">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">No has iniciado sesión</h2>
        <p className="text-gray-500 text-center mb-6">
          Realiza tu primer pedido para crear tu cuenta automáticamente
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          Explorar negocios
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-white flex items-center p-4 border-b border-gray-100">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="ml-4 text-lg font-bold text-gray-900">Mi Perfil</h1>
      </div>

      {/* User Info Card */}
      <div className="bg-white m-4 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-primary-100 flex items-center gap-1 mt-1">
                <Phone className="w-4 h-4" />
                +52 {user.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="bg-white mx-4 mb-4 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            Mis Direcciones
          </h3>
        </div>

        {addresses.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {addresses.map((address, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{address.street || address}</p>
                  {address.reference && (
                    <p className="text-gray-500 text-sm">{address.reference}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>No hay direcciones guardadas</p>
          </div>
        )}

        <button
          onClick={() => navigate('/new-address')}
          className="w-full p-4 text-primary-600 font-medium hover:bg-primary-50 transition-colors border-t border-gray-100"
        >
          + Agregar nueva dirección
        </button>
      </div>

      {/* Orders Section */}
      <div className="bg-white mx-4 mb-4 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-500" />
            Mis Pedidos
          </h3>
        </div>

        {loadingOrders ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando pedidos...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 5).map((order, index) => (
              <div key={order._id || index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    Pedido #{order._id?.slice(-6) || index + 1}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status === 'delivered' ? 'Entregado' :
                     order.status === 'cancelled' ? 'Cancelado' :
                     order.status === 'pending' ? 'Pendiente' : order.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  {order.items?.length || 0} productos - MXN {order.total?.toFixed(2) || '0.00'}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'Fecha no disponible'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No tienes pedidos aún</p>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="mx-4 mb-8">
        <button
          onClick={handleLogout}
          className="w-full p-4 bg-white rounded-xl shadow-sm text-red-600 font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
