import { supabase } from "@/integrations/supabase/client";
import { Coordinates } from "@/types/ambulance";
import { useState, useCallback } from "react";

export const useLocationTracking = () => {
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  const startTrip = useCallback(async (source: Coordinates, destination: Coordinates) => {
    try {
      const sessionId = `trip-${Date.now()}`;
      // Cast supabase to any to bypass local type errors for tables that need to be created in Supabase SQL editor
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

      if (error) throw error;
      
      setCurrentTripId(data.id);
      return { tripId: data.id, sessionId };
    } catch (error) {
      console.error('Error starting Supabase trip:', error);
      return null;
    }
  }, []);

  const logLocation = useCallback(async (tripId: string, sessionId: string, coords: Coordinates, speed: number) => {
    try {
      const { error } = await (supabase as any)
        .from('ambulance_locations')
        .insert({
          trip_id: tripId,
          session_id: sessionId,
          latitude: coords.lat,
          longitude: coords.lng,
          speed: speed
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging location to Supabase:', error);
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
