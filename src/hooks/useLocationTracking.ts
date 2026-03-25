import { supabase } from "@/integrations/supabase/client";
import { Coordinates } from "@/types/ambulance";
import { useState, useCallback } from "react";

export const useLocationTracking = () => {
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  const startTrip = useCallback(async (source: Coordinates, destination: Coordinates) => {
    const sessionId = `trip-${Date.now()}`;
    const demoTrip = {
      id: `demo-${Date.now()}`,
      session_id: sessionId,
      source_lat: source.lat,
      source_lng: source.lng,
      destination_lat: destination.lat,
      destination_lng: destination.lng,
      status: 'active',
      started_at: new Date().toISOString()
    };

    // Save to LocalStorage as fallback
    const localTrips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
    localStorage.setItem('demo_trips', JSON.stringify([demoTrip, ...localTrips].slice(0, 50)));

    try {
      const { data, error } = await (supabase as any)
        .from('ambulance_trips')
        .insert({
          session_id: sessionId,
          source_lat: source.lat,
          source_lng: source.lng,
          destination_lat: destination.lat,
          destination_lng: destination.lng,
          status: 'active'
        })
        .select()
        .single();

      if (!error && data) {
        setCurrentTripId(data.id);
        return { tripId: data.id, sessionId };
      }
    } catch (error) {
      console.warn('Supabase offline, using local tracking only');
    }
    
    setCurrentTripId(demoTrip.id);
    return { tripId: demoTrip.id, sessionId };
  }, []);

  const logLocation = useCallback(async (tripId: string, sessionId: string, coords: Coordinates, speed: number) => {
    const ping = {
      trip_id: tripId,
      session_id: sessionId,
      latitude: coords.lat,
      longitude: coords.lng,
      speed: speed,
      recorded_at: new Date().toISOString()
    };

    // Always save to LocalStorage as fallback
    const localPings = JSON.parse(localStorage.getItem(`pings_${tripId}`) || '[]');
    localStorage.setItem(`pings_${tripId}`, JSON.stringify([...localPings, ping]));

    try {
      await (supabase as any)
        .from('ambulance_locations')
        .insert(ping);
    } catch (error) {
      // Silent fail for Supabase
    }
  }, []);

  const endTrip = useCallback(async (tripId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('ambulance_trips')
        .update({ status: 'completed' })
        .eq('id', tripId);

      if (error) throw error;
      setCurrentTripId(null);
    } catch (error) {
      console.error('Error ending Supabase trip:', error);
    }
  }, []);

  return {
    currentTripId,
    startTrip,
    logLocation,
    endTrip
  };
};
