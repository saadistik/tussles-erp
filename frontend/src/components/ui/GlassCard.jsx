// ============================================
// GlassCard - Reusable Nature Glass Component
// ============================================

import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  onClick,
  delay = 0,
  hover = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        bg-white/10 backdrop-blur-xl 
        border border-white/20 
        rounded-2xl 
        shadow-glass
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;