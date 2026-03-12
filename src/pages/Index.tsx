import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Index = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="text-6xl mb-6">🚑</div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                    Smart Ambulance
                </h1>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                    Select your portal to access the emergency response network.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                {/* User Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => navigate('/user')}
                    className="glass-card hover:bg-white/5 cursor-pointer rounded-2xl p-8 border border-white/10 border-l-4 border-l-primary flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20"
                >
                    <div className="text-4xl mb-4 p-4 rounded-full bg-primary/10">👤</div>
                    <h2 className="text-xl font-bold text-white mb-2">User Interface</h2>
                    <p className="text-muted-foreground text-sm">
                        Request emergency services, view ETAs, and track incoming ambulances.
                    </p>
                </motion.div>

                {/* Traffic Police Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => navigate('/police')}
                    className="glass-card hover:bg-white/5 cursor-pointer rounded-2xl p-8 border border-white/10 border-l-4 border-l-amber-500 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/20"
                >
                    <div className="text-4xl mb-4 p-4 rounded-full bg-amber-500/10">👮</div>
                    <h2 className="text-xl font-bold text-white mb-2">Traffic Police</h2>
                    <p className="text-muted-foreground text-sm">
                        Monitor active routes and override traffic signals to clear paths.
                    </p>
                </motion.div>

            </div>
        </div>
    );
};

export default Index;
