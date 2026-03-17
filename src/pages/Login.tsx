import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, UserRound, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<null | 'user' | 'police' | 'admin'>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      toast.error("Validation Error", {
        description: "Please enter both ID and password."
      });
      return;
    }

    setIsLoading(true);

    try {
      // Determine which table to query based on role
      const tableName = selectedRole === 'admin' ? 'admins' : 
                      selectedRole === 'user' ? 'users' : 'police';

      const { data, error } = await (supabase as any)
        .from(tableName)
        .select('*')
        .eq('username', trimmedUser)
        .eq('password', trimmedPass)
        .single();

      setIsLoading(false);

      if (error || !data) {
        toast.error("Access Denied", {
          description: "Invalid credentials. Please check your ID and Password."
        });
        return;
      }

      // Success
      if (selectedRole === 'admin') {
        localStorage.setItem('isAdmin', 'true');
        toast.success("Admin Access Granted", {
          description: "Welcome to the management console."
        });
        navigate('/admin');
      } else {
        toast.success("Login Successful", {
          description: `Authenticated as ${selectedRole === 'user' ? 'Citizen' : 'Traffic Official'}.`
        });
        navigate(selectedRole === 'user' ? '/user' : '/police');
      }
    } catch (err) {
      console.error("Login script error:", err);
      setIsLoading(false);
      toast.error("System Error", {
        description: "An unexpected error occurred during authentication."
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-50 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-4xl z-10 flex flex-col items-center">
        {/* Header from image */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-5xl mb-4">🚑</div>
          <h1 className="text-5xl font-black tracking-tight text-slate-800 mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Smart Ambulance
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            {selectedRole ? `Sign in to ${selectedRole === 'user' ? 'User' : 'Police'} Portal` : "Select your portal to access the emergency response network."}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedRole ? (
            <motion.div 
              key="role-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full"
            >
              {/* User Interface Card */}
              <button 
                onClick={() => setSelectedRole('user')}
                className="group relative bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-left transition-all hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-red-100/50"
              >
                <div className="absolute inset-y-0 left-0 w-1.5 bg-red-500 rounded-l-2xl" />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <TextIcon emoji="👤" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">User Interface</h2>
                  <p className="text-slate-500 text-center leading-relaxed">
                    Request emergency services, view ETAs, and track incoming ambulances.
                  </p>
                </div>
              </button>

              {/* Traffic Police Card */}
              <button 
                onClick={() => setSelectedRole('police')}
                className="group relative bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-left transition-all hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-amber-100/50"
              >
                <div className="absolute inset-y-0 left-0 w-1.5 bg-amber-500 rounded-l-2xl" />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                    <TextIcon emoji="👮" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">Traffic Police</h2>
                  <p className="text-slate-500 text-center leading-relaxed">
                    Monitor active routes and override traffic signals to clear paths.
                  </p>
                </div>
              </button>

              {/* Admin Portal Card */}
              <button 
                onClick={() => setSelectedRole('admin')}
                className="group relative bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-left transition-all hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-indigo-100/50 md:col-span-2 max-w-md mx-auto w-full"
              >
                <div className="absolute inset-y-0 left-0 w-1.5 bg-indigo-500 rounded-l-2xl" />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">Admin Dashboard</h2>
                  <p className="text-slate-500 text-center leading-relaxed">
                    View historical travel data and detailed location logs.
                  </p>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-md"
            >
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 relative">
                <button 
                  onClick={() => setSelectedRole(null)}
                  className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors flex items-center text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>

                <div className="mt-8">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600 ml-1">ID Number / Username</label>
                      <div className="relative group">
                        <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder={`Enter your ${selectedRole} credentials`}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-600 ml-1">Security Passphrase</label>
                      <div className="relative group">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isLoading}
                      className={`w-full flex items-center justify-center gap-2 py-4 px-4 font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 ${
                        selectedRole === 'user' 
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' 
                          : selectedRole === 'police'
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                          : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-200'
                      }`}
                    >
                      {isLoading ? "Authenticating..." : "Authorize & Enter"}
                      {!isLoading && <ArrowRight className="w-5 h-5" />}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-12 text-slate-400 text-sm font-medium">
          Secure multi-portal emergency management network.
        </p>
      </div>
    </div>
  );
};

const TextIcon = ({ emoji }: { emoji: string }) => (
  <span className="text-3xl">{emoji}</span>
);

export default Login;
