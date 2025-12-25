import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, Trash2, Building2, Phone } from 'lucide-react';
import { api } from '../config/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchClients();
  }, [filterType]);

  const fetchClients = async () => {
    try {
      const params = filterType !== 'all' ? { type: filterType } : {};
      const response = await api.get('/clients.php', { params });
      if (response.data.success) {
        setClients(response.data.data.clients);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company_name &&
        client.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Clients
          </h1>
          <p className="text-zinc-400 mt-1">Manage buyers and suppliers</p>
        </div>
        <button className="btn-glow flex items-center gap-2">
          <Plus size={20} />
          Add Client
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients..."
              className="input-field pl-11 w-full"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            {['all', 'buyer', 'supplier', 'both'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Clients Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loading ? (
          <div className="col-span-full text-center py-12 text-zinc-500">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-500">No clients found</div>
        ) : (
          filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 hover:scale-105 transition-transform duration-300"
            >
              {/* Client Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-100">{client.name}</h3>
                  {client.company_name && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-zinc-400">
                      <Building2 size={14} />
                      <span>{client.company_name}</span>
                    </div>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    client.type === 'buyer'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : client.type === 'supplier'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  {client.type}
                </span>
              </div>

              {/* Client Details */}
              <div className="space-y-2 mb-4">
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Phone size={14} />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.city && (
                  <div className="text-sm text-zinc-400">
                    {client.city}
                    {client.state && `, ${client.state}`}
                  </div>
                )}
              </div>

              {/* Balance */}
              <div className="p-3 bg-zinc-800/30 rounded-lg mb-4">
                <p className="text-xs text-zinc-500 mb-1">Current Balance</p>
                <p
                  className={`text-xl font-bold ${
                    parseFloat(client.current_balance) > 0
                      ? 'text-emerald-400'
                      : parseFloat(client.current_balance) < 0
                      ? 'text-rose-400'
                      : 'text-zinc-400'
                  }`}
                >
                  ₹{Math.abs(parseFloat(client.current_balance)).toLocaleString()}
                  <span className="text-xs ml-1">
                    {parseFloat(client.current_balance) > 0
                      ? 'receivable'
                      : parseFloat(client.current_balance) < 0
                      ? 'payable'
                      : ''}
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-3 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1">
                  <Eye size={14} />
                  View Ledger
                </button>
                <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                  <Edit size={16} className="text-zinc-400" />
                </button>
                <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                  <Trash2 size={16} className="text-rose-400" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Clients;
