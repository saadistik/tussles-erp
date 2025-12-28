// ============================================
// Owner Dashboard with Financial Overview (Dark Mode)
// File: frontend/src/pages/OwnerDashboard.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  Package, 
  Loader2, 
  RefreshCw, 
  LogOut,
  History,
  Calendar,
  User,
  Building2,
  Plus,
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const OwnerDashboard = () => {
  const { userData, getAccessToken, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'completed', 'calendar'
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateOrders, setDateOrders] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form and company autocomplete state
  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [formData, setFormData] = useState({
    company_id: '',
    quantity: '',
    price_per_unit: '',
    due_date: '',
    notes: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_URL}/api/orders/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats
      const statsResponse = await axios.get(`${API_URL}/api/orders/dashboard/stats`, { headers });
      setStats(statsResponse.data.data);

      // Fetch pending approvals
      const ordersResponse = await axios.get(`${API_URL}/api/orders?status=awaiting_approval`, { headers });
      setPendingOrders(ordersResponse.data.data);

      // Fetch completed orders
      const completedResponse = await axios.get(`${API_URL}/api/orders/completed`, { headers });
      setCompletedOrders(completedResponse.data.data);

      // Fetch all orders for calendar
      const allOrdersResponse = await axios.get(`${API_URL}/api/orders`, { headers });
      setAllOrders(allOrdersResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Company search handlers
  const handleCompanySearch = (value) => {
    setCompanySearch(value);
    setShowSuggestions(true);
    
    if (value.trim()) {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies([]);
      setSelectedCompanyId('');
    }
  };

  const selectCompany = (company) => {
    setCompanySearch(company.name);
    setSelectedCompanyId(company.id);
    setShowSuggestions(false);
    setFilteredCompanies([]);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const calculateTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const pricePerUnit = parseFloat(formData.price_per_unit) || 0;
    return (quantity * pricePerUnit).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!companySearch.trim() || !formData.quantity || !formData.price_per_unit) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const token = await getAccessToken();
      
      if (!token) {
        throw new Error('No authentication token available. Please log in again.');
      }
      
      let companyIdToUse = selectedCompanyId;
      
      if (!selectedCompanyId && companySearch.trim()) {
        const companyResponse = await fetch(`${API_URL}/api/orders/companies`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: companySearch.trim()
          })
        });
        
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          companyIdToUse = companyData.data.id;
          await fetchCompanies();
        } else {
          const errorData = await companyResponse.json();
          throw new Error(errorData.message || 'Failed to create company');
        }
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('company_id', companyIdToUse);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('price_per_unit', formData.price_per_unit);
      formDataToSend.append('total_amount', calculateTotal());
      formDataToSend.append('due_date', formData.due_date || new Date().toISOString().split('T')[0]);
      formDataToSend.append('notes', formData.notes);
      
      if (imageFile) {
        formDataToSend.append('tussle_image', imageFile);
      }

      console.log('Sending order request to:', `${API_URL}/api/orders`);
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      console.log('Response status:', response.status);
      
      // Get response text first to debug
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        const data = responseText ? JSON.parse(responseText) : {};
        alert('Order created successfully!');
        setFormData({
          company_id: '',
          quantity: '',
          price_per_unit: '',
          due_date: '',
          notes: ''
        });
        setCompanySearch('');
        setSelectedCompanyId('');
        setImageFile(null);
        setImagePreview(null);
        setShowForm(false);
        fetchDashboardData();
      } else {
        let errorMessage = 'Failed to create order';
        try {
          const error = responseText ? JSON.parse(responseText) : {};
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      alert(`Failed to create order: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getOrdersForDate = (date) => {
    return allOrders.filter(order => {
      const orderDate = new Date(order.due_date);
      return orderDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date) => {
    const ordersOnDate = getOrdersForDate(date);
    setSelectedDate(date);
    setDateOrders(ordersOnDate);
    setShowDateModal(true);
  };

  const closeDateModal = () => {
    setShowDateModal(false);
    setTimeout(() => {
      setSelectedDate(null);
      setDateOrders([]);
    }, 300);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setShowDateModal(false);
  };

  const closeOrderDetails = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'awaiting_approval':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const handleApprove = async (orderId) => {
    if (!window.confirm('Are you sure you want to approve this order?')) {
      return;
    }

    try {
      const token = await getAccessToken();
      await axios.post(`${API_URL}/api/orders/${orderId}/approve`, {}, {
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
          <div className="flex items-center space-x-3">
            {/* Add Order Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Order</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchDashboardData}
              className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 hover:border-blue-500 transition flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </motion.button>
          </div>
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

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 border-b border-zinc-800"
        >
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'pending'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Approvals ({pendingOrders.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'completed'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Completed Orders ({completedOrders.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'calendar'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar View
            </div>
          </button>
        </motion.div>

        {/* Approval Queue */}
        {activeTab === 'pending' && (
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
        )}

        {/* Completed Orders History */}
        {activeTab === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Completed Orders History ({completedOrders.length})
            </h2>

            {completedOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
                <p className="text-zinc-400">No completed orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 hover:border-green-500/50 transition"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image */}
                      {order.tussle_image_url && (
                        <img
                          src={order.tussle_image_url}
                          alt="Tussle Design"
                          className="w-full md:w-32 h-32 object-cover rounded-lg"
                        />
                      )}

                      {/* Order Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-white text-lg">{order.order_number}</h3>
                            <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                              <Building2 className="w-4 h-4" />
                              <span>{order.companies?.name}</span>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-md border border-green-500/50 font-medium">
                            COMPLETED
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-zinc-500 block">Quantity</span>
                            <span className="text-white font-medium">{order.quantity} units</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Price/Unit</span>
                            <span className="text-white font-medium">PKR {parseFloat(order.price_per_unit).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Total Amount</span>
                            <span className="text-green-400 font-bold">PKR {parseFloat(order.total_amount).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Due Date</span>
                            <span className="text-white font-medium">{new Date(order.due_date).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-zinc-400 pt-2 border-t border-zinc-700">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Created by: {order.creator?.full_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Approved by: {order.approver?.full_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Completed: {new Date(order.approved_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {order.notes && (
                          <p className="text-sm text-zinc-400 italic bg-zinc-900/50 p-2 rounded">
                            "{order.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Calendar View Tab */}
        {activeTab === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 md:p-6"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Order Calendar
              </h2>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={previousMonth}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </motion.button>
                <div className="text-center min-w-[140px]">
                  <h3 className="text-lg font-semibold text-white">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextMonth}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToToday}
                  className="ml-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                >
                  Today
                </motion.button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-zinc-800/30 backdrop-blur-sm rounded-xl p-2 md:p-4">
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs md:text-sm font-semibold text-zinc-400 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {(() => {
                  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                  const days = [];
                  
                  // Empty cells for days before month starts
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    days.push(<div key={`empty-${i}`} className="min-h-[120px] md:min-h-[140px]"></div>);
                  }
                  
                  // Days of month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const ordersForDay = getOrdersForDate(date);
                    const isToday = new Date().toDateString() === date.toDateString();
                    const hasOrders = ordersForDay.length > 0;
                    
                    days.push(
                      <motion.div
                        key={day}
                        whileHover={{ scale: hasOrders ? 1.05 : 1 }}
                        onClick={() => hasOrders && handleDateClick(date)}
                        className={`min-h-[120px] md:min-h-[140px] p-1.5 md:p-2 rounded-lg border transition-all ${
                          isToday 
                            ? 'border-blue-500 bg-blue-500/20' 
                            : hasOrders 
                              ? 'border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/20' 
                              : 'border-white/5 bg-transparent'
                        }`}
                      >
                        <div className="text-xs md:text-sm font-semibold text-white mb-1">{day}</div>
                        {hasOrders && (
                          <div className="space-y-1">
                            {ordersForDay.slice(0, 4).map((order, idx) => {
                              const colors = ['shadow-green-500/50', 'shadow-yellow-500/50', 'shadow-blue-500/50'];
                              const bgColors = ['bg-green-500/20', 'bg-yellow-500/20', 'bg-blue-500/20'];
                              const textColors = ['text-green-300', 'text-yellow-300', 'text-blue-300'];
                              
                              return (
                                <div 
                                  key={order.id}
                                  className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded ${bgColors[idx % 3]} ${textColors[idx % 3]} truncate shadow-lg ${colors[idx % 3]} animate-pulse`}
                                  title={order.companies?.name}
                                >
                                  {order.companies?.name}
                                </div>
                              );
                            })}
                            {ordersForDay.length > 4 && (
                              <div className="text-[10px] text-center text-white/60">
                                +{ordersForDay.length - 4} more
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Creation Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Form Header */}
                <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 p-4 md:p-6 flex justify-between items-center z-10">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <Plus className="w-6 h-6" />
                    Create New Order
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition"
                  >
                    <X className="w-6 h-6 text-zinc-400" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
                  {/* Company Field with Autocomplete */}
                  <div className="space-y-2 relative">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <Building2 className="w-4 h-4" />
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={companySearch}
                      onChange={(e) => handleCompanySearch(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      required
                      placeholder="Type to search or add new company..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    
                    {/* Autocomplete Suggestions */}
                    {showSuggestions && filteredCompanies.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {filteredCompanies.map((company) => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => selectCompany(company)}
                            className="w-full text-left px-4 py-2 hover:bg-zinc-700 transition-colors text-white"
                          >
                            {company.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <Package className="w-4 h-4" />
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      step="1"
                      placeholder="Enter quantity"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Price Per Unit */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <DollarSign className="w-4 h-4" />
                      Price Per Unit (PKR) *
                    </label>
                    <input
                      type="number"
                      name="price_per_unit"
                      value={formData.price_per_unit}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="Enter price per unit"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Total Amount Display */}
                  {(formData.quantity && formData.price_per_unit) && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-sm text-zinc-400 mb-1">Total Amount</p>
                      <p className="text-3xl font-bold text-green-400">
                        PKR {calculateTotal()}
                      </p>
                    </div>
                  )}

                  {/* Due Date */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <ImageIcon className="w-4 h-4" />
                      Tussle Design Image
                    </label>
                    
                    {!imagePreview ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                          dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        <Upload className="w-12 h-12 mx-auto mb-3 text-zinc-500" />
                        <p className="text-zinc-400 mb-2">Drag & drop or click to upload</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-block px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer transition"
                        >
                          Choose File
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full transition"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <FileText className="w-4 h-4" />
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Add any additional notes..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create Order
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date Orders Modal */}
        <AnimatePresence>
          {showDateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={closeDateModal}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    Orders for {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <button onClick={closeDateModal} className="p-2 hover:bg-zinc-800 rounded-lg transition">
                    <X className="w-6 h-6 text-zinc-400" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
                  {dateOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => openOrderDetails(order)}
                      className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-blue-500/50 transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{order.order_number}</h4>
                          <p className="text-sm text-zinc-400">{order.companies?.name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-zinc-500">Quantity</p>
                          <p className="text-white font-medium">{order.quantity.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Total</p>
                          <p className="text-green-400 font-medium">PKR {parseFloat(order.total_amount).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Details Modal */}
        <AnimatePresence>
          {isModalOpen && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={closeOrderDetails}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="relative h-48 md:h-64 bg-gradient-to-br from-blue-600 to-purple-600">
                  {selectedOrder.tussle_image_url ? (
                    <img
                      src={selectedOrder.tussle_image_url}
                      alt="Order"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <button
                    onClick={closeOrderDetails}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{selectedOrder.order_number}</h2>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Building2 className="w-4 h-4" />
                        <span>{selectedOrder.companies?.name}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-zinc-800/50 rounded-xl p-4">
                      <p className="text-sm text-zinc-500 mb-1">Quantity</p>
                      <p className="text-2xl font-bold text-white">{selectedOrder.quantity.toLocaleString()}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-xl p-4">
                      <p className="text-sm text-zinc-500 mb-1">Price/Unit</p>
                      <p className="text-2xl font-bold text-white">PKR {parseFloat(selectedOrder.price_per_unit).toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30 col-span-2 md:col-span-1">
                      <p className="text-sm text-green-400 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-green-400">PKR {parseFloat(selectedOrder.total_amount).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4 bg-zinc-800/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-400">Created by:</span>
                      <span className="text-white font-medium">{selectedOrder.creator?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-400">Due Date:</span>
                      <span className="text-white font-medium">{new Date(selectedOrder.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-400">Created:</span>
                      <span className="text-white font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                    {selectedOrder.approved_by && (
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-zinc-400">Approved by:</span>
                        <span className="text-white font-medium">{selectedOrder.approver?.full_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div className="mt-4 bg-zinc-800/50 rounded-xl p-4">
                      <p className="text-sm text-zinc-400 mb-2">Notes</p>
                      <p className="text-white italic">"{selectedOrder.notes}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OwnerDashboard;