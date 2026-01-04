// ============================================
// Company Board - Shows all Tussles for a Company
// ============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Package, DollarSign, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import GlassCard from '../components/ui/GlassCard';

const CompanyBoard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [tussles, setTussles] = useState([]);

  useEffect(() => {
    // Mock data
    setCompany({ id, name: 'Sapphire Textiles', total_spent: 45000 });
    setTussles([
      {
        id: 1,
        name: 'Summer Collection 2024',
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea6c39cd?w=400',
        quantity: 500,
        sell_price: 25000,
        status: 'in_progress',
        progress: 65
      },
      {
        id: 2,
        name: 'Winter Coats Premium',
        image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
        quantity: 300,
        sell_price: 18000,
        status: 'pending',
        progress: 20
      },
    ]);
  }, [id]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/companies')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Companies
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{company?.name}</h1>
              <p className="text-white/70">Manufacturing Orders</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="
                bg-white/20 backdrop-blur-xl 
                border border-white/30 
                rounded-full 
                px-6 py-3 
                text-white font-medium
                flex items-center gap-2
                hover:bg-white/30 transition-all
              "
            >
              <Plus size={20} />
              New Tussle
            </motion.button>
          </div>
        </motion.div>

        {/* Tussles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tussles.map((tussle, index) => (
            <GlassCard
              key={tussle.id}
              delay={index * 0.1}
              onClick={() => navigate(`/tussles/${tussle.id}`)}
              className="overflow-hidden"
            >
              {/* Album Art Header */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={tussle.image}
                  alt={tussle.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">{tussle.name}</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60 flex items-center gap-1">
                      <Package size={16} />
                      Quantity
                    </span>
                    <span className="text-white font-medium">{tussle.quantity} units</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60 flex items-center gap-1">
                      <DollarSign size={16} />
                      Revenue
                    </span>
                    <span className="text-nature-gold font-bold">${tussle.sell_price.toLocaleString()}</span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                      <span>Progress</span>
                      <span>{tussle.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tussle.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-nature-leaf to-nature-teal"
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="pt-2">
                    <span className={`
                      inline-block px-3 py-1 rounded-full text-xs font-medium
                      ${tussle.status === 'in_progress' 
                        ? 'bg-nature-teal/20 text-nature-teal border border-nature-teal/30' 
                        : 'bg-white/10 text-white/70 border border-white/20'
                      }
                    `}>
                      {tussle.status === 'in_progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default CompanyBoard;