import { useState, useCallback, useRef, useEffect } from 'react';
import { AmbulanceState, Coordinates, TrafficSignal, Alert, RoutePoint } from '@/types/ambulance';
import { useLocationTracking } from './useLocationTracking';

// Predefined route through a city simulation
const ROUTE_POINTS: RoutePoint[] = [
  { lat: 12.9716, lng: 77.5946 },
  { lat: 12.9720, lng: 77.5960 },
  { lat: 12.9725, lng: 77.5975 },
  { lat: 12.9730, lng: 77.5990 },
  { lat: 12.9738, lng: 77.6005 },
  { lat: 12.9745, lng: 77.6020 },
  { lat: 12.9755, lng: 77.6035 },
  { lat: 12.9765, lng: 77.6050 },
  { lat: 12.9778, lng: 77.6065 },
  { lat: 12.9790, lng: 77.6080 },
  { lat: 12.9805, lng: 77.6095 },
  { lat: 12.9820, lng: 77.6110 },
];

const INITIAL_SIGNALS: TrafficSignal[] = [
  { id: 'sig-1', position: { lat: 12.9725, lng: 77.5975 }, status: 'red', name: 'MG Road Junction' },
  { id: 'sig-2', position: { lat: 12.9745, lng: 77.6020 }, status: 'red', name: 'Brigade Road Cross' },
  { id: 'sig-3', position: { lat: 12.9778, lng: 77.6065 }, status: 'red', name: 'Church Street Signal' },
  { id: 'sig-4', position: { lat: 12.9805, lng: 77.6095 }, status: 'red', name: 'Trinity Circle' },
];

const SIGNAL_CLEARANCE_DISTANCE = 0.0045; // ~500m (1 degree ≈ 111km)

// Generate exactly 4 signals, spaced evenly up to a maximum of 10km apart
export function generateSignals(route: RoutePoint[]): TrafficSignal[] {
  if (route.length < 2) return [];
  const signals: TrafficSignal[] = [];

  let totalDist = 0;
  const dists = [0];
  for (let i = 0; i < route.length - 1; i++) {
    const d = Math.sqrt(Math.pow(route[i].lat - route[i + 1].lat, 2) + Math.pow(route[i].lng - route[i + 1].lng, 2));
    totalDist += d;
    dists.push(totalDist);
  }

  const MAX_INTERVAL_DEG = 10 / 111; // 10km in degrees
  const TARGET_SIGNALS = 4;

  // Calculate interval to evenly space exactly TARGET_SIGNALS
  // It should not exceed MAX_INTERVAL_DEG (10km)
  let INTERVAL_DEG = Math.min(MAX_INTERVAL_DEG, totalDist / (TARGET_SIGNALS + 1));

  let currentTarget = INTERVAL_DEG;
  let count = 1;

  while (currentTarget < totalDist - 0.000001 && count <= TARGET_SIGNALS) {
    let segIdx = 0;
    while (segIdx < dists.length - 2 && dists[segIdx + 1] < currentTarget) {
      segIdx++;
    }
    const p1 = route[segIdx];
    const p2 = route[segIdx + 1];
    const segStartDist = dists[segIdx];
    const segTotalDist = dists[segIdx + 1] - segStartDist;
    const progress = segTotalDist === 0 ? 0 : (currentTarget - segStartDist) / segTotalDist;

    const lat = p1.lat + (p2.lat - p1.lat) * progress;
    const lng = p1.lng + (p2.lng - p1.lng) * progress;

    signals.push({
      id: `sig-${count}`,
      position: { lat, lng },
      status: 'red',
      name: `Junction ${count}`,
      pathDist: currentTarget // Store the accumulated distance along the route
    } as any);

    count++;
    currentTarget += INTERVAL_DEG;
  }

  return signals;
}

export interface PoliceStation {
  id: string;
  name: string;
  position: Coordinates;
}

// Generate 2 police stations along the route
export function generatePoliceStations(route: RoutePoint[]): PoliceStation[] {
  if (route.length < 2) return [];
  return [
    {
      id: 'ps-1',
      name: 'Traffic Division HQ',
      position: {
        lat: route[Math.floor(route.length * 0.2)].lat + 0.001,
        lng: route[Math.floor(route.length * 0.2)].lng + 0.001,
      }
    },
    {
      id: 'ps-2',
      name: 'Highway Patrol Checkpoint',
      position: {
        lat: route[Math.floor(route.length * 0.8)].lat - 0.001,
        lng: route[Math.floor(route.length * 0.8)].lng + 0.001,
      }
    }
  ];
}

export interface AudioCallbacks {
  onDispatch?: () => void;
  onStop?: () => void;
  onSignalCleared?: () => void;
  onSignalApproaching?: () => void;
  onDestinationReached?: () => void;
}

export interface NotificationCallbacks {
  onDispatch?: () => void;
  onSignalApproaching?: (signalName: string) => void;
  onDestinationReached?: () => void;
}

export function useAmbulanceSimulation(audioCallbacks?: AudioCallbacks, notificationCallbacks?: NotificationCallbacks, customRoutePoints?: RoutePoint[]) {
  const activeRoutePoints = customRoutePoints && customRoutePoints.length >= 2 ? customRoutePoints : ROUTE_POINTS;

  const [ambulance, setAmbulance] = useState<AmbulanceState>({
    id: 'AMB-001',
    position: activeRoutePoints[0],
    speed: 0,
    status: 'idle',
    source: activeRoutePoints[0],
    destination: activeRoutePoints[activeRoutePoints.length - 1],
  });

  const [signals, setSignals] = useState<TrafficSignal[]>(() => generateSignals(activeRoutePoints));
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>(() => generatePoliceStations(activeRoutePoints));
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isDispatched, setIsDispatched] = useState(false);
  
  // Supabase Tracking
  const { startTrip, logLocation, endTrip } = useLocationTracking();
  const tripMetadataRef = useRef<{ tripId: string, sessionId: string } | null>(null);
  const lastLogTimeRef = useRef<number>(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCallbacksRef = useRef(audioCallbacks);
  const notificationCallbacksRef = useRef(notificationCallbacks);

  // Update when custom route changes
  useEffect(() => {
    if (!isDispatched) {
      const pts = activeRoutePoints;
      setAmbulance({
        id: 'AMB-001',
        position: pts[0],
        speed: 0,
        status: 'idle',
        source: pts[0],
        destination: pts[pts.length - 1],
      });
      setSignals(generateSignals(pts));
      setPoliceStations(generatePoliceStations(pts));
      setCurrentSegmentIndex(0);
      setSegmentProgress(0);
      setAlerts([]);
    }
  }, [customRoutePoints]); // eslint-disable-line react-hooks/exhaustive-deps

  const addAlert = useCallback((type: Alert['type'], message: string, signalId?: string) => {
    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
      signalId,
    };
    setAlerts((prev) => [newAlert, ...prev].slice(0, 10));
  }, []);

  useEffect(() => {
    audioCallbacksRef.current = audioCallbacks;
    notificationCallbacksRef.current = notificationCallbacks;

    try {
      const channel = new BroadcastChannel('smart_ambulance_channel');
      channel.onmessage = (event) => {
        if (event.data.type === 'SIGNAL_OVERRIDE') {
          const { signalId, status } = event.data.payload;
          setSignals((prev) =>
            prev.map((s) => s.id === signalId ? { ...s, status } : s)
          );
          addAlert('high_priority', `👮 POLICE OVERRIDE: ${signalId.toUpperCase()} set to ${status.toUpperCase()}`);
        }
      };
      return () => channel.close();
    } catch (e) {
      console.error("BroadcastChannel failed", e);
    }
  }, [audioCallbacks, notificationCallbacks, addAlert]);

  const calculateDistance = (pos1: Coordinates, pos2: Coordinates) => {
    return Math.sqrt(
      Math.pow(pos1.lat - pos2.lat, 2) + Math.pow(pos1.lng - pos2.lng, 2)
    );
  };

  const [isAutoGreenEnabled, setIsAutoGreenEnabled] = useState(true);

  const toggleAutoGreen = useCallback(() => {
    setIsAutoGreenEnabled((prev) => !prev);
    // If turning OFF, we might want to reset signals to red or keep them as is. 
    // For now, let's just toggle the logic for future updates.
    if (isAutoGreenEnabled) {
      addAlert('warning', '⚠️ Auto-Green Signal Clearance FAILURE SIMULATION active');
    } else {
      addAlert('info', '✅ Auto-Green Signal Clearance reactivated');
    }
  }, [isAutoGreenEnabled, addAlert]);

  const updateSignals = useCallback((ambulancePos: Coordinates, currentIdx: number, progress: number) => {
    // Calculate how far the ambulance has travelled along the total route
    let totalAmbulancePathDist = 0;
    const pts = activeRoutePoints;

    // Sum up distances of completed segments
    for (let i = 0; i < currentIdx; i++) {
      totalAmbulancePathDist += calculateDistance(pts[i], pts[i + 1]);
    }
    // Add progress in the current segment
    if (currentIdx < pts.length - 1) {
      totalAmbulancePathDist += calculateDistance(pts[currentIdx], pts[currentIdx + 1]) * progress;
    }

    setSignals((prevSignals) => {
      return prevSignals.map((signal: any) => {
        const distance = calculateDistance(ambulancePos, signal.position);
        const signalPathDist = signal.pathDist || 0;

        // Case 1: Past the signal (Ambulance has crossed it)
        // We use a small buffer (0.0005 degrees ~ 50m) to ensure it's fully crossed
        if (totalAmbulancePathDist > signalPathDist + 0.0005) {
          if (signal.status === 'green' || signal.status === 'amber') {
            addAlert('info', `🚥 ${signal.name} - CROSSING COMPLETED: Signal Reset to Red`);
            updateSignalOnBackend(signal.id, 'red');
            return { ...signal, status: 'red' as const };
          }
          return signal;
        }

        // Case 2: Within 500m - Approaching Junction
        if (distance < SIGNAL_CLEARANCE_DISTANCE) {
          if (signal.status !== 'green' && isAutoGreenEnabled) {
            addAlert('high_priority', `🚨 ${signal.name} - 500M RANGE: GREEN SIGNAL CLEARED`, signal.id);
            audioCallbacksRef.current?.onSignalCleared?.();
            updateSignalOnBackend(signal.id, 'green');
            return { ...signal, status: 'green' as const };
          }
        }

        return signal;
      });
    });
  }, [addAlert, isAutoGreenEnabled, activeRoutePoints]);

  const startDispatch = useCallback(async () => {
    if (isDispatched) return;

    setIsDispatched(true);
    setCurrentSegmentIndex(0);
    setSegmentProgress(0);
    setAmbulance((prev) => ({
      ...prev,
      position: activeRoutePoints[0],
      status: 'moving',
      speed: 0,
    }));
    setSignals(generateSignals(activeRoutePoints));
    addAlert('high_priority', '🚑 AMBULANCE DISPATCHED - Emergency Response Initiated');
    addAlert('info', '📡 Broadcasting clearance request to all traffic signals');
    audioCallbacksRef.current?.onDispatch?.();
    notificationCallbacksRef.current?.onDispatch?.();

    // Start Supabase Trip
    const meta = await startTrip(activeRoutePoints[0], activeRoutePoints[activeRoutePoints.length - 1]);
    if (meta) {
      tripMetadataRef.current = meta;
    }
  }, [isDispatched, addAlert, activeRoutePoints, startTrip]);

  const stopDispatch = useCallback(() => {
    setIsDispatched(false);

    // End Supabase Trip
    if (tripMetadataRef.current) {
      endTrip(tripMetadataRef.current.tripId);
      tripMetadataRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAmbulance((prev) => ({
      ...prev,
      status: 'stopped',
      speed: 0,
    }));
    addAlert('warning', '🛑 Ambulance stopped - Dispatch halted');
    audioCallbacksRef.current?.onStop?.();
  }, [addAlert]);

  const resetSimulation = useCallback(() => {
    setIsDispatched(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentSegmentIndex(0);
    setSegmentProgress(0);
    setAmbulance({
      id: 'AMB-001',
      position: activeRoutePoints[0],
      speed: 0,
      status: 'idle',
      source: activeRoutePoints[0],
      destination: activeRoutePoints[activeRoutePoints.length - 1],
    });
    setSignals(generateSignals(activeRoutePoints));
    setAlerts([]);
    audioCallbacksRef.current?.onStop?.();
  }, [activeRoutePoints]);

  // State for smooth animation
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentProgress, setSegmentProgress] = useState(0); // 0.0 to 1.0

  useEffect(() => {
    if (!isDispatched) return;

    const UPDATE_INTERVAL_MS = 50;
    const SPEED_KMH = 6000; // Increased speed for demo purposes (6000 km/h scale) to make it visible across 500km
    // NOTE: Real 60km/h on a 500km route would take 8+ hours. 
    // For demo "medium" speed:
    // If we want it to take ~1 minute to cross:
    // 500km / (1/60 hr) = 30,000 km/h virtual speed.
    // Let's try a scale that feels "medium" - fast enough to watch, slow enough to see signals.

    // Use a fixed virtual speed for a consistent "medium-to-fast" feel
    const SPEED_DEG_PER_SEC = 0.003; // Approx 1200km/h virtual speed


    intervalRef.current = setInterval(() => {
      setSegmentProgress((prevProgress) => {
        const currentP1 = activeRoutePoints[currentSegmentIndex];
        const currentP2 = activeRoutePoints[currentSegmentIndex + 1];

        if (!currentP1 || !currentP2) return prevProgress;

        const segmentDist = calculateDistance(currentP1, currentP2);

        // Avoid division by zero
        if (segmentDist <= 0.000001) {
          setCurrentSegmentIndex(prev => prev + 1);
          return 0;
        }

        // Distance to travel this tick
        const distToTravel = SPEED_DEG_PER_SEC * (UPDATE_INTERVAL_MS / 1000);

        // Progress increment for this segment
        const progressIncrement = distToTravel / segmentDist;

        let newProgress = prevProgress + progressIncrement;

        if (newProgress >= 1.0) {
          // Move to next segment
          setCurrentSegmentIndex((prevIdx) => {
            const nextIdx = prevIdx + 1;
            if (nextIdx >= activeRoutePoints.length - 1) {
              // End of route
              setIsDispatched(false);
              setAmbulance((prev) => ({
                ...prev,
                status: 'idle',
                speed: 0,
              }));
              addAlert('high_priority', '✅ DESTINATION REACHED - Patient pickup complete');
              audioCallbacksRef.current?.onDestinationReached?.();
              notificationCallbacksRef.current?.onDestinationReached?.();
              if (intervalRef.current) clearInterval(intervalRef.current);
              return prevIdx;
            }
            return nextIdx;
          });
          return 0; // Reset progress for new segment
        }

        // Interpolate position
        const newLat = currentP1.lat + (currentP2.lat - currentP1.lat) * newProgress;
        const newLng = currentP1.lng + (currentP2.lng - currentP1.lng) * newProgress;

        const newPosition = { lat: newLat, lng: newLng };

        setAmbulance((prev) => {
          const nextAmbulance = {
            ...prev,
            position: newPosition,
            speed: 60,
            status: 'moving' as const,
          };

          // Broadcast to other tabs (like Police Interface)
          const channel = new BroadcastChannel('smart_ambulance_channel');
          channel.postMessage({ type: 'AMBULANCE_POSITION_UPDATE', payload: nextAmbulance });
          
          // Force push the latest signal state down the channel for remote maps
          setSignals((currentSignals) => {
             channel.postMessage({ type: 'SIGNALS_UPDATE', payload: currentSignals });
             channel.close();
             return currentSignals;
          });

          return nextAmbulance;
        });

        updateSignals(newPosition, currentSegmentIndex, newProgress);

        // Periodically sync with backend (Python API)
        // Throttle to avoid over-spamming (e.g., every ~1 second of simulation time)
        if (Math.random() < 0.05) { // Roughly every 20 ticks = 1 second
          updateAmbulanceOnBackend(newPosition, 60, 'moving');
        }

        // Log to Supabase every 5 seconds
        const now = Date.now();
        if (now - lastLogTimeRef.current > 5000 && tripMetadataRef.current) {
          logLocation(
            tripMetadataRef.current.tripId,
            tripMetadataRef.current.sessionId,
            newPosition,
            60
          );
          lastLogTimeRef.current = now;
        }

        return newProgress;
      });
    }, UPDATE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isDispatched, updateSignals, addAlert, activeRoutePoints, currentSegmentIndex, updateAmbulanceOnBackend]);

  return {
    ambulance,
    signals,
    policeStations,
    alerts,
    routePoints: activeRoutePoints,
    isDispatched,
    progress: ((currentSegmentIndex + segmentProgress) / (activeRoutePoints.length - 1)) * 100,
    startDispatch,
    stopDispatch,
    resetSimulation,
    isAutoGreenEnabled,
    toggleAutoGreen,
  };
}

// Backend Integration Helpers
const BACKEND_URL = 'http://localhost:8000';

async function updateAmbulanceOnBackend(pos: Coordinates, speed: number, status: string) {
  try {
    await fetch(`${BACKEND_URL}/ambulance/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'AMB-001',
        lat: pos.lat,
        lng: pos.lng,
        speed,
        status
      })
    });
  } catch (error) {
    console.error('Failed to sync ambulance with backend:', error);
  }
}

async function updateSignalOnBackend(id: string, status: string) {
  try {
    await fetch(`${BACKEND_URL}/signals/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
  } catch (error) {
    console.error('Failed to sync signal with backend:', error);
  }
}
