import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '@/components/Header/Header';
import { AmbulanceMap } from '@/components/Map/AmbulanceMap';
import { INDIA_REGIONS, Region } from '@/data/india-regions';
import { useAmbulanceSimulation } from '@/hooks/useAmbulanceSimulation';
import { ControlPanel } from '@/components/ControlPanel/ControlPanel';
import { AlertPanel } from '@/components/AlertPanel/AlertPanel';
import { LocationSearch } from '@/components/LocationSearch/LocationSearch';
import { useRouteService } from '@/hooks/useRouteService';
import { Coordinates, RoutePoint } from '@/types/ambulance';
import { ArrowLeft, BellRing } from 'lucide-react';

const UserInterface = () => {
    const navigate = useNavigate();

    // Region State
    const [selectedState, setSelectedState] = useState(INDIA_REGIONS[0].id);
    const [selectedDistrict, setSelectedDistrict] = useState(INDIA_REGIONS[0].districts[0].id);

    const currentState = INDIA_REGIONS.find((s) => s.id === selectedState) || INDIA_REGIONS[0];
    const currentDistrict = currentState.districts.find((d) => d.id === selectedDistrict) || currentState.districts[0];

    const activeRoute = currentDistrict.routePoints || [
        { lat: currentDistrict.lat, lng: currentDistrict.lng },
        { lat: currentDistrict.lat + 0.01, lng: currentDistrict.lng + 0.01 }
    ];

    const { fetchRoute, routePoints: fetchedPoints, isLoading: isRouteLoading, clearRoute } = useRouteService();

    // Source and Destination State
    const [customSource, setCustomSource] = useState<Coordinates>(activeRoute[0]);
    const [customDestination, setCustomDestination] = useState<Coordinates>(activeRoute[activeRoute.length - 1]);
    const [sourceName, setSourceName] = useState('');
    const [destinationName, setDestinationName] = useState('');

    // Fetch route whenever source or destination changes
    useEffect(() => {
        if (customSource && customDestination) {
            fetchRoute(customSource, customDestination);
        }
    }, [customSource, customDestination, fetchRoute]);

    const currentRoutePoints: RoutePoint[] = fetchedPoints.length >= 2
        ? fetchedPoints
        : [customSource, customDestination];

    const notificationCallbacks = {
        onDispatch: () => {
            try {
                const channel = new BroadcastChannel('smart_ambulance_channel');
                channel.postMessage({ type: 'AMBULANCE_REQUESTED', payload: { routePoints: currentRoutePoints } });
                channel.close();
            } catch (e) {
                console.error("BroadcastChannel failed", e);
            }
            toast.success("Emergency Request Sent", {
                description: "Traffic Police have been notified."
            });
        }
    };

    const sendManualNotification = () => {
        try {
            const channel = new BroadcastChannel('smart_ambulance_channel');
            channel.postMessage({ type: 'MANUAL_NOTIFICATION', payload: { routePoints: currentRoutePoints } });
            channel.close();
        } catch (e) {
            console.error("BroadcastChannel failed", e);
        }
        toast.success("Alert Sent", {
            description: "Traffic Police Control Room has been notified."
        });
    };

    const {
        ambulance,
        signals,
        policeStations,
        alerts,
        isDispatched,
        progress,
        startDispatch,
        stopDispatch,
        resetSimulation,
        isAutoGreenEnabled,
        toggleAutoGreen,
    } = useAmbulanceSimulation({}, notificationCallbacks, currentRoutePoints);

    const [isSoundEnabled, setIsSoundEnabled] = useState(true);

    const handleStateChange = (stateId: string) => {
        setSelectedState(stateId);
        const newState = INDIA_REGIONS.find(s => s.id === stateId);
        if (newState) {
            handleDistrictChange(newState.districts[0].id, newState);
        }
    };

    const handleDistrictChange = (districtId: string, customState = currentState) => {
        setSelectedDistrict(districtId);
        const state = customState;
        const district = state.districts.find(d => d.id === districtId);
        if (district) {
            const rt = district.routePoints || [
                { lat: district.lat, lng: district.lng },
                { lat: district.lat + 0.01, lng: district.lng + 0.01 }
            ];
            setCustomSource(rt[0]);
            setCustomDestination(rt[rt.length - 1]);
            setSourceName('');
            setDestinationName('');
            clearRoute();
        }
    };

    useEffect(() => {
        try {
            const channel = new BroadcastChannel('smart_ambulance_channel');
            channel.onmessage = (event) => {
                if (event.data.type === 'POLICE_RESPONSE') {
                    toast.info("📢 CONTROL ROOM MESSAGE", {
                        description: event.data.payload.message,
                        duration: 10000,
                    });
                }
            };
            return () => channel.close();
        } catch (e) {
            console.error("BroadcastChannel failed", e);
        }
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex justify-between items-center px-6 py-2 bg-secondary/30 border-b border-border">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Portal
                </button>
                <button
                    onClick={sendManualNotification}
                    className="flex items-center text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-black px-4 py-1.5 rounded-full transition-all shadow-lg shadow-amber-500/20"
                >
                    <BellRing className="w-4 h-4 mr-2" />
                    Alert Police Control
                </button>
            </div>

            <main className="flex-1 p-3 md:p-6 pb-6 overflow-hidden">
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">

                    {/* Left Panel: Controls */}
                    <div className="lg:col-span-3 flex flex-col gap-3 md:gap-4 overflow-y-auto pr-1">

                        {/* Region Selection */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card rounded-xl p-4 space-y-3"
                        >
                            <div>
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">Select State</label>
                                <select
                                    className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary h-10"
                                    value={selectedState}
                                    onChange={(e) => handleStateChange(e.target.value)}
                                    disabled={isDispatched}
                                >
                                    {INDIA_REGIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5 mt-2">Select District</label>
                                <select
                                    className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary h-10"
                                    value={selectedDistrict}
                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                    disabled={isDispatched}
                                >
                                    {currentState.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </motion.div>

                        {/* Location Search / Route Setup */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <LocationSearch
                                onSourceSelect={(coords, name) => { setCustomSource(coords); setSourceName(name); }}
                                onDestinationSelect={(coords, name) => { setCustomDestination(coords); setDestinationName(name); }}
                                sourceName={sourceName}
                                destinationName={destinationName}
                                disabled={isDispatched}
                            />
                        </motion.div>

                        {/* Dispatch Control */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex-1"
                        >
                            <ControlPanel
                                ambulance={ambulance}
                                isDispatched={isDispatched}
                                progress={progress}
                                isSoundEnabled={isSoundEnabled}
                                isAutoGreenEnabled={isAutoGreenEnabled}
                                onStart={startDispatch}
                                onStop={stopDispatch}
                                onReset={resetSimulation}
                                onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
                                onToggleAutoGreen={toggleAutoGreen}
                            />
                        </motion.div>
                    </div>

                    {/* Middle Panel: Map */}
                    <div className="lg:col-span-6 h-[500px] lg:h-auto rounded-xl overflow-hidden shadow-md">
                        <AmbulanceMap
                            ambulance={ambulance}
                            signals={signals}
                            policeStations={policeStations}
                            routePoints={currentRoutePoints}
                            onMapClickSource={async (coords, name) => { if (!isDispatched) { setCustomSource(coords); setSourceName(name); } }}
                            onMapClickDestination={async (coords, name) => { if (!isDispatched) { setCustomDestination(coords); setDestinationName(name); } }}
                            isDispatched={isDispatched}
                        />
                    </div>

                    {/* Right Panel: Alerts */}
                    <div className="lg:col-span-3 h-[400px] lg:h-auto">
                        <AlertPanel alerts={alerts} />
                    </div>

                </div>
            </main>
        </div>
    );
};

export default UserInterface;
