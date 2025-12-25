import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Zap
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: DollarSign, label: 'Payments', path: '/payments' },
  { icon: TrendingUp, label: 'Reports', path: '/reports' },
];

const Sidebar = ({ isOpen, onToggle }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-screen w-64 glass-card border-r border-zinc-800/50 backdrop-blur-xl z-50"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800/50">
            <div className="relative">
              <Zap className="text-indigo-400" size={32} />
              <div className="absolute inset-0 bg-indigo-500/30 blur-xl animate-glow-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                TradeFlow
              </h1>
              <p className="text-xs text-zinc-500">ERP System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-6 space-y-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={20}
                        className={`transition-transform group-hover:scale-110 ${
                          isActive ? 'text-indigo-400' : ''
                        }`}
                      />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </nav>

          {/* Bottom Status */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800/50">
            <div className="glass-card p-3 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>System Active</span>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
