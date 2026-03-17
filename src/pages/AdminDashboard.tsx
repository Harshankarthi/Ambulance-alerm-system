import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Clock, MapPin, Activity, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Trip {
  id: string;
  session_id: string;
  started_at: string;
  source_lat: number;
  source_lng: number;
  destination_lat: number;
  destination_lng: number;
  status: string;
}

interface LocationPing {
  latitude: number;
  longitude: number;
  recorded_at: string;
  speed: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [locations, setLocations] = useState<LocationPing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchTrips();
  }, []);

  const checkAuth = async () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/');
      toast.error("Unauthorized", { description: "Admin access only." });
    }
  };

  const fetchTrips = async () => {
    setIsLoading(true);
    console.log("Fetching trips from Supabase...");
    const { data, error } = await (supabase as any)
      .from('ambulance_trips')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) {
      console.error("Supabase Error (fetchTrips):", error);
      toast.error("Error fetching trips", { description: error.message });
    } else {
      console.log("Trips fetched successfully:", data?.length || 0);
      setTrips(data || []);
    }
    setIsLoading(false);
  };

  const fetchTripDetails = async (trip: Trip) => {
    setSelectedTrip(trip);
    const { data, error } = await (supabase as any)
      .from('ambulance_locations')
      .select('latitude, longitude, recorded_at, speed')
      .eq('trip_id', trip.id)
      .order('recorded_at', { ascending: true });

    if (error) {
      toast.error("Error fetching locations", { description: error.message });
    } else {
      setLocations(data || []);
    }
  };

  const deleteTrip = async (id: string) => {
    const { error } = await (supabase as any).from('ambulance_trips').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete", { description: error.message });
    } else {
      toast.success("Trip deleted");
      setTrips(trips.filter(t => t.id !== id));
      if (selectedTrip?.id === id) setSelectedTrip(null);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('isAdmin');
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/portal')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Admin Control Center</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Emergency Travel Logs</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-all"
        >
          Sign Out
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Trip List */}
        <div className="w-96 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Dispatches
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading trips...</div>
          ) : trips.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 italic text-sm">No travel data found.</p>
                <p className="text-[10px] text-slate-300 mt-1 uppercase font-bold">Check Supabase RLS or start a dispatch</p>
              </div>
              <button 
                onClick={fetchTrips}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 underline underline-offset-4"
              >
                Refresh Data
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => fetchTripDetails(trip)}
                  className={`w-full p-5 text-left transition-all hover:bg-slate-50 flex flex-col gap-2 ${selectedTrip?.id === trip.id ? 'bg-indigo-50/50 border-r-4 border-r-indigo-500' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {trip.session_id.split('-')[1]}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${trip.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      {new Date(trip.started_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-[10px] text-slate-500 truncate">From: {trip.source_lat.toFixed(4)}, {trip.source_lng.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[10px] text-slate-500 truncate">To: {trip.destination_lat.toFixed(4)}, {trip.destination_lng.toFixed(4)}</span>
                    </div>
                  </div>
                  <div 
                    onClick={(e) => { e.stopPropagation(); deleteTrip(trip.id); }}
                    className="mt-2 self-end text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail View - Map */}
        <div className="flex-1 bg-slate-100 p-8 flex flex-col gap-6">
          {!selectedTrip ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                <MapPin className="w-10 h-10" />
              </div>
              <p className="font-medium">Select a trip to view route statistics and logs</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-tighter">Session ID</p>
                  <p className="text-lg font-black text-slate-800">{selectedTrip.session_id}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-tighter">Location Pings</p>
                  <p className="text-lg font-black text-indigo-600">{locations.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-tighter">Avg Speed</p>
                  <p className="text-lg font-black text-green-600">
                    {locations.length > 0 
                      ? (locations.reduce((acc, l) => acc + l.speed, 0) / locations.length).toFixed(1) 
                      : 0} km/h
                  </p>
                </div>
              </div>

              <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
                <MapContainer
                  center={[selectedTrip.source_lat, selectedTrip.source_lng]}
                  zoom={14}
                  className="h-full w-full"
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  
                  <Marker position={[selectedTrip.source_lat, selectedTrip.source_lng]} icon={L.divIcon({ html: '📍', className: '', iconSize: [30,30] })} />
                  <Marker position={[selectedTrip.destination_lat, selectedTrip.destination_lng]} icon={L.divIcon({ html: '🏥', className: '', iconSize: [30,30] })} />

                  {locations.length > 1 && (
                    <Polyline 
                      positions={locations.map(l => [l.latitude, l.longitude])} 
                      pathOptions={{ color: '#6366f1', weight: 5, opacity: 0.8 }} 
                    />
                  )}

                  {locations.map((loc, i) => (
                    <Marker 
                      key={i} 
                      position={[loc.latitude, loc.longitude]} 
                      icon={L.divIcon({ 
                        html: `<div class="w-2 h-2 rounded-full bg-indigo-500 border border-white shadow-sm"></div>`, 
                        className: '', 
                        iconSize: [8,8] 
                      })}
                    >
                      <Popup>
                        <div className="text-xs">
                          <p><strong>Time:</strong> {new Date(loc.recorded_at).toLocaleTimeString()}</p>
                          <p><strong>Speed:</strong> {loc.speed} km/h</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
