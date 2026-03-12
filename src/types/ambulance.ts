export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TrafficSignal {
  id: string;
  position: Coordinates;
  status: 'red' | 'green' | 'amber';
  name: string;
}

export interface AmbulanceState {
  id: string;
  position: Coordinates;
  speed: number;
  status: 'idle' | 'moving' | 'stopped';
  destination: Coordinates | null;
  source: Coordinates | null;
}

export interface Alert {
  id: string;
  type: 'high_priority' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  signalId?: string;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}
