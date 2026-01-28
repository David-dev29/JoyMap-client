import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import Supercluster from "supercluster";
import 'leaflet/dist/leaflet.css';

// Hooks personalizados
import { useGeolocation } from '../../hooks/useGeolocation';
import { useBusinesses } from '../../hooks/useBusinesses';
import { DEFAULT_LOCATION, MAP_CONFIG, DEFAULT_BUSINESS_EMOJI } from '../../constants';

// 🎨 Cache de iconos para evitar recreación
const iconCache = new Map();

// 🎨 Marker de ubicación del usuario (estilo Google Maps)
const createUserLocationIcon = () => {
  const cached = iconCache.get('user-location');
  if (cached) return cached;

  const html = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      {/* Círculo pulsante exterior */}
      <div className="absolute w-8 h-8 bg-blue-500/20 rounded-full animate-ping" />
      {/* Punto central */}
      <div className="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
    </div>
  );

  const icon = L.divIcon({
    html,
    className: 'user-location-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  iconCache.set('user-location', icon);
  return icon;
};

// 🎨 Helper para convertir SVG a base64 de forma segura
const svgToBase64 = (svgString) => {
  try {
    // Método 1: Para SVGs con caracteres unicode
    return btoa(unescape(encodeURIComponent(svgString)));
  } catch (e1) {
    console.warn('⚠️ SVG base64 método 1 falló:', e1.message);
    try {
      // Método 2: btoa directo (solo ASCII)
      return btoa(svgString);
    } catch (e2) {
      console.warn('⚠️ SVG base64 método 2 falló:', e2.message);
      return null;
    }
  }
};

// 🎨 Marker estilo Google Maps (burbuja rectangular con punta)
const createMarkerIcon = (business) => {
  const cacheKey = `marker-${business.id}-${business.isOpen}-${business.rating}-${business.iconType}`;
  const cached = iconCache.get(cacheKey);
  if (cached) return cached;

  // Formatear rating
  const rating = business.rating ? Number(business.rating).toFixed(1) : '4.5';

  // Truncar nombre si es muy largo
  const displayName = business.name.length > 12
    ? business.name.substring(0, 10) + '...'
    : business.name;

  // Determinar si usar SVG o emoji
  let hasSvgIcon = false;
  let svgDataUrl = null;

  // 🔍 DEBUG y procesamiento de SVG con try-catch
  if (business.iconType === 'svg' && business.iconSvg) {
    console.log('🗺️ [1] Procesando marker SVG para:', business.name);
    console.log('🗺️ [2] iconSvg recibido (primeros 200 chars):', business.iconSvg.substring(0, 200));

    try {
      const base64 = svgToBase64(business.iconSvg);

      if (base64) {
        svgDataUrl = `data:image/svg+xml;base64,${base64}`;
        hasSvgIcon = true;
        console.log('🗺️ [3] ✅ Data URL generado exitosamente');
        console.log('🗺️ [4] Data URL (primeros 100 chars):', svgDataUrl.substring(0, 100));
      } else {
        console.error('🗺️ [3] ❌ No se pudo generar base64, usando emoji fallback');
      }
    } catch (error) {
      console.error('🗺️ [3] ❌ Error procesando SVG:', error.message);
      console.error('🗺️ Error completo:', error);
    }
  }

  // Log final de qué se va a renderizar
  console.log(`🗺️ [5] Marker "${business.name}": usará ${hasSvgIcon ? 'SVG' : 'EMOJI'} (${hasSvgIcon ? 'SVG válido' : business.emoji})`);

  const html = renderToStaticMarkup(
    <div className="flex flex-col items-center cursor-pointer">
      {/* Burbuja rectangular con punta */}
      <div className="relative" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))' }}>
        {/* Burbuja blanca rectangular redondeada */}
        <div className="bg-white rounded-2xl px-1.5 py-1 flex items-center gap-1.5 border border-gray-200">
          {/* Círculo rojo con icono (emoji o SVG) - con indicador de abierto */}
          <div className="relative w-7 h-7 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            {hasSvgIcon && svgDataUrl ? (
              <img
                src={svgDataUrl}
                alt=""
                width="16"
                height="16"
                style={{
                  width: '16px',
                  height: '16px',
                  filter: 'brightness(0) invert(1)',
                  display: 'block'
                }}
              />
            ) : (
              <span className="text-sm leading-none">{business.emoji}</span>
            )}
            {/* Indicador de abierto - estilo WhatsApp en el círculo rojo */}
            {business.isOpen && (
              <div
                className="absolute w-2.5 h-2.5 bg-green-500 rounded-full border-[1.5px] border-white"
                style={{ bottom: '-2px', right: '-2px' }}
              />
            )}
          </div>

          {/* Rating con estrella */}
          <div className="flex items-center gap-0.5 pr-0.5">
            <span className="text-amber-500 text-[9px]">★</span>
            <span className="text-[10px] font-bold text-gray-700">{rating}</span>
          </div>

          {/* Badge de descuento */}
          {business.discount && (
            <div className="absolute -top-1.5 -left-1 bg-amber-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full">
              -{business.discount}%
            </div>
          )}
        </div>

        {/* Punta del pin (triángulo) */}
        <div className="flex justify-center -mt-[1px]">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '8px solid white',
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))',
            }}
          />
        </div>
      </div>

      {/* Nombre del negocio - fuera de la burbuja */}
      <div className="mt-0.5 px-1.5 py-0.5 bg-white/90 rounded shadow-sm">
        <p className="text-[9px] font-semibold text-gray-700 whitespace-nowrap text-center">
          {displayName}
        </p>
      </div>
    </div>
  );

  const icon = L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [78, 62],
    iconAnchor: [39, 47],
  });

  iconCache.set(cacheKey, icon);
  return icon;
};

// 🎨 Cluster minimalista estilo Google
const createClusterIcon = (count) => {
  const cacheKey = `cluster-${count}`;
  const cached = iconCache.get(cacheKey);
  if (cached) return cached;

  // Tamaños ligeramente aumentados ~5%
  const size = count < 10 ? 34 : count < 50 ? 40 : 46;

  const html = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      {/* Sombra */}
      <div
        className="absolute w-full h-2 bg-black/15 rounded-full blur-sm"
        style={{ bottom: -4 }}
      />
      {/* Círculo del cluster */}
      <div
        className="bg-red-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white"
        style={{ width: size, height: size }}
      >
        <span className="text-white font-bold" style={{ fontSize: size / 2.5 }}>
          {count}
        </span>
      </div>
    </div>
  );

  const icon = L.divIcon({
    html,
    className: 'cluster-marker',
    iconSize: [size, size + 4],
    iconAnchor: [size / 2, size / 2],
  });

  iconCache.set(cacheKey, icon);
  return icon;
};

// 🗺️ Componente para centrar el mapa (memoizado)
const MapUpdater = memo(function MapUpdater({ userLocation, initialBusiness }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation && !initialBusiness) {
      map.setView([userLocation.lat, userLocation.lng], 16, { animate: true, duration: 1 });
    }
  }, [userLocation, map, initialBusiness]);

  return null;
});

// 🗺️ Markers con clustering (memoizado para evitar re-renders)
const MapMarkers = memo(function MapMarkers({ businesses, onBusinessClick, onClusterClick }) {
  const map = useMap();
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(13);

  // Handlers memoizados
  const handleMoveEnd = useCallback(() => {
    setBounds(map.getBounds());
    setZoom(Math.round(map.getZoom()));
  }, [map]);

  useMapEvents({
    moveend: handleMoveEnd,
  });

  useEffect(() => {
    setBounds(map.getBounds());
    setZoom(Math.round(map.getZoom()));
  }, [map]);

  // Instancia de Supercluster memoizada
  const supercluster = useMemo(() => {
    const sc = new Supercluster({
      radius: MAP_CONFIG.clusterRadius,
      maxZoom: MAP_CONFIG.maxZoom,
    });
    sc.load(businesses);
    return sc;
  }, [businesses]);

  // Clusters visibles memoizados
  const clusters = useMemo(() => {
    if (!bounds || !businesses.length) return [];

    const result = supercluster.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      zoom
    );

    // 🔍 DEBUG: Log de clusters y puntos visibles
    console.log('🗺️ ════════════ CLUSTERING ════════════');
    console.log(`🗺️ [CLUSTER] Zoom actual: ${zoom}`);
    console.log(`🗺️ [CLUSTER] Bounds: W=${bounds.getWest().toFixed(4)}, S=${bounds.getSouth().toFixed(4)}, E=${bounds.getEast().toFixed(4)}, N=${bounds.getNorth().toFixed(4)}`);
    console.log(`🗺️ [CLUSTER] Total negocios en businesses: ${businesses.length}`);
    console.log(`🗺️ [CLUSTER] Elementos visibles (clusters + puntos): ${result.length}`);

    // Separar clusters de puntos individuales
    const clustersOnly = result.filter(r => r.properties.cluster);
    const pointsOnly = result.filter(r => !r.properties.cluster);

    console.log(`🗺️ [CLUSTER] - Clusters: ${clustersOnly.length}`);
    console.log(`🗺️ [CLUSTER] - Puntos individuales: ${pointsOnly.length}`);

    // Log de cada elemento
    result.forEach((item, idx) => {
      const [lng, lat] = item.geometry.coordinates;
      if (item.properties.cluster) {
        // Es un cluster - ver qué negocios contiene
        const leaves = supercluster.getLeaves(item.properties.cluster_id, Infinity);
        const svgInCluster = leaves.filter(l => l.properties.iconType === 'svg');
        console.log(`🗺️ [${idx}] CLUSTER con ${item.properties.point_count} puntos en [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
        if (svgInCluster.length > 0) {
          console.log(`🗺️   ⚠️ CONTIENE ${svgInCluster.length} NEGOCIO(S) SVG:`);
          svgInCluster.forEach(s => {
            console.log(`🗺️      - "${s.properties.name}" (ID: ${s.properties.id})`);
          });
        }
      } else {
        // Es un punto individual
        const isSvg = item.properties.iconType === 'svg';
        console.log(`🗺️ [${idx}] PUNTO: "${item.properties.name}" (${isSvg ? '🎨 SVG' : '😀 EMOJI'}) en [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
      }
    });

    // Buscar específicamente "Pizza Don Luigi"
    const pizzaDonLuigi = businesses.find(b => b.properties.name?.includes('Pizza Don Luigi') || b.properties.name?.includes('Don Luigi'));
    if (pizzaDonLuigi) {
      const [lng, lat] = pizzaDonLuigi.geometry.coordinates;
      const inBounds = bounds.contains([lat, lng]);
      console.log(`🗺️ 🍕 BUSCANDO "Pizza Don Luigi":`);
      console.log(`🗺️   - Coordenadas: [${lat}, ${lng}]`);
      console.log(`🗺️   - ¿Dentro del área visible?: ${inBounds ? '✅ SÍ' : '❌ NO'}`);
      console.log(`🗺️   - iconType: ${pizzaDonLuigi.properties.iconType}`);
    }

    console.log('🗺️ ══════════════════════════════════════');

    return result;
  }, [supercluster, bounds, zoom, businesses.length]);

  // Handlers memoizados para los markers
  const handleClusterClick = useCallback((lat, lng) => {
    onClusterClick(lat, lng);
  }, [onClusterClick]);

  const handleBusinessClick = useCallback((business, lat, lng) => {
    onBusinessClick(business, lat, lng);
  }, [onBusinessClick]);

  // 🔍 DEBUG: Log una vez cuando se van a renderizar los markers
  if (clusters.length > 0) {
    console.log(`🗺️ [RENDER] Renderizando ${clusters.length} elementos en el mapa`);
  }

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
            click: () => handleClusterClick(lat, lng),
          }}
        />
      );
    }

    // 🔍 DEBUG: Log solo para negocios SVG cuando se crea su marker
    if (cluster.properties.iconType === 'svg') {
      console.log(`🗺️ [RENDER] 🎨 Creando marker SVG para: "${cluster.properties.name}"`);
    }

    return (
      <Marker
        key={cluster.properties.id}
        position={[lat, lng]}
        icon={createMarkerIcon(cluster.properties)}
        eventHandlers={{
          click: () => handleBusinessClick(cluster.properties, lat, lng),
        }}
      />
    );
  });
});

// 🎯 Helper para construir URL de imágenes (fuera del componente)
const buildImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `https://${path}`;
};

// 🎯 Componente principal (memoizado para evitar re-renders innecesarios)
const HomeMap = memo(function HomeMap({
  selectedCategory,
  type = "comida",
  onBusinessOpen,
  initialBusiness,
  onMapReady,
}) {
  const [mapRef, setMapRef] = useState(null);

  // Usar hook de geolocalización
  const { location: userLocation } = useGeolocation({
    fallback: DEFAULT_LOCATION
  });

  // Usar hook de negocios
  const { businesses: rawBusinesses } = useBusinesses(type);

  // Convertir negocios a formato GeoJSON para el mapa (memoizado)
  const businesses = useMemo(() => {
    console.log('🗺️ ═══════════════════════════════════════════════════');
    console.log('🗺️ [PIPELINE] Total negocios del API:', rawBusinesses.length);

    // 🔍 DEBUG: Identificar negocios con SVG y sus coordenadas
    const svgBusinesses = rawBusinesses.filter(b => b.iconType === 'svg');
    if (svgBusinesses.length > 0) {
      console.log('🗺️ [PIPELINE] Negocios con iconType=svg:', svgBusinesses.length);
      svgBusinesses.forEach(b => {
        const hasCoords = b.location?.coordinates &&
                         Array.isArray(b.location.coordinates) &&
                         b.location.coordinates.length === 2;
        console.log(`🗺️ [SVG BUSINESS] "${b.name}" (ID: ${b._id})`);
        console.log(`🗺️   - Tiene coordenadas válidas: ${hasCoords ? '✅ SÍ' : '❌ NO'}`);
        console.log(`🗺️   - location:`, b.location);
        console.log(`🗺️   - iconSvg existe: ${b.iconSvg ? '✅ SÍ (' + b.iconSvg.length + ' chars)' : '❌ NO'}`);
      });
    }

    // 🔍 DEBUG: Identificar negocios filtrados por coordenadas
    const businessesWithoutCoords = rawBusinesses.filter(b => {
      const hasCoords = b.location?.coordinates &&
                       Array.isArray(b.location.coordinates) &&
                       b.location.coordinates.length === 2;
      return !hasCoords;
    });

    if (businessesWithoutCoords.length > 0) {
      console.log('🗺️ [PIPELINE] ⚠️ Negocios SIN coordenadas (serán filtrados):', businessesWithoutCoords.length);
      businessesWithoutCoords.forEach(b => {
        console.log(`🗺️   - "${b.name}" (iconType: ${b.iconType || 'emoji'})`);
      });
    }

    const points = rawBusinesses
      .filter(b => {
        const hasCoords = b.location?.coordinates &&
                         Array.isArray(b.location.coordinates) &&
                         b.location.coordinates.length === 2;
        return hasCoords;
      })
      .map(b => ({
        type: "Feature",
        properties: {
          id: b._id,
          name: b.name,
          emoji: b.mapIcon || b.emoji || DEFAULT_BUSINESS_EMOJI[type] || '🏪',
          iconType: b.iconType || 'emoji',
          iconSvg: b.iconSvg || null,
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
          paymentMethods: b.paymentMethods,
          brandColor: b.brandColor,
        },
        geometry: {
          type: "Point",
          coordinates: b.location.coordinates,
        },
      }));

    // 🔍 DEBUG: Log final de negocios procesados
    console.log('🗺️ [PIPELINE] Negocios con coordenadas válidas (GeoJSON):', points.length);
    const svgPoints = points.filter(p => p.properties.iconType === 'svg');
    console.log('🗺️ [PIPELINE] De estos, con iconType=svg:', svgPoints.length);
    if (svgPoints.length > 0) {
      svgPoints.forEach(p => {
        console.log(`🗺️ [SVG EN GEOJSON] "${p.properties.name}" - iconSvg: ${p.properties.iconSvg ? '✅' : '❌'}`);
      });
    }
    console.log('🗺️ ═══════════════════════════════════════════════════');

    return points;
  }, [rawBusinesses, type]);

  // Filtrar negocios según la categoría seleccionada (memoizado)
  const filteredBusinesses = useMemo(() => {
    if (!selectedCategory) {
      return businesses;
    }
    return businesses.filter(b => b.properties.categorySlug === selectedCategory);
  }, [businesses, selectedCategory]);

  // 🎯 Handle business click (memoizado)
  const handleBusinessClick = useCallback((business, lat, lng) => {
    const businessData = {
      id: business.id,
      name: business.name,
      rating: business.rating,
      category: business.categoryName || 'Sin categoría',
      categorySlug: business.categorySlug,
      logo: buildImageUrl(business.logo),
      banner: buildImageUrl(business.banner),
      deliveryTime: business.deliveryTime || '30-40 min',
      deliveryCost: business.deliveryCost || 25,
      minOrderAmount: business.minOrderAmount || 50,
      isOpen: business.isOpen,
      emoji: business.emoji,
      paymentMethods: business.paymentMethods,
      brandColor: business.brandColor,
    };

    onBusinessOpen?.(businessData);

    if (mapRef) {
      mapRef.setView([lat, lng], 16, { animate: true });
    }
  }, [onBusinessOpen, mapRef]);

  // 🎯 Handle cluster click (memoizado)
  const handleClusterClick = useCallback((lat, lng) => {
    if (mapRef) {
      mapRef.setView([lat, lng], mapRef.getZoom() + 2, { animate: true });
    }
  }, [mapRef]);

  // 🎯 Recentrar mapa (memoizado)
  const handleRecenter = useCallback(() => {
    if (mapRef && userLocation) {
      mapRef.setView([userLocation.lat, userLocation.lng], 16, { animate: true, duration: 0.5 });
    }
  }, [mapRef, userLocation]);

  // Exponer funciones del mapa al componente padre
  useEffect(() => {
    if (onMapReady) {
      onMapReady({
        recenter: handleRecenter,
        hasUserLocation: !!userLocation,
      });
    }
  }, [userLocation, handleRecenter, onMapReady]);

  // Centro inicial del mapa (memoizado)
  const initialCenter = useMemo(() => {
    return userLocation
      ? [userLocation.lat, userLocation.lng]
      : [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng];
  }, [userLocation]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <MapContainer
        center={initialCenter}
        zoom={MAP_CONFIG.defaultZoom}
        className="absolute inset-0"
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
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationIcon()}
              zIndexOffset={1000}
            />
            <Circle
              center={[userLocation.lat, userLocation.lng]}
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

      <style>{`
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

        /* Animación de pulso para ubicación del usuario */
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
});

export default HomeMap;
