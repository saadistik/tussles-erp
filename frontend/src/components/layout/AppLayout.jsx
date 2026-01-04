// ============================================
// AppLayout - Nature Glass Layout with Floating Dock
// ============================================

import { motion, AnimatePresence } from 'framer-motion';
import { Home, Building2, Users, User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, userData } = useAuth();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/dashboard' },
    { id: 'companies', icon: Building2, label: 'Companies', path: '/companies' },
    { id: 'workers', icon: Users, label: 'Workers', path: '/workers' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Organic Gradient Background - Fixed */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-nature-emerald via-nature-teal to-nature-ocean" />
        
        {/* Animated Blobs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-nature-gold/30 rounded-full blur-3xl"
        />
        
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-20 w-[30rem] h-[30rem] bg-nature-leaf/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pb-24 md:pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Bottom Dock */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-6 left-0 right-0 z-50 px-4"
      >
        <div className="
          max-w-md mx-auto 
          md:max-w-2xl
          bg-white/10 backdrop-blur-2xl 
          border border-white/30 
          rounded-full 
          shadow-glass-lg
          px-6 py-3
          flex items-center justify-around gap-2
        ">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.95 }}
              className={`
                relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl
                transition-all duration-300
                ${isActive(item.path) 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <item.icon size={24} strokeWidth={2} />
              <span className="text-xs font-medium hidden md:block">{item.label}</span>
              
              {/* Active Indicator */}
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/10 rounded-2xl -z-10"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </motion.button>
          ))}

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            whileTap={{ scale: 0.95 }}
            className="
              flex flex-col items-center gap-1 px-4 py-2 rounded-2xl
              text-red-300 hover:text-red-200 hover:bg-red-500/10
              transition-all duration-300
            "
          >
            <LogOut size={24} strokeWidth={2} />
            <span className="text-xs font-medium hidden md:block">Logout</span>
          </motion.button>
        </div>
      </motion.nav>
    </div>
  );
};

export default AppLayout;