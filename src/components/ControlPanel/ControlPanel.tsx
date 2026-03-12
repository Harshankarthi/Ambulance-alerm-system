import { motion } from 'framer-motion';
import { Play, Square, RotateCcw, Ambulance, Gauge, Navigation, Volume2, VolumeX, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AmbulanceState } from '@/types/ambulance';

interface ControlPanelProps {
  ambulance: AmbulanceState;
  isDispatched: boolean;
  progress: number;
  isSoundEnabled: boolean;
  isAutoGreenEnabled: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onToggleSound: () => void;
  onToggleAutoGreen: () => void;
}

export function ControlPanel({
  ambulance,
  isDispatched,
  progress,
  isSoundEnabled,
  isAutoGreenEnabled,
  onStart,
  onStop,
  onReset,
  onToggleSound,
  onToggleAutoGreen,
}: ControlPanelProps) {
  const getStatusColor = () => {
    switch (ambulance.status) {
      case 'moving':
        return 'text-status-active';
      case 'stopped':
        return 'text-status-stopped';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 md:p-6 space-y-4 md:space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 md:p-3 rounded-lg bg-primary/20">
            <Ambulance className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-base md:text-lg font-bold text-foreground">
              Dispatch Control
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">Unit: {ambulance.id}</p>
          </div>
        </div>

        <div className="flex gap-1">
          {/* Signal Logic Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAutoGreen}
            className={`rounded-lg ${isAutoGreenEnabled ? 'text-green-500' : 'text-red-500'}`}
            title={isAutoGreenEnabled ? 'Auto-Green Signal: ON' : 'Auto-Green Signal: OFF'}
          >
            {isAutoGreenEnabled ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
          </Button>

          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSound}
            className={`rounded-lg ${isSoundEnabled ? 'text-accent' : 'text-muted-foreground'}`}
            title={isSoundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Status Display */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="glass-card rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <Gauge className="w-3 h-3 md:w-4 md:h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Speed</span>
          </div>
          <p className="font-display text-xl md:text-2xl font-bold text-foreground">
            {ambulance.speed}
            <span className="text-xs md:text-sm font-normal text-muted-foreground ml-1">km/h</span>
          </p>
        </div>

        <div className="glass-card rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <Navigation className="w-3 h-3 md:w-4 md:h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Status</span>
          </div>
          <p className={`font-display text-lg md:text-xl font-bold uppercase ${getStatusColor()}`}>
            {ambulance.status}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs md:text-sm">
          <span className="text-muted-foreground">Route Progress</span>
          <span className="text-foreground font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 md:h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
        {!isDispatched ? (
          <Button
            onClick={onStart}
            className="flex-1 gap-2 bg-status-active hover:bg-status-active/90 text-primary-foreground font-display font-semibold py-5 md:py-6"
            disabled={ambulance.status === 'idle' && progress === 100}
          >
            <Play className="w-4 h-4 md:w-5 md:h-5" />
            DISPATCH
          </Button>
        ) : (
          <Button
            onClick={onStop}
            variant="destructive"
            className="flex-1 gap-2 font-display font-semibold py-5 md:py-6"
          >
            <Square className="w-4 h-4 md:w-5 md:h-5" />
            STOP
          </Button>
        )}

        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 gap-2 font-display font-semibold py-5 md:py-6 border-border hover:bg-secondary"
        >
          <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
          RESET
        </Button>
      </div>

      {/* Active Alert Banner */}
      {isDispatched && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 md:p-4 rounded-lg bg-primary/20 border border-primary pulse-emergency"
        >
          <div className="flex items-center justify-center gap-2">
            {isSoundEnabled && (
              <Volume2 className="w-4 h-4 text-primary animate-pulse" />
            )}
            <p className="text-center font-display text-xs md:text-sm font-bold text-primary">
              🚨 EMERGENCY DISPATCH ACTIVE
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
