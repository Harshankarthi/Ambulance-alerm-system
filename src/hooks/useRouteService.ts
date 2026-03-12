import { useState, useCallback } from 'react';
import { Coordinates, RoutePoint } from '@/types/ambulance';

interface RouteServiceState {
  routePoints: RoutePoint[];
  isLoading: boolean;
  error: string | null;
  distance: number | null; // meters
  duration: number | null; // seconds
}

export function useRouteService() {
  const [state, setState] = useState<RouteServiceState>({
    routePoints: [],
    isLoading: false,
    error: null,
    distance: null,
    duration: null,
  });

  const fetchRoute = useCallback(async (source: Coordinates, destination: Coordinates) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);

      if (!res.ok) throw new Error('Route service unavailable');

      const data = await res.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found between these locations');
      }

      const route = data.routes[0];
      const coords: RoutePoint[] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => ({ lat, lng })
      );

      // Sample route to reasonable number of points for simulation
      const sampled = sampleRoute(coords, 30);

      setState({
        routePoints: sampled,
        isLoading: false,
        error: null,
        distance: route.distance,
        duration: route.duration,
      });

      return sampled;
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to fetch route',
      }));
      return null;
    }
  }, []);

  const clearRoute = useCallback(() => {
    setState({
      routePoints: [],
      isLoading: false,
      error: null,
      distance: null,
      duration: null,
    });
  }, []);

  return {
    ...state,
    fetchRoute,
    clearRoute,
  };
}

function sampleRoute(points: RoutePoint[], maxPoints: number): RoutePoint[] {
  if (points.length <= maxPoints) return points;

  const result: RoutePoint[] = [points[0]];
  const step = (points.length - 1) / (maxPoints - 1);

  for (let i = 1; i < maxPoints - 1; i++) {
    result.push(points[Math.round(i * step)]);
  }

  result.push(points[points.length - 1]);
  return result;
}
