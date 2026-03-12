import { motion } from 'framer-motion';
import { TrafficCone } from 'lucide-react';
import { TrafficSignal } from '@/types/ambulance';

interface SignalStatusProps {
  signals: TrafficSignal[];
}

export function SignalStatus({ signals }: SignalStatusProps) {
  const getStatusStyles = (status: TrafficSignal['status']) => {
    switch (status) {
      case 'green':
        return 'bg-signal-green shadow-[0_0_20px_hsl(var(--signal-green)/0.8)]';
      case 'amber':
        return 'bg-signal-amber shadow-[0_0_20px_hsl(var(--signal-amber)/0.8)]';
      default:
        return 'bg-signal-red shadow-[0_0_20px_hsl(var(--signal-red)/0.8)]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-xl p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="p-2 md:p-3 rounded-lg bg-signal-amber/20">
          <TrafficCone className="w-5 h-5 md:w-6 md:h-6 text-signal-amber" />
        </div>
        <div>
          <h2 className="font-display text-base md:text-lg font-bold text-foreground">
            Traffic Signals
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            {signals.filter((s) => s.status === 'green').length} / {signals.length} cleared
          </p>
        </div>
      </div>

      {/* Signal List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
        {signals.map((signal, index) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
          >
            <motion.div
              className={`w-4 h-4 md:w-5 md:h-5 rounded-full ${getStatusStyles(signal.status)}`}
              animate={
                signal.status === 'green'
                  ? { scale: [1, 1.2, 1] }
                  : signal.status === 'amber'
                  ? { opacity: [1, 0.5, 1] }
                  : {}
              }
              transition={{ duration: 0.5, repeat: signal.status !== 'red' ? Infinity : 0 }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-foreground truncate">
                {signal.name}
              </p>
              <p
                className={`text-xs font-display uppercase ${
                  signal.status === 'green'
                    ? 'text-signal-green'
                    : signal.status === 'amber'
                    ? 'text-signal-amber'
                    : 'text-signal-red'
                }`}
              >
                {signal.status}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-3 md:gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-signal-red" />
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-signal-amber" />
          <span>Preparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-signal-green" />
          <span>Cleared</span>
        </div>
      </div>
    </motion.div>
  );
}
