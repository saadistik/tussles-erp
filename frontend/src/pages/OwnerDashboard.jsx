// ============================================
// Owner Dashboard with Financial Overview (Dark Mode)
// File: frontend/src/pages/OwnerDashboard.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle, DollarSign, Package, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const OwnerDashboard = () => {
  const { userData, getAccessToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats
      const statsResponse = await axios.get('http://localhost:3000/api/orders/dashboard/stats', { headers });
      setStats(statsResponse.data.data);

      // Fetch pending approvals
      const ordersResponse = await axios.get('http://localhost:3000/api/orders?status=awaiting_approval', { headers });
      setPendingOrders(ordersResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    if (!window.confirm('Are you sure you want to approve this order?')) {
      return;
    }

    try {
      const token = getAccessToken();
      await axios.post(`http://localhost:3000/api/orders/${orderId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Order approved successfully!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to approve order:', error);
      alert(error.response?.data?.message || 'Failed to approve order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Financial Overview</h1>
            <p className="text-zinc-400 mt-1">Welcome back, {userData?.full_name}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboardData}
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 hover:border-blue-500 transition flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 shadow-lg shadow-green-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-white text-3xl font-bold mt-2">
                  PKR {stats?.total_expected_revenue?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Pending Approvals Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-6 shadow-lg shadow-yellow-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending Approvals</p>
                <p className="text-white text-3xl font-bold mt-2">{stats?.pending_approvals || 0}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Completed Orders Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-blue-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Completed Orders</p>
                <p className="text-white text-3xl font-bold mt-2">
                  {stats?.revenue_summary?.find(r => r.status === 'completed')?.order_count || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Revenue Breakdown Table */}
        {stats?.revenue_summary && stats.revenue_summary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Revenue Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Orders</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.revenue_summary.map((item, idx) => (
                    <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition">
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          item.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                          item.status === 'awaiting_approval' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                          'bg-zinc-500/20 text-zinc-400 border border-zinc-500/50'
                        }`}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 text-white">{item.order_count}</td>
                      <td className="text-right py-3 px-4 text-green-400 font-semibold">
                        {item.currency} {parseFloat(item.total_revenue).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Approval Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            Orders Awaiting Approval ({pendingOrders.length})
          </h2>

          {pendingOrders.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-400">No orders awaiting approval</p>
              <p className="text-zinc-600 text-sm mt-2">All caught up!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-blue-500/50 transition"
                >
                  {/* Order Image */}
                  {order.tussle_image_url && (
                    <img
                      src={order.tussle_image_url}
                      alt="Tussle Design"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  {/* Order Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-white">{order.order_number}</h3>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-md border border-yellow-500/50">
                        PENDING
                      </span>
                    </div>

                    <p className="text-zinc-400 text-sm">
                      <span className="text-zinc-500">Company:</span> {order.companies?.name}
                    </p>

                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Quantity:</span>
                      <span className="text-white">{order.quantity} units</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Price/Unit:</span>
                      <span className="text-white">PKR {parseFloat(order.price_per_unit).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
                      <span className="text-zinc-500 text-sm">Total:</span>
                      <span className="text-green-400 font-bold text-lg">
                        PKR {parseFloat(order.total_amount).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-zinc-500">
                      <Clock className="w-4 h-4" />
                      <span>Due: {new Date(order.due_date).toLocaleDateString()}</span>
                    </div>

                    <p className="text-xs text-zinc-500">
                      Created by: {order.creator?.full_name}
                    </p>

                    {order.notes && (
                      <p className="text-sm text-zinc-400 italic bg-zinc-900/50 p-2 rounded">
                        "{order.notes}"
                      </p>
                    )}

                    {/* Approve Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApprove(order.id)}
                      className="w-full mt-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition font-semibold"
                    >
                      Approve Order
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
