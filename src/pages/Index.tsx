import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Index = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FDFDFF] flex flex-col items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="text-6xl mb-6">🚑</div>
                <h1 className="text-5xl font-black text-slate-800 mb-4 tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Smart Ambulance
                </h1>
                <p className="text-slate-500 font-medium text-lg max-w-lg mx-auto">
                    Select your portal to access the emergency response network.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* User Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => navigate('/user')}
                    className="bg-white hover:bg-slate-50 cursor-pointer rounded-2xl p-10 border border-slate-100 border-l-4 border-l-red-500 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-100/50"
                >
                    <div className="text-4xl mb-6 w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">👤</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">User Interface</h2>
                    <p className="text-slate-500 leading-relaxed font-medium">
                        Request emergency services, view ETAs, and track incoming ambulances.
                    </p>
                </motion.div>

                {/* Traffic Police Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => navigate('/police')}
                    className="bg-white hover:bg-slate-50 cursor-pointer rounded-2xl p-10 border border-slate-100 border-l-4 border-l-amber-500 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-100/50"
                >
                    <div className="text-4xl mb-6 w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">👮</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Traffic Police</h2>
                    <p className="text-slate-500 leading-relaxed font-medium">
                        Monitor active routes and override traffic signals to clear paths.
                    </p>
                </motion.div>

            </div>
            
            <p className="mt-16 text-slate-300 text-sm font-semibold tracking-widest uppercase">
                Secure Emergency Network Portal
            </p>
        </div>
    );
};

export default Index;
