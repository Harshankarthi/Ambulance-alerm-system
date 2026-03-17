import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '@/components/Header/Header';
import { AmbulanceMap } from '@/components/Map/AmbulanceMap';
import { INDIA_REGIONS } from '@/data/india-regions';
import { TrafficSignal, AmbulanceState, RoutePoint } from '@/types/ambulance';
import { ArrowLeft } from 'lucide-react';
import { generateSignals, generatePoliceStations, PoliceStation } from '@/hooks/useAmbulanceSimulation';
import { useAudioAlerts } from '@/hooks/useAudioAlerts';

const PoliceInterface = () => {
    const navigate = useNavigate();
    const { playWarningAlert } = useAudioAlerts();
    const defaultRoute = INDIA_REGIONS[0].districts[0].routePoints || [];
    const [activeRoute, setActiveRoute] = useState<RoutePoint[]>(defaultRoute);

    const [ambulance, setAmbulance] = useState<AmbulanceState>({
        id: 'AMB-001',
        position: activeRoute[0] || { lat: 12.9716, lng: 77.5946 },
        speed: 0,
        status: 'idle',
        source: activeRoute[0] || { lat: 12.9716, lng: 77.5946 },
        destination: activeRoute[activeRoute.length - 1] || { lat: 12.9716, lng: 77.5946 },
    });

    const [signals, setSignals] = useState<TrafficSignal[]>(generateSignals(activeRoute));
    const [policeStations, setPoliceStations] = useState<PoliceStation[]>(generatePoliceStations(activeRoute));

    const forceSignalStatus = (signalId: string, status: 'red' | 'green') => {
        setSignals((prev) =>
            prev.map((s) => (s.id === signalId ? { ...s, status } : s))
        );
        const channel = new BroadcastChannel('smart_ambulance_channel');
        channel.postMessage({ type: 'SIGNAL_OVERRIDE', payload: { signalId, status } });
        channel.close();
    };

    const sendPoliceStep = (message: string) => {
        const channel = new BroadcastChannel('smart_ambulance_channel');
        channel.postMessage({ type: 'POLICE_RESPONSE', payload: { message, timestamp: Date.now() } });
        channel.close();
        toast.info("Dispatch Message Sent", {
            description: "Target browser tab will show a popup alert."
        });
    };

    useEffect(() => {
        try {
            const channel = new BroadcastChannel('smart_ambulance_channel');
            channel.onmessage = (event) => {
                if (event.data.type === 'AMBULANCE_POSITION_UPDATE') {
                    setAmbulance(event.data.payload);
                }

                if (event.data.payload?.routePoints && event.data.type === 'AMBULANCE_REQUESTED') {
                    const route = event.data.payload.routePoints;
                    setActiveRoute(route);
                    setSignals(generateSignals(route));
                    setPoliceStations(generatePoliceStations(route));
                    setAmbulance(prev => ({
                        ...prev,
                        position: route[0],
                        source: route[0],
                        destination: route[route.length - 1],
                    }));
                }

                if (event.data.type === 'SIGNALS_UPDATE') {
                    setSignals(event.data.payload);
                }

                if (event.data.type === 'AMBULANCE_REQUESTED') {
                    toast.warning("🚨 EMERGENCY ALERT", {
                        description: "Citizen has requested emergency services. Please monitor the route and adjust traffic signals accordingly.",
                        duration: 8000,
                    });
                } else if (event.data.type === 'MANUAL_NOTIFICATION') {
                    // Start loud warning beep
                    playWarningAlert();
                    toast.error("🚨 INCOMING ALARM EMERGENCY", {
                        description: "A citizen has explicitly requested an Emergency Alarm to the control room!",
                        duration: 8000,
                    });
                }
            };
            return () => channel.close();
        } catch (e) {
            console.error("BroadcastChannel error", e);
        }
    }, [playWarningAlert]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex justify-between items-center p-4 glass-card border-b border-white/10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Portal
                </button>
                <div className="text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full text-sm">
                    Traffic Police Mode
                </div>
            </div>

            <Header />

            <main className="flex-1 p-3 md:p-6 overflow-hidden">
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1 overflow-y-auto pr-2"
                    >
                        {/* messaging console */}
                        <div className="glass-card p-5 rounded-xl border border-white/10 space-y-4">
                            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Ambulance Dispatch Control</h2>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => sendPoliceStep("Emergency Request Received. Units standing by.")}
                                    className="p-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition-all flex flex-col items-center gap-1"
                                >
                                    <span>📩</span> ACKNOWLEDGE
                                </button>
                                <button
                                    onClick={() => sendPoliceStep("Route Analyzed. Clearing path now.")}
                                    className="p-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-purple-500/20 hover:border-purple-500/50 transition-all flex flex-col items-center gap-1"
                                >
                                    <span>🔍</span> ANALYSING
                                </button>
                                <button
                                    onClick={() => sendPoliceStep("Green Wave Active. Proceed safely.")}
                                    className="p-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-green-500/20 hover:border-green-500/50 transition-all flex flex-col items-center gap-1"
                                >
                                    <span>🟢</span> GREEN WAVE
                                </button>
                                <button
                                    onClick={() => sendPoliceStep("Clearance Granted. All junctions managed.")}
                                    className="p-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-amber-500/20 hover:border-amber-500/50 transition-all flex flex-col items-center gap-1"
                                >
                                    <span>✅</span> GRANTED
                                </button>
                            </div>
                        </div>

                        <div className="glass-card p-5 rounded-xl border border-white/10 space-y-4 flex-1">
                            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-4">Traffic Junction Override</h2>

                            <div className="space-y-3">
                                {signals.map((signal) => (
                                    <div key={signal.id} className="flex flex-col p-3 bg-black/20 rounded-lg border border-white/5 gap-3">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-xs font-semibold text-white/90">{signal.name}</span>
                                            <div className="flex gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${signal.status === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-white/10'}`} />
                                                <div className={`w-2 h-2 rounded-full ${signal.status === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`} />
                                                <div className={`w-2 h-2 rounded-full ${signal.status === 'green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/10'}`} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => forceSignalStatus(signal.id, 'green')}
                                                className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all ${signal.status === 'green' ? 'bg-green-500 text-black' : 'bg-white/5 text-white/40 hover:bg-green-500/10 hover:text-green-500'}`}
                                            >
                                                Force Green
                                            </button>
                                            <button
                                                onClick={() => forceSignalStatus(signal.id, 'red')}
                                                className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all ${signal.status === 'red' ? 'bg-red-500 text-white' : 'bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-500'}`}
                                            >
                                                Force Red
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-8 h-[400px] lg:h-full order-1 lg:order-2 rounded-xl overflow-hidden border border-white/10 shadow-2xl relative"
                    >
                        <AmbulanceMap
                            ambulance={ambulance}
                            signals={signals}
                            policeStations={policeStations}
                            routePoints={activeRoute}
                            onMapClickSource={async () => { }}
                            onMapClickDestination={async () => { }}
                            isDispatched={true}
                        />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 pointer-events-none">
                            <p className="text-[10px] font-bold text-amber-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                LIVE: AMB-DRIVER-VIEW
                            </p>
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
};

export default PoliceInterface;
