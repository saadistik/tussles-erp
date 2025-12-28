import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  X, 
  Calendar, 
  DollarSign, 
  Package, 
  FileText,
  Building2,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Grid3x3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const EmployeeDashboard = () => {
  const { getAccessToken, signOut, userData } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateOrders, setDateOrders] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  
  // Autocomplete state
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

  // Fetch companies
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Fetch orders
  useEffect(() => {
    fetchOrders();
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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Orders fetched:', data);
        // Backend returns orders in data.data, not data.orders
        setOrders(data.data || []);
      } else {
        console.error('Failed to fetch orders:', response.status);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanySearch = (e) => {
    const searchValue = e.target.value;
    setCompanySearch(searchValue);
    
    if (searchValue.trim()) {
      // Filter companies that match the search
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredCompanies(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCompanies([]);
      setShowSuggestions(false);
    }
    
    // Clear selected company when typing
    setSelectedCompanyId('');
    setFormData(prev => ({ ...prev, company_id: '' }));
  };

  const selectCompany = (company) => {
    setCompanySearch(company.name);
    setSelectedCompanyId(company.id);
    setFormData(prev => ({ ...prev, company_id: company.id }));
    setShowSuggestions(false);
  };

  const handleCompanyBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
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
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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
      console.log('Token retrieved:', token ? 'Token exists (length: ' + token.length + ')' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token available. Please log in again.');
      }
      
      // If company is not selected from list, we need to create it first
      let companyIdToUse = selectedCompanyId;
      
      if (!selectedCompanyId && companySearch.trim()) {
        // Create new company
        console.log('Creating new company:', companySearch.trim());
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
          console.log('Company created/found:', companyData);
          companyIdToUse = companyData.data.id;
          // Refresh companies list
          await fetchCompanies();
        } else {
          const errorData = await companyResponse.json();
          console.error('Failed to create company:', errorData);
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
      console.log('Response headers:', response.headers);
      
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
        fetchOrders();
      } else {
        let errorMessage = 'Failed to create order';
        try {
          const error = responseText ? JSON.parse(responseText) : {};
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        console.error('Order creation failed:', errorMessage);
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Failed to create order: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'awaiting_approval':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-blue-400" />;
    }
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

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderDetails = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300); // Delay to allow animation
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
    return filteredOrders.filter(order => {
      if (!order.due_date) return false;
      const orderDate = new Date(order.due_date);
      return orderDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date) => {
    const ordersForDate = getOrdersForDate(date);
    if (ordersForDate.length > 0) {
      setSelectedDate(date);
      setDateOrders(ordersForDate);
      setShowDateModal(true);
    }
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Employee Dashboard
            </h1>
            <p className="text-zinc-400 mt-1 text-xs sm:text-sm">Create and manage your orders</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* View Toggle Buttons */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5 sm:p-1 border border-white/10">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === 'cards' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Calendar</span>
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/20 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">New Order</span>
              <span className="sm:hidden">New</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
              className="flex items-center gap-2 px-3 py-2 sm:px-6 sm:py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-lg text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Order Creation Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Create New Order</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Autocomplete */}
                    <div className="space-y-2 relative">
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                        <Building2 className="w-4 h-4" />
                        Company *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={companySearch}
                          onChange={handleCompanySearch}
                          onFocus={() => companySearch && setShowSuggestions(true)}
                          onBlur={handleCompanyBlur}
                          placeholder="Type company name..."
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && filteredCompanies.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                            {filteredCompanies.map((company) => (
                              <button
                                key={company.id}
                                type="button"
                                onClick={() => selectCompany(company)}
                                className="w-full px-4 py-3 text-left hover:bg-blue-500/20 transition-colors border-b border-zinc-700 last:border-0 flex items-center gap-2"
                              >
                                <Building2 className="w-4 h-4 text-blue-400" />
                                <div>
                                  <div className="text-white font-medium">{company.name}</div>
                                  {company.contact_person && (
                                    <div className="text-xs text-zinc-400">{company.contact_person}</div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* No matches message */}
                        {showSuggestions && companySearch && filteredCompanies.length === 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl p-4">
                            <div className="text-zinc-400 text-sm">
                              No matches found. You can proceed with "{companySearch}" as a new company.
                            </div>
                          </div>
                        )}
                        
                        {/* Selected indicator */}
                        {selectedCompanyId && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        Start typing to see suggestions or enter a new company name
                      </p>
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
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>

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
                  </div>

                  {/* Total Amount Display */}
                  {(formData.quantity && formData.price_per_unit) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Total Amount:</span>
                        <span className="text-2xl font-bold text-blue-400">
                          PKR {parseFloat(calculateTotal()).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <FileText className="w-4 h-4" />
                      Notes
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

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <ImageIcon className="w-4 h-4" />
                      Product Image
                    </label>
                    
                    {!imagePreview ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                          dragActive 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                        <p className="text-zinc-300 mb-1">
                          Drag and drop an image here, or click to select
                        </p>
                        <p className="text-sm text-zinc-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden border border-white/10">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                    >
                      {submitting ? 'Creating...' : 'Create Order'}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setShowForm(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-semibold transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">My Orders</h2>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="all" className="bg-zinc-900">All Orders</option>
              <option value="pending" className="bg-zinc-900">Pending</option>
              <option value="awaiting_approval" className="bg-zinc-900">Awaiting Approval</option>
              <option value="completed" className="bg-zinc-900">Completed</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-zinc-400">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400 text-lg">No orders found</p>
              <p className="text-zinc-500 text-sm mt-2">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} orders` 
                  : 'Create your first order to get started'}
              </p>
            </div>
          ) : viewMode === 'calendar' ? (
            // Calendar View
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2 sm:p-4 md:p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-6">
                <button
                  onClick={previousMonth}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                
                <div className="text-center">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={goToToday}
                    className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors mt-0.5 sm:mt-1"
                  >
                    Today
                  </button>
                </div>
                
                <button
                  onClick={nextMonth}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                  <div key={day} className="text-center text-[10px] sm:text-xs md:text-sm font-semibold text-zinc-500 py-1 sm:py-2">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
                
                {/* Calendar Days */}
                {(() => {
                  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                  const days = [];
                  
                  // Empty cells before first day
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    days.push(
                      <div key={`empty-${i}`} className="min-h-[50px] sm:min-h-[70px] md:min-h-[100px]"></div>
                    );
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
                        whileHover={{ scale: hasOrders ? 1.02 : 1 }}
                        onClick={() => hasOrders && handleDateClick(date)}
                        className={`min-h-[60px] xs:min-h-[80px] sm:min-h-[100px] md:min-h-[120px] p-1 xs:p-1.5 sm:p-2 rounded border sm:rounded-lg transition-all ${
                          isToday 
                            ? 'border-blue-500 bg-blue-500/20' 
                            : hasOrders 
                              ? 'border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/20' 
                              : 'border-white/5 bg-transparent'
                        }`}
                      >
                        <div className="flex flex-col h-full">
                          <span className={`text-[10px] xs:text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                            isToday ? 'text-blue-400' : 'text-white'
                          }`}>
                            {day}
                          </span>
                          
                          {hasOrders && (
                            <div className="flex-1 overflow-hidden space-y-0.5 sm:space-y-1">
                              {ordersForDay.slice(0, 2).map((order, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className={`relative px-1 py-0.5 sm:px-1.5 sm:py-1 rounded text-[8px] xs:text-[9px] sm:text-xs font-medium truncate ${
                                    order.status === 'completed' 
                                      ? 'bg-green-500/20 text-green-300 border border-green-500/50 shadow-lg shadow-green-500/30' 
                                      : order.status === 'awaiting_approval' 
                                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 shadow-lg shadow-yellow-500/30' 
                                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-lg shadow-blue-500/30'
                                  }`}
                                  title={`${order.companies?.name || 'N/A'} - PKR ${parseFloat(order.total_amount).toLocaleString()}`}
                                >
                                  <div className="flex items-center gap-1">
                                    <div className={`w-1 h-1 rounded-full animate-pulse ${
                                      order.status === 'completed' 
                                        ? 'bg-green-400' 
                                        : order.status === 'awaiting_approval' 
                                          ? 'bg-yellow-400' 
                                          : 'bg-blue-400'
                                    }`}></div>
                                    <span className="truncate">{order.companies?.name || 'N/A'}</span>
                                  </div>
                                </motion.div>
                              ))}
                              {ordersForDay.length > 2 && (
                                <div className="text-[8px] xs:text-[9px] sm:text-xs text-center text-zinc-400 font-semibold py-0.5">
                                  +{ordersForDay.length - 2} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>
          ) : (
            // Cards View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => openOrderDetails(order)}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  {/* Image Thumbnail */}
                  <div className="relative h-48 bg-zinc-900 overflow-hidden">
                    {order.tussle_image_url ? (
                      <img 
                        src={order.tussle_image_url} 
                        alt="Order tussle" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-zinc-700" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    {/* Company Name */}
                    <h3 className="text-lg font-semibold text-white truncate">
                      {order.companies?.name || 'N/A'}
                    </h3>
                    
                    {/* Due Date */}
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {order.due_date ? new Date(order.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                    </div>
                    
                    {/* Total Amount */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-sm text-zinc-500">Total Amount</span>
                      <span className="text-lg font-bold text-blue-400">
                        PKR {parseFloat(order.total_amount).toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Quick Info */}
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Qty: {order.quantity.toLocaleString()}</span>
                      <span>#{order.id.substring(0, 8)}...</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Order Details Modal */}
        <AnimatePresence>
          {isModalOpen && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOrderDetails}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-zinc-900 border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
              {/* Modal Header */}
              <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">Order Details</h2>
                  <p className="text-sm text-zinc-400 mt-1">#{selectedOrder.id}</p>
                </div>
                <button
                  onClick={closeOrderDetails}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Image */}
                {selectedOrder.tussle_image_url && (
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <img 
                      src={selectedOrder.tussle_image_url} 
                      alt="Order tussle" 
                      className="w-full h-auto max-h-96 object-contain bg-zinc-950"
                    />
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center justify-center">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Company & Creator Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-zinc-500">Company</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{selectedOrder.companies?.name || 'N/A'}</p>
                    {selectedOrder.companies?.contact_person && (
                      <p className="text-sm text-zinc-400 mt-1">{selectedOrder.companies.contact_person}</p>
                    )}
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-zinc-500">Created By</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{selectedOrder.creator?.full_name || 'Unknown'}</p>
                    {selectedOrder.creator?.email && (
                      <p className="text-sm text-zinc-400 mt-1">{selectedOrder.creator.email}</p>
                    )}
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-sm text-zinc-500 mb-1">Quantity</p>
                    <p className="text-2xl font-bold text-white">{selectedOrder.quantity.toLocaleString()}</p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-sm text-zinc-500 mb-1">Price Per Unit</p>
                    <p className="text-2xl font-bold text-white">PKR {parseFloat(selectedOrder.price_per_unit).toLocaleString()}</p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-sm text-zinc-500 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-400">PKR {parseFloat(selectedOrder.total_amount).toLocaleString()}</p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-sm text-zinc-500 mb-1">Due Date</p>
                    <p className="text-2xl font-bold text-white">
                      {selectedOrder.due_date ? new Date(selectedOrder.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-sm text-zinc-500 mb-2">Notes</p>
                    <p className="text-white">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Created At:</span>
                    <span className="text-white">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                  </div>
                  {selectedOrder.approved_at && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Approved At:</span>
                      <span className="text-white">{new Date(selectedOrder.approved_at).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Completed At:</span>
                      <span className="text-white">{new Date(selectedOrder.completed_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur-md border-t border-white/10 p-6">
                <button
                  onClick={closeOrderDetails}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>

        {/* Date Orders Modal */}
        <AnimatePresence>
          {showDateModal && selectedDate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDateModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-zinc-900 border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">{dateOrders.length} order{dateOrders.length !== 1 ? 's' : ''} due</p>
                  </div>
                  <button
                    onClick={closeDateModal}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-zinc-400" />
                  </button>
                </div>

                {/* Orders List */}
                <div className="p-6 space-y-4">
                  {dateOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        closeDateModal();
                        openOrderDetails(order);
                      }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-lg bg-zinc-950 overflow-hidden flex-shrink-0">
                          {order.tussle_image_url ? (
                            <img 
                              src={order.tussle_image_url} 
                              alt="Order" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-zinc-700" />
                            </div>
                          )}
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-white truncate">
                              {order.companies?.name || 'N/A'}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-zinc-500">Quantity</p>
                              <p className="text-white font-medium">{order.quantity.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500">Price/Unit</p>
                              <p className="text-white font-medium">PKR {parseFloat(order.price_per_unit).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500">Total</p>
                              <p className="text-blue-400 font-bold">PKR {parseFloat(order.total_amount).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500">Created By</p>
                              <p className="text-white font-medium truncate">{order.creator?.full_name || 'Unknown'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur-md border-t border-white/10 p-6">
                  <button
                    onClick={closeDateModal}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
