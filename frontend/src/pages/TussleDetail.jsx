// ============================================
// Tussle Detail Page - Album Art Style
// File: frontend/src/pages/TussleDetail.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Calendar,
  ChevronRight,
  Plus,
  Receipt,
  Users,
  CheckCircle,
  Clock,
  X,
  Upload,
  Search
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

const TussleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();
  
  const [tussle, setTussle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, materials, labor
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [workAssignments, setWorkAssignments] = useState([]);

  // Allocation form state
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [allocateAmount, setAllocateAmount] = useState('');
  const [allocateNotes, setAllocateNotes] = useState('');
  const [receiptSearch, setReceiptSearch] = useState('');

  useEffect(() => {
    fetchTussleData();
  }, [id]);

  const fetchTussleData = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();

      // Fetch tussle details
      const { data: tussleData, error: tussleError } = await supabase
        .from('tussles')
        .select(`
          *,
          company:companies(id, name, logo_url),
          created_by_user:users!tussles_created_by_fkey(full_name)
        `)
        .eq('id', id)
        .single();

      if (tussleError) throw tussleError;
      setTussle(tussleData);

      // Fetch allocations for this tussle
      const { data: allocData, error: allocError } = await supabase
        .from('expense_allocations')
        .select(`
          *,
          receipt:receipts(id, vendor_name, total_amount, purchase_date, receipt_image_url, category)
        `)
        .eq('tussle_id', id);

      if (!allocError) setAllocations(allocData || []);

      // Fetch work assignments
      const { data: assignData, error: assignError } = await supabase
        .from('work_assignments')
        .select(`
          *,
          worker:workers(id, name, phone, specialty)
        `)
        .eq('tussle_id', id);

      if (!assignError) setWorkAssignments(assignData || []);

      // Fetch available receipts
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('receipts')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (!receiptsError) setReceipts(receiptsData || []);

      // Fetch workers
      const { data: workersData, error: workersError } = await supabase
        .from('workers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!workersError) setWorkers(workersData || []);

    } catch (error) {
      console.error('Error fetching tussle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateReceipt = async () => {
    if (!selectedReceipt || !allocateAmount) return;

    const amount = parseFloat(allocateAmount);
    if (amount <= 0 || amount > selectedReceipt.remaining_amount) {
      alert(`Invalid amount. Maximum available: $${selectedReceipt.remaining_amount}`);
      return;
    }

    try {
      const token = await getAccessToken();
      
      // Optimistic UI update
      const newAllocation = {
        id: `temp-${Date.now()}`,
        receipt_id: selectedReceipt.id,
        tussle_id: id,
        allocated_amount: amount,
        notes: allocateNotes,
        receipt: selectedReceipt,
        created_at: new Date().toISOString()
      };
      
      setAllocations(prev => [...prev, newAllocation]);
      setTussle(prev => ({
        ...prev,
        material_cost: (parseFloat(prev.material_cost) || 0) + amount
      }));

      // Close modal immediately (Optimistic UI)
      setShowAllocateModal(false);
      setSelectedReceipt(null);
      setAllocateAmount('');
      setAllocateNotes('');

      // Background API call
      const { data, error } = await supabase
        .from('expense_allocations')
        .insert([{
          receipt_id: selectedReceipt.id,
          tussle_id: id,
          allocated_amount: amount,
          notes: allocateNotes
        }])
        .select(`
          *,
          receipt:receipts(id, vendor_name, total_amount, purchase_date, receipt_image_url, category)
        `)
        .single();

      if (error) throw error;

      // Replace temp allocation with real one
      setAllocations(prev => prev.map(a => 
        a.id === newAllocation.id ? data : a
      ));

      // Refresh tussle to get updated costs
      fetchTussleData();

    } catch (error) {
      console.error('Error allocating receipt:', error);
      // Rollback on error
      setAllocations(prev => prev.filter(a => !a.id.startsWith('temp-')));
      alert('Failed to allocate receipt. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'awaiting_approval': return 'bg-cream-100 text-amber-800 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-bamboo-100 text-bamboo-800 border-bamboo-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'materials', label: 'Materials', icon: Receipt },
    { id: 'labor', label: 'Labor', icon: Users },
  ];

  const filteredReceipts = receipts.filter(r => 
    r.remaining_amount > 0 &&
    (receiptSearch === '' || 
     r.vendor_name?.toLowerCase().includes(receiptSearch.toLowerCase()) ||
     r.category?.toLowerCase().includes(receiptSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!tussle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800">Tussle not found</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-emerald-600"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const profitMargin = tussle.sell_price > 0 
    ? ((tussle.gross_profit / tussle.sell_price) * 100).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen pb-24">
      {/* Album Art Header */}
      <motion.div 
        className="relative h-80 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Cover Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: tussle.reference_image_url 
              ? `url(${tussle.reference_image_url})` 
              : 'linear-gradient(135deg, #10b981, #14b8a6)',
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-4 glass rounded-full p-2 text-white tactile z-10"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={24} />
        </motion.button>

        {/* Tussle Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Status Badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getStatusColor(tussle.status)}`}>
              {tussle.status.replace('_', ' ').toUpperCase()}
            </span>

            {/* Tussle Name */}
            <h1 className="text-3xl font-bold mb-2">{tussle.name}</h1>

            {/* Company */}
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <Building2 size={16} />
              <span className="text-sm">{tussle.company?.name}</span>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Package size={16} />
                <span>{tussle.quantity} units</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign size={16} />
                <span>${tussle.sell_price?.toLocaleString()}</span>
              </div>
              {tussle.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{new Date(tussle.due_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/30 px-4">
        <div className="flex gap-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl
                  font-medium text-sm transition-all relative
                  ${isActive ? 'text-emerald-800' : 'text-bamboo-600'}
                `}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 glass rounded-2xl"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon size={18} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Financial Summary Card */}
              <div className="glass rounded-3xl p-6 shadow-glass">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Financial Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-bamboo-600">Sell Price</span>
                    <span className="text-lg font-bold text-emerald-700">
                      ${tussle.sell_price?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-bamboo-600">Material Cost</span>
                    <span className="text-slate-700">
                      ${tussle.material_cost?.toLocaleString() || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-bamboo-600">Labor Cost</span>
                    <span className="text-slate-700">
                      ${tussle.labor_cost?.toLocaleString() || '0.00'}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-bamboo-600">Total Cost</span>
                    <span className="text-slate-700">
                      ${tussle.total_cost?.toLocaleString() || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-slate-800">Gross Profit</span>
                    <span className={`text-xl font-bold ${
                      tussle.gross_profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      ${tussle.gross_profit?.toLocaleString() || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-bamboo-600">Profit Margin</span>
                    <span className={`text-sm font-semibold ${
                      profitMargin >= 20 ? 'text-emerald-600' : 
                      profitMargin >= 10 ? 'text-teal-600' : 'text-amber-600'
                    }`}>
                      {profitMargin}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {tussle.notes && (
                <div className="glass rounded-3xl p-6 shadow-glass">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Notes</h3>
                  <p className="text-bamboo-600 text-sm">{tussle.notes}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="glass-subtle rounded-3xl p-4 shadow-glass">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-bamboo-500 text-xs mb-1">Created By</div>
                    <div className="text-slate-800 font-medium">
                      {tussle.created_by_user?.full_name || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <div className="text-bamboo-500 text-xs mb-1">Created On</div>
                    <div className="text-slate-800 font-medium">
                      {new Date(tussle.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* MATERIALS TAB */}
          {activeTab === 'materials' && (
            <motion.div
              key="materials"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Add Material Button */}
              <motion.button
                onClick={() => setShowAllocateModal(true)}
                className="w-full glass-strong rounded-3xl p-4 shadow-glass tactile
                         flex items-center justify-center gap-2 text-emerald-700 font-semibold"
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} />
                <span>Add Material Receipt</span>
              </motion.button>

              {/* Allocations List */}
              {allocations.length === 0 ? (
                <div className="glass rounded-3xl p-8 text-center shadow-glass">
                  <Receipt size={48} className="mx-auto mb-4 text-bamboo-400" />
                  <p className="text-bamboo-600">No materials allocated yet</p>
                  <p className="text-sm text-bamboo-500 mt-2">
                    Tap "Add Material Receipt" to start
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allocations.map((allocation) => (
                    <motion.div
                      key={allocation.id}
                      className="glass rounded-2xl p-4 shadow-glass"
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex gap-3">
                        {/* Receipt Image Thumbnail */}
                        {allocation.receipt?.receipt_image_url ? (
                          <img 
                            src={allocation.receipt.receipt_image_url}
                            alt="Receipt"
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-bamboo-100 rounded-xl flex items-center justify-center">
                            <Receipt size={24} className="text-bamboo-400" />
                          </div>
                        )}

                        {/* Allocation Info */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">
                            {allocation.receipt?.vendor_name || 'Unknown Vendor'}
                          </h4>
                          <p className="text-sm text-bamboo-600">
                            {allocation.receipt?.category || 'General'} • 
                            {new Date(allocation.receipt?.purchase_date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-bamboo-500">Allocated</span>
                            <span className="text-lg font-bold text-emerald-700">
                              ${allocation.allocated_amount?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Allocation Notes */}
                      {allocation.notes && (
                        <p className="text-xs text-bamboo-600 mt-2 pl-2 border-l-2 border-bamboo-200">
                          {allocation.notes}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Total Material Cost Summary */}
              <div className="glass-dark rounded-3xl p-4 shadow-glass">
                <div className="flex justify-between items-center">
                  <span className="text-white/90 font-medium">Total Material Cost</span>
                  <span className="text-2xl font-bold text-white">
                    ${tussle.material_cost?.toLocaleString() || '0.00'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* LABOR TAB */}
          {activeTab === 'labor' && (
            <motion.div
              key="labor"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Add Worker Button */}
              <motion.button
                onClick={() => navigate(`/tussles/${id}/assign-worker`)}
                className="w-full glass-strong rounded-3xl p-4 shadow-glass tactile
                         flex items-center justify-center gap-2 text-teal-700 font-semibold"
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} />
                <span>Assign Worker</span>
              </motion.button>

              {/* Work Assignments List */}
              {workAssignments.length === 0 ? (
                <div className="glass rounded-3xl p-8 text-center shadow-glass">
                  <Users size={48} className="mx-auto mb-4 text-bamboo-400" />
                  <p className="text-bamboo-600">No workers assigned yet</p>
                  <p className="text-sm text-bamboo-500 mt-2">
                    Tap "Assign Worker" to start
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workAssignments.map((assignment) => (
                    <motion.div
                      key={assignment.id}
                      className="glass rounded-2xl p-4 shadow-glass"
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-800">
                            {assignment.worker?.name}
                          </h4>
                          <p className="text-sm text-bamboo-600">
                            {assignment.worker?.specialty}
                          </p>
                        </div>
                        <span className={`
                          px-2 py-1 rounded-lg text-xs font-medium
                          ${assignment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            assignment.status === 'in_progress' ? 'bg-teal-100 text-teal-700' :
                            assignment.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                            'bg-bamboo-100 text-bamboo-700'}
                        `}>
                          {assignment.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-bamboo-500 text-xs">Quantity</div>
                          <div className="font-semibold text-slate-800">
                            {assignment.quantity_assigned}
                          </div>
                        </div>
                        <div>
                          <div className="text-bamboo-500 text-xs">Rate/Unit</div>
                          <div className="font-semibold text-slate-800">
                            ${assignment.rate_per_unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-bamboo-500 text-xs">Total</div>
                          <div className="font-bold text-teal-700">
                            ${assignment.total_pay?.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {assignment.due_date && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-bamboo-600">
                          <Calendar size={14} />
                          <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Total Labor Cost Summary */}
              <div className="glass-dark rounded-3xl p-4 shadow-glass">
                <div className="flex justify-between items-center">
                  <span className="text-white/90 font-medium">Total Labor Cost</span>
                  <span className="text-2xl font-bold text-white">
                    ${tussle.labor_cost?.toLocaleString() || '0.00'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Allocate Receipt Modal */}
      <AnimatePresence>
        {showAllocateModal && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllocateModal(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-90 max-h-[80vh] overflow-auto"
              initial={{ opacity: 0, scale: 0.9, y: '-40%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: '-40%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="glass-strong rounded-4xl p-6 shadow-glass-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Allocate Receipt</h3>
                  <button
                    onClick={() => setShowAllocateModal(false)}
                    className="glass rounded-full p-2 tactile"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Search Receipts */}
                <div className="mb-4">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-bamboo-400" />
                    <input
                      type="text"
                      placeholder="Search receipts..."
                      value={receiptSearch}
                      onChange={(e) => setReceiptSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/30 rounded-2xl
                               text-slate-800 placeholder-bamboo-400 focus:outline-none focus:ring-2 
                               focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Receipt Selection */}
                <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                  {filteredReceipts.length === 0 ? (
                    <div className="text-center py-8 text-bamboo-600">
                      No receipts available for allocation
                    </div>
                  ) : (
                    filteredReceipts.map((receipt) => (
                      <motion.button
                        key={receipt.id}
                        onClick={() => setSelectedReceipt(receipt)}
                        className={`
                          w-full text-left p-4 rounded-2xl border-2 transition-all
                          ${selectedReceipt?.id === receipt.id 
                            ? 'bg-emerald-50 border-emerald-500 shadow-glow' 
                            : 'bg-white/30 border-white/30 hover:border-emerald-300'}
                        `}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {receipt.vendor_name}
                            </h4>
                            <p className="text-sm text-bamboo-600">
                              {receipt.category} • {new Date(receipt.purchase_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-bamboo-500">Available</div>
                            <div className="text-lg font-bold text-emerald-700">
                              ${receipt.remaining_amount?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>

                {/* Amount Input */}
                {selectedReceipt && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Amount to Allocate
                      </label>
                      <div className="relative">
                        <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-bamboo-400" />
                        <input
                          type="number"
                          step="0.01"
                          max={selectedReceipt.remaining_amount}
                          placeholder="0.00"
                          value={allocateAmount}
                          onChange={(e) => setAllocateAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/30 rounded-2xl
                                   text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <p className="text-xs text-bamboo-500 mt-1">
                        Maximum: ${selectedReceipt.remaining_amount?.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        placeholder="Why this allocation?"
                        value={allocateNotes}
                        onChange={(e) => setAllocateNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-2xl
                                 text-slate-800 placeholder-bamboo-400 focus:outline-none focus:ring-2 
                                 focus:ring-emerald-500 resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowAllocateModal(false);
                          setSelectedReceipt(null);
                          setAllocateAmount('');
                          setAllocateNotes('');
                        }}
                        className="flex-1 py-3 rounded-2xl bg-white/50 border border-white/30 
                                 text-slate-700 font-medium tactile"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAllocateReceipt}
                        disabled={!allocateAmount || parseFloat(allocateAmount) <= 0}
                        className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-semibold 
                                 tactile disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
                      >
                        Allocate
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TussleDetail;
