import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import Supercluster from "supercluster";
import { Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// 🎨 Marker de ubicación del usuario
const createUserLocationIcon = () => {
  const html = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      <div className="relative w-5 h-5 bg-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );

  return L.divIcon({
    html,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// 🎨 Marker optimizado de negocios
const createMarkerIcon = (business) => {
  const html = renderToStaticMarkup(
    <div className="flex flex-col items-center">
      <div className="relative bg-white rounded-full shadow-lg border-2 border-red-500 
                      hover:scale-110 transition-transform cursor-pointer">
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="text-xl">{business.emoji}</span>
        </div>
        {business.discount && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] 
                          font-bold px-1.5 py-0.5 rounded-full">
            -{business.discount}%
          </div>
        )}
        {business.isOpen && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 
                          rounded-full border-2 border-white"></div>
        )}
      </div>
      <div className="mt-1 bg-white px-2 py-0.5 rounded-md shadow-md border border-gray-200">
        <p className="text-[10px] font-semibold text-gray-800 whitespace-nowrap max-w-[80px] truncate">
          {business.name}
        </p>
        <div className="flex items-center justify-center gap-0.5">
          <span className="text-yellow-500 text-[10px]">★</span>
          <span className="text-[9px] font-medium text-gray-600">{business.rating}</span>
        </div>
      </div>
    </div>
  );

  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [80, 70],
    iconAnchor: [40, 70],
  });
};

// 🎨 Cluster minimalista
const createClusterIcon = (count) => {
  const size = count < 10 ? 36 : count < 50 ? 44 : 52;
  
  const html = renderToStaticMarkup(
    <div className="relative">
      <div className={`bg-red-500 rounded-full shadow-lg flex items-center justify-center
                       hover:scale-110 transition-transform cursor-pointer border-3 border-white`}
           style={{ width: size, height: size }}>
        <span className="text-white font-bold" style={{ fontSize: size / 3 }}>
          {count}
        </span>
      </div>
    </div>
  );

  return L.divIcon({
    html,
    className: 'cluster-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// 🗺️ Componente para centrar el mapa
function MapUpdater({ userLocation, initialBusiness }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation && !initialBusiness) {
      map.setView(userLocation, 16, { animate: true, duration: 1 });
    }
  }, [userLocation, map, initialBusiness]);
  
  // ✅ Si hay initialBusiness, centrar en él
  useEffect(() => {
    if (initialBusiness) {
      // El negocio puede venir del backend, necesitamos sus coordenadas
      // Por ahora, si no las tiene, no hacemos nada
      console.log('📍 Initial business detectado:', initialBusiness);
    }
  }, [initialBusiness, map]);
  
  return null;
}

// 🗺️ Markers con clustering
function MapMarkers({ businesses, onBusinessClick, onClusterClick }) {
  const map = useMap();
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(13);

  useMapEvents({
    moveend: () => {
      setBounds(map.getBounds());
      setZoom(Math.round(map.getZoom()));
    },
  });

  useEffect(() => {
    setBounds(map.getBounds());
    setZoom(Math.round(map.getZoom()));
  }, [map]);

  const clusters = useMemo(() => {
    if (!bounds || !businesses.length) return [];

    const cluster = new Supercluster({
      radius: 60,
      maxZoom: 18,
    });

    cluster.load(businesses);

    return cluster.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      zoom
    );
  }, [businesses, bounds, zoom]);

  return clusters.map((cluster, i) => {
    const [lng, lat] = cluster.geometry.coordinates;
    const { cluster: isCluster, point_count } = cluster.properties;

    if (isCluster) {
      return (
        <Marker
          key={`cluster-${i}`}
          position={[lat, lng]}
          icon={createClusterIcon(point_count)}
          eventHandlers={{
            click: () => onClusterClick(lat, lng),
          }}
        />
      );
    }

    return (
      <Marker
        key={cluster.properties.id}
        position={[lat, lng]}
        icon={createMarkerIcon(cluster.properties)}
        eventHandlers={{
          click: () => onBusinessClick(cluster.properties, lat, lng),
        }}
      />
    );
  });
}

// 🎯 Componente principal
export default function HomeMap({ 
  selectedCategory,
  type = "comida",
  onBusinessOpen,
  initialBusiness
}) {
  const [businesses, setBusinesses] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const initialCenter = [19.03908, -98.33858];
  const initialZoom = 17;

  // 📍 Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          console.log("📍 Ubicación detectada:", latitude, longitude);
        },
        (error) => {
          console.log("⚠️ No se pudo obtener ubicación, usando predeterminada");
          setUserLocation(initialCenter);
        }
      );
    } else {
      setUserLocation(initialCenter);
    }
  }, []);

  // ✅ Cargar negocios según el tipo
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/businesses/type/${type}`);
        const { response } = await res.json();

        console.log(`📦 Negocios de tipo "${type}":`, response);

        const points = response
          .filter(b => b.location?.coordinates)
          .map(b => ({
            type: "Feature",
            properties: {
              id: b._id,
              name: b.name,
              emoji: b.mapIcon || b.emoji || (type === 'tienda' ? '🏪' : '🍔'),
              rating: b.rating || 4.5,
              isOpen: b.isOpen !== false,
              discount: b.discount || null,
              categorySlug: b.category?.slug,
              categoryName: b.category?.name,
              categoryIcon: b.category?.icon,
              logo: b.logo,
              banner: b.banner,
              deliveryTime: b.deliveryTime,
              deliveryCost: b.deliveryCost,
              minOrderAmount: b.minOrderAmount,
            },
            geometry: {
              type: "Point",
              coordinates: b.location.coordinates,
            },
          }));

        setBusinesses(points);
        console.log(`✅ ${points.length} negocios de tipo "${type}" procesados`);
      } catch (error) {
        console.error("❌ Error:", error);
      }
    };

    loadBusinesses();
  }, [type]);

  // 🔥 FILTRAR NEGOCIOS SEGÚN LA CATEGORÍA SELECCIONADA
  const filteredBusinesses = useMemo(() => {
    if (!selectedCategory) {
      console.log("🔍 Mostrando todos los negocios:", businesses.length);
      return businesses;
    }
    
    const filtered = businesses.filter(b => b.properties.categorySlug === selectedCategory);
    console.log(`🔍 Filtrando por "${selectedCategory}":`, filtered.length, "negocios");
    return filtered;
  }, [businesses, selectedCategory]);

  // 🎯 Handle business click
  const handleBusinessClick = (business, lat, lng) => {
  const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `https://${path}`;
  };

  const businessData = {
    id: business.id,
    name: business.name,
    rating: business.rating,
    // ✅ FIX: Solo pasar el nombre de la categoría
    category: business.categoryName || 'Sin categoría',
    categorySlug: business.categorySlug,
    logo: buildImageUrl(business.logo),
    banner: buildImageUrl(business.banner),
    deliveryTime: business.deliveryTime || '30-40 min',
    deliveryCost: business.deliveryCost || 25,
    minOrderAmount: business.minOrderAmount || 50,
    isOpen: business.isOpen,
    emoji: business.emoji,
  };

  console.log("🖱️ Business clickeado:", businessData);
  
  onBusinessOpen?.(businessData);
  
  if (mapRef) {
    mapRef.setView([lat, lng], 16, { animate: true });
  }
};

  // 🎯 Handle cluster click
  const handleClusterClick = (lat, lng) => {
    if (mapRef) {
      mapRef.setView([lat, lng], mapRef.getZoom() + 2, { animate: true });
    }
  };

  // 🎯 Recentrar mapa
  const handleRecenter = () => {
    if (mapRef && userLocation) {
      mapRef.setView(userLocation, 16, { animate: true, duration: 0.5 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="w-full h-full"
        zoomControl={false}
        ref={setMapRef}
      >
        <MapUpdater userLocation={userLocation} initialBusiness={initialBusiness} />
        
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Marker de ubicación del usuario */}
        {userLocation && (
          <>
            <Marker
              position={userLocation}
              icon={createUserLocationIcon()}
              zIndexOffset={1000}
            />
            <Circle
              center={userLocation}
              radius={300}
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.05,
                weight: 1,
                opacity: 0.3,
              }}
            />
          </>
        )}

        <MapMarkers
          businesses={filteredBusinesses}
          onBusinessClick={handleBusinessClick}
          onClusterClick={handleClusterClick}
        />
      </MapContainer>

      {/* Controles de zoom y recentrar */}
      <div className="absolute bottom-8 right-4 flex flex-col gap-1.5 z-[00]">
        <button
          onClick={handleRecenter}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center
                     hover:bg-blue-50 transition-all text-gray-700 hover:text-blue-600
                     active:scale-95 group relative"
          title="Ir a mi ubicación"
        >
          <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
          {userLocation && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </button>

        <button
          onClick={() => mapRef?.zoomIn()}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center
                     hover:bg-gray-50 transition-colors text-xl font-semibold text-gray-700
                     active:scale-95"
        >
          +
        </button>

        <button
          onClick={() => mapRef?.zoomOut()}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center
                     hover:bg-gray-50 transition-colors text-xl font-semibold text-gray-700
                     active:scale-95"
        >
          −
        </button>
      </div>

      <style jsx global>{`
        .custom-marker,
        .cluster-marker,
        .user-location-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-container {
          font-family: inherit;
          z-index: 0 !important;
        }

        .leaflet-control-attribution {
          font-size: 9px;
          background: rgba(255, 255, 255, 0.7) !important;
        }

        .leaflet-pane,
        .leaflet-map-pane {
          z-index: 1 !important;
        }

        .leaflet-top,
        .leaflet-bottom {
          z-index: 400 !important;
        }
      `}</style>
    </div>
  );
}