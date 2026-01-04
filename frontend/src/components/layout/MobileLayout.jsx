// ============================================
// Mobile Layout with Organic Glass Design
// File: frontend/src/components/layout/MobileLayout.jsx
// ============================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Building2, 
  Users, 
  User,
  Package,
  Receipt,
  Briefcase
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'companies', label: 'Companies', icon: Building2, path: '/companies' },
    { id: 'workers', label: 'Workers', icon: Users, path: '/workers' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab.path);
    navigate(tab.path);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Organic Mesh Background - Fixed */}
      <div className="fixed inset-0 bg-organic-mesh bg-[length:100%_100%] -z-10" />
      
      {/* Subtle Gradient Overlay */}
      <div className="fixed inset-0 bg-organic-gradient opacity-40 -z-10" />

      {/* Animated Background Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/3 w-72 h-72 bg-cream-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Main Content Area */}
      <main className="pb-24 px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Glass Bottom Dock */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 z-90 pb-safe"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Dock Container with Glass Effect */}
        <div className="mx-4 mb-4">
          <div className="glass-strong rounded-3xl p-2 shadow-glass-xl">
            <div className="flex items-center justify-around">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.path;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabChange(tab)}
                    className={`
                      relative flex flex-col items-center justify-center 
                      px-4 py-2.5 rounded-2xl transition-all duration-200
                      ${isActive ? 'text-emerald-800' : 'text-slate-600'}
                    `}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Active Indicator Background */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/50 rounded-2xl shadow-inner-glass"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    {/* Icon */}
                    <div className="relative z-10">
                      <Icon 
                        size={24} 
                        strokeWidth={isActive ? 2.5 : 2}
                        className={isActive ? 'text-emerald-700' : 'text-bamboo-600'}
                      />
                    </div>
                    
                    {/* Label */}
                    <span 
                      className={`
                        relative z-10 text-2xs mt-1 font-medium
                        ${isActive ? 'text-emerald-800' : 'text-bamboo-600'}
                      `}
                    >
                      {tab.label}
                    </span>

                    {/* Glow Effect on Active */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* iOS-style Home Indicator */}
        <div className="flex justify-center pb-2">
          <div className="w-32 h-1 bg-slate-800/20 rounded-full" />
        </div>
      </motion.div>

      {/* Safe Area Bottom Padding (for iOS notch) */}
      <style jsx>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

export default MobileLayout;
