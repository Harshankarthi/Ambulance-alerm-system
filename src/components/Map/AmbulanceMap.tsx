import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinates } from '@/types/ambulance';
import { AmbulanceState, TrafficSignal, RoutePoint } from '@/types/ambulance';
import { PoliceStation } from '@/hooks/useAmbulanceSimulation';

// Custom ambulance icon
const ambulanceIcon = new L.DivIcon({
  className: 'ambulance-marker',
  html: `
    <div style="
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #dc2626, #991b1b);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 0 20px rgba(220, 38, 38, 0.8);
      animation: pulse 1s ease-in-out infinite;
    ">
      <span style="font-size: 18px;">🚑</span>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(220, 38, 38, 0.8); transform: scale(1); }
        50% { box-shadow: 0 0 40px rgba(220, 38, 38, 1); transform: scale(1.05); }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Traffic signal icons
const createSignalIcon = (status: 'red' | 'green' | 'amber') => {
  const colors = {
    red: { bg: '#dc2626', shadow: 'rgba(220, 38, 38, 0.8)' },
    green: { bg: '#22c55e', shadow: 'rgba(34, 197, 94, 0.8)' },
    amber: { bg: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.8)' },
  };

  return new L.DivIcon({
    className: 'signal-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${colors[status].bg};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 15px ${colors[status].shadow};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="font-size: 14px;">🚦</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Police station icon
const policeIcon = new L.DivIcon({
  className: 'police-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 0 15px rgba(2, 132, 199, 0.6);
    ">
      <span style="font-size: 16px;">🚔</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Destination icon
const destinationIcon = new L.DivIcon({
  className: 'destination-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
    ">
      <span style="font-size: 16px;">🏥</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Source icon
const sourceIcon = new L.DivIcon({
  className: 'source-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
    ">
      <span style="font-size: 14px;">📍</span>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface MapUpdaterProps {
  center: [number, number];
  follow: boolean;
}

function MapUpdater({ center, follow }: MapUpdaterProps) {
  const map = useMap();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      map.setView(center, 15);
      initializedRef.current = true;
    } else if (follow) {
      map.panTo(center, { animate: true, duration: 0.5 });
    }
  }, [center, map, follow]);

  return null;
}

async function reverseGeocode(coords: Coordinates): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
    const data = await res.json();
    return data.display_name?.split(',').slice(0, 2).join(',') || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
  } catch {
    return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
  }
}

type ClickMode = 'source' | 'destination' | null;

function MapClickHandler({ onClick }: { onClick: (coords: Coordinates) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

interface AmbulanceMapProps {
  ambulance: AmbulanceState;
  signals: TrafficSignal[];
  routePoints: RoutePoint[];
  policeStations?: PoliceStation[];
  followAmbulance?: boolean;
  onMapClickSource?: (coords: Coordinates, name: string) => void;
  onMapClickDestination?: (coords: Coordinates, name: string) => void;
  isDispatched?: boolean;
}

export function AmbulanceMap({ ambulance, signals, routePoints, policeStations = [], followAmbulance = true, onMapClickSource, onMapClickDestination, isDispatched }: AmbulanceMapProps) {
  const routeLatLngs: [number, number][] = routePoints.map((p) => [p.lat, p.lng]);
  const [clickMode, setClickMode] = useState<ClickMode>(null);

  const handleMapClick = async (coords: Coordinates) => {
    if (!clickMode || isDispatched) return;
    const name = await reverseGeocode(coords);
    if (clickMode === 'source') {
      onMapClickSource?.(coords, name);
    } else {
      onMapClickDestination?.(coords, name);
    }
    setClickMode(null);
  };

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[ambulance.position.lat, ambulance.position.lng]}
        zoom={15}
        className="h-full w-full"
        zoomControl={true}
      >
        <MapClickHandler onClick={handleMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapUpdater
          center={[ambulance.position.lat, ambulance.position.lng]}
          follow={followAmbulance && ambulance.status === 'moving'}
        />

        {/* Route line */}
        <Polyline
          positions={routeLatLngs}
          pathOptions={{
            color: '#3b82f6',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10',
          }}
        />

        {/* Traveled path */}
        {routeLatLngs.slice(0, routeLatLngs.findIndex(
          (p) => p[0] === ambulance.position.lat && p[1] === ambulance.position.lng
        ) + 1).length > 0 && (
            <Polyline
              positions={routeLatLngs.slice(0, routeLatLngs.findIndex(
                (p) => p[0] === ambulance.position.lat && p[1] === ambulance.position.lng
              ) + 1)}
              pathOptions={{
                color: '#22c55e',
                weight: 5,
                opacity: 1,
              }}
            />
          )}

        {/* Source marker */}
        <Marker position={[routePoints[0].lat, routePoints[0].lng]} icon={sourceIcon}>
          <Popup>
            <div className="text-center">
              <strong>Pickup Location</strong>
              <br />
              Emergency Call Origin
            </div>
          </Popup>
        </Marker>

        {/* Destination marker */}
        <Marker
          position={[routePoints[routePoints.length - 1].lat, routePoints[routePoints.length - 1].lng]}
          icon={destinationIcon}
        >
          <Popup>
            <div className="text-center">
              <strong>City Hospital</strong>
              <br />
              Emergency Department
            </div>
          </Popup>
        </Marker>

        {/* Traffic signals */}
        {signals.map((signal) => (
          <Marker
            key={signal.id}
            position={[signal.position.lat, signal.position.lng]}
            icon={createSignalIcon(signal.status)}
          >
            <Popup>
              <div className="text-center">
                <strong>{signal.name}</strong>
                <br />
                Status: <span style={{
                  color: signal.status === 'green' ? '#22c55e' :
                    signal.status === 'amber' ? '#f59e0b' : '#dc2626',
                  fontWeight: 'bold'
                }}>
                  {signal.status.toUpperCase()}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Police Stations */}
        {policeStations.map((station) => (
          <Marker
            key={station.id}
            position={[station.position.lat, station.position.lng]}
            icon={policeIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>{station.name}</strong>
                <br />
                Traffic Police Control
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Ambulance marker */}
        <Marker position={[ambulance.position.lat, ambulance.position.lng]} icon={ambulanceIcon}>
          <Popup>
            <div className="text-center">
              <strong>{ambulance.id}</strong>
              <br />
              Speed: {ambulance.speed} km/h
              <br />
              Status: {ambulance.status.toUpperCase()}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Click mode buttons */}
      {!isDispatched && (onMapClickSource || onMapClickDestination) && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          <button
            onClick={() => setClickMode(clickMode === 'source' ? null : 'source')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shadow-md transition-all ${clickMode === 'source'
                ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                : 'bg-background text-foreground border border-border hover:bg-secondary'
              }`}
          >
            📍 {clickMode === 'source' ? 'Click map...' : 'Set Pickup'}
          </button>
          <button
            onClick={() => setClickMode(clickMode === 'destination' ? null : 'destination')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shadow-md transition-all ${clickMode === 'destination'
                ? 'bg-green-500 text-white ring-2 ring-green-300'
                : 'bg-background text-foreground border border-border hover:bg-secondary'
              }`}
          >
            🏥 {clickMode === 'destination' ? 'Click map...' : 'Set Hospital'}
          </button>
        </div>
      )}

      {clickMode && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-background/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 text-xs text-foreground shadow-lg">
          Click on the map to set {clickMode === 'source' ? 'pickup' : 'hospital'} location
        </div>
      )}
    </div>
  );
}
