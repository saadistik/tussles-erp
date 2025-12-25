import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, Trash2 } from 'lucide-react';
import { api } from '../config/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [filterType]);

  const fetchOrders = async () => {
    try {
      const params = filterType !== 'all' ? { type: filterType } : {};
      const response = await api.get('/orders.php', { params });
      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_name.toLowerCase().includes(searchTerm.toLowerCase())
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
            Orders
          </h1>
          <p className="text-zinc-400 mt-1">Manage sales, purchases, and samples</p>
        </div>
        <button className="btn-glow flex items-center gap-2">
          <Plus size={20} />
          New Order
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
              placeholder="Search orders..."
              className="input-field pl-11 w-full"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            {['all', 'sale', 'purchase', 'sample'].map((type) => (
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

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Order #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Client</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Pending</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-zinc-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-zinc-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row-hover border-b border-zinc-800/50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-indigo-400">{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{order.order_date}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-zinc-200">{order.client_name}</p>
                        {order.company_name && (
                          <p className="text-xs text-zinc-500">{order.company_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.type === 'sale'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : order.type === 'purchase'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {order.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-200">
                      ₹{parseFloat(order.grand_total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${
                          parseFloat(order.pending_amount) > 0 ? 'text-amber-400' : 'text-zinc-500'
                        }`}
                      >
                        ₹{parseFloat(order.pending_amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : order.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                          <Eye size={16} className="text-indigo-400" />
                        </button>
                        <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-rose-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Orders;
