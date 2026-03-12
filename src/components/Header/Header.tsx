import { motion } from 'framer-motion';
import { Ambulance, Radio, Activity, Sun, Moon, Bell, BellOff } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

  const handleNotificationToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        toast.success('Notifications disabled');
      }
    } else {
      const success = await subscribe();
      if (success) {
        toast.success('Notifications enabled! You will receive alerts when ambulances are dispatched.');
      } else {
        toast.error('Failed to enable notifications. Please allow notifications in your browser.');
      }
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-b border-border px-4 md:px-6 py-3 md:py-4"
    >
      <div className="flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-2 md:gap-4">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="p-1 md:p-2 rounded-xl bg-primary/20 emergency-glow overflow-hidden"
          >
            <img src="/ambulance-icon.svg" alt="Ambulance" className="w-7 h-7 md:w-10 md:h-10 object-contain" />
          </motion.div>
          <div>
            <h1 className="font-display text-sm md:text-xl font-bold text-foreground leading-tight">
              Ambulance
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              Early Traffic Clearance Alert System
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-active/20 border border-status-active/40">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-status-active"
            />
            <span className="text-xs font-medium text-status-active">SYSTEM ONLINE</span>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Push Notification Toggle */}
            {isSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationToggle}
                disabled={isLoading}
                className="p-1.5 md:p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                title={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
              >
                {isSubscribed ? (
                  <Bell className="w-4 h-4 md:w-5 md:h-5 text-status-active" />
                ) : (
                  <BellOff className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                )}
              </Button>
            )}
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-1.5 md:p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
              ) : (
                <Sun className="w-4 h-4 md:w-5 md:h-5 text-accent" />
              )}
            </Button>
            <div className="p-1.5 md:p-2 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors">
              <Radio className="w-4 h-4 md:w-5 md:h-5 text-accent" />
            </div>
            <div className="p-1.5 md:p-2 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-status-active" />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
