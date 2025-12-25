import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { api } from '../config/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard.php');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-indigo-400 text-xl animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  const { summary, overdue_payments, recent_transactions, low_stock_products, sales_trend } =
    dashboardData || {};

  // Stats Cards Configuration
  const statsCards = [
    {
      title: 'Total Sales',
      value: `₹${summary?.total_sales?.toLocaleString() || 0}`,
      change: summary?.sales_growth || 0,
      icon: TrendingUp,
      color: 'emerald',
      subtitle: `${summary?.sales_count || 0} orders`,
    },
    {
      title: 'Net Profit',
      value: `₹${summary?.net_profit?.toLocaleString() || 0}`,
      change: 0,
      icon: DollarSign,
      color: 'indigo',
      subtitle: 'This month',
    },
    {
      title: 'Total Receivables',
      value: `₹${summary?.total_receivables?.toLocaleString() || 0}`,
      icon: AlertCircle,
      color: 'amber',
      subtitle: 'Pending payments',
    },
    {
      title: 'Stock Value',
      value: `₹${(summary?.total_sales * 0.3)?.toLocaleString() || 0}`,
      icon: Package,
      color: 'rose',
      subtitle: `${low_stock_products?.length || 0} low stock items`,
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          Dashboard
        </h1>
        <p className="text-zinc-400 mt-1">Welcome to your trading command center</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsCards.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-400" />
            Sales Trend (7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sales_trend || []}>
              <XAxis
                dataKey="date"
                stroke="#52525b"
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
              />
              <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package size={20} className="text-rose-400" />
            Low Stock Alert
          </h3>
          <div className="space-y-3">
            {low_stock_products?.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <p className="font-medium text-sm text-zinc-200">{product.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-zinc-400">
                    {product.stock_qty} {product.unit}
                  </span>
                  <span className="text-xs text-rose-400">Low Stock</span>
                </div>
              </div>
            )) || <p className="text-zinc-500 text-sm">No low stock items</p>}
          </div>
        </motion.div>
      </div>

      {/* Overdue Payments & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Payments */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-400" />
            Overdue Payments
          </h3>
          <div className="space-y-2">
            {overdue_payments?.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="p-3 bg-zinc-800/30 rounded-lg table-row-hover"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{payment.client_name}</p>
                    <p className="text-xs text-zinc-400">{payment.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-400">
                      ₹{payment.pending_amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-rose-400">{payment.days_overdue} days</p>
                  </div>
                </div>
              </div>
            )) || <p className="text-zinc-500 text-sm">No overdue payments</p>}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-2">
            {recent_transactions?.map((transaction) => (
              <div
                key={transaction.id}
                className="p-3 bg-zinc-800/30 rounded-lg table-row-hover"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{transaction.client_name}</p>
                    <p className="text-xs text-zinc-400">{transaction.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === 'sale' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {transaction.type === 'sale' ? '+' : '-'}₹
                      {transaction.grand_total?.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        transaction.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            )) || <p className="text-zinc-500 text-sm">No recent transactions</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    indigo: 'text-indigo-400 bg-indigo-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    rose: 'text-rose-400 bg-rose-500/10',
  };

  return (
    <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-zinc-400 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-2xl font-bold mb-1">{value}</h3>
          {subtitle && <p className="text-zinc-500 text-xs">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      {change !== undefined && change !== 0 && (
        <div className="mt-4 flex items-center gap-1 text-sm">
          {change > 0 ? (
            <>
              <ArrowUpRight size={16} className="text-emerald-400" />
              <span className="text-emerald-400">+{change.toFixed(1)}%</span>
            </>
          ) : (
            <>
              <ArrowDownRight size={16} className="text-rose-400" />
              <span className="text-rose-400">{change.toFixed(1)}%</span>
            </>
          )}
          <span className="text-zinc-500">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
