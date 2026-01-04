// ============================================
// Companies Page - Glass Card Grid
// ============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building2, DollarSign, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';

const Companies = () => {
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '' });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    // Mock data for now
    setCompanies([
      { id: 1, name: 'Sapphire Textiles', total_spent: 45000, active_tussles: 3 },
      { id: 2, name: 'Emerald Garments', total_spent: 32000, active_tussles: 2 },
      { id: 3, name: 'Golden Threads Co.', total_spent: 28000, active_tussles: 5 },
    ]);
    setLoading(false);
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    // API call here
    setShowForm(false);
    fetchCompanies();
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Companies</h1>
            <p className="text-white/70">Manage your client portfolio</p>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
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
            New Company
          </motion.button>
        </motion.div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, index) => (
            <GlassCard
              key={company.id}
              delay={index * 0.1}
              onClick={() => navigate(`/companies/${company.id}`)}
              className="p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nature-gold to-nature-leaf flex items-center justify-center">
                  <Building2 size={28} className="text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    ${(company.total_spent / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-white/60">Total Spent</div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{company.name}</h3>
              
              <div className="flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <Package size={16} />
                  <span>{company.active_tussles} Active</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Create Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">New Company</h2>
              
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                    placeholder="Sapphire Textiles"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                    placeholder="John Doe"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl py-3 text-white hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-nature-leaf border border-nature-leaf/30 rounded-xl py-3 text-white font-medium hover:bg-nature-leaf/80 transition-all"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Companies;