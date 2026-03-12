import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Info, Siren } from 'lucide-react';
import { Alert } from '@/types/ambulance';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AlertPanelProps {
  alerts: Alert[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'high_priority':
        return {
          bg: 'bg-primary/20 border-primary',
          icon: Siren,
          iconColor: 'text-primary',
        };
      case 'warning':
        return {
          bg: 'bg-accent/20 border-accent',
          icon: AlertTriangle,
          iconColor: 'text-accent',
        };
      default:
        return {
          bg: 'bg-secondary border-border',
          icon: Info,
          iconColor: 'text-muted-foreground',
        };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-xl p-4 md:p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 md:p-3 rounded-lg bg-accent/20">
          <Bell className="w-5 h-5 md:w-6 md:h-6 text-accent" />
        </div>
        <div>
          <h2 className="font-display text-base md:text-lg font-bold text-foreground">
            Alert Center
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            {alerts.length} notifications
          </p>
        </div>
      </div>

      {/* Alerts List */}
      <ScrollArea className="flex-1 pr-2 md:pr-4">
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-6 md:py-8 text-muted-foreground"
            >
              <Bell className="w-8 h-8 md:w-12 md:h-12 mb-3 opacity-50" />
              <p className="text-xs md:text-sm">No active alerts</p>
              <p className="text-xs text-muted-foreground/70">
                Dispatch ambulance to see alerts
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {alerts.map((alert, index) => {
                const styles = getAlertStyles(alert.type);
                const Icon = styles.icon;

                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border ${styles.bg} ${
                      alert.type === 'high_priority' ? 'pulse-emergency' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <Icon className={`w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm text-foreground font-medium break-words">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Traffic Police Alert Banner */}
      {alerts.some((a) => a.type === 'high_priority') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-primary/30 border border-primary"
        >
          <p className="text-center font-display text-xs md:text-sm font-bold text-primary-foreground">
            📢 ALERT TO TRAFFIC POLICE
          </p>
          <p className="text-center text-xs text-primary-foreground/80 mt-1">
            Clear Traffic Immediately
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
