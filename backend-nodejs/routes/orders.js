// ============================================
// Orders Routes
// File: backend-nodejs/routes/orders.js
// ============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const { requireAuth, requireOwner } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ============================================
// GET /api/orders - Get all orders
// ============================================
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        companies:company_id (id, name, contact_person, phone, email),
        creator:created_by (id, full_name, email, role)
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Employees can only see their own orders
    if (req.user.role === 'employee') {
      query = query.eq('created_by', req.userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// POST /api/orders - Create new order
// ============================================
router.post('/', requireAuth, upload.single('tussle_image'), async (req, res) => {
  try {
    const { company_id, quantity, price_per_unit, due_date, notes } = req.body;

    // Validate required fields
    if (!company_id || !quantity || !price_per_unit || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Calculate total amount
    const total_amount = parseFloat(quantity) * parseFloat(price_per_unit);

    let imageUrl = null;

    // Upload image to Supabase Storage if provided
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `tussles/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tussle-images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image'
        });
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tussle-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    // Create order
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        company_id,
        quantity: parseInt(quantity),
        price_per_unit: parseFloat(price_per_unit),
        total_amount,
        due_date,
        tussle_image_url: imageUrl,
        notes,
        created_by: req.userId,
        status: 'awaiting_approval'
      }])
      .select(`
        *,
        companies:company_id (id, name, contact_person),
        creator:created_by (id, full_name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: data
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// POST /api/orders/:id/approve - Approve order (Owner only)
// ============================================
router.post('/:id/approve', requireAuth, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        approved_by: req.userId,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        companies:company_id (id, name),
        creator:created_by (id, full_name)
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Order approved successfully',
      data: data
    });
  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// GET /api/orders/dashboard/stats - Get dashboard statistics (Owner only)
// ============================================
router.get('/dashboard/stats', requireAuth, requireOwner, async (req, res) => {
  try {
    // Get revenue summary
    const { data: revenueSummary, error: revenueError } = await supabase
      .from('revenue_summary')
      .select('*');

    if (revenueError) throw revenueError;

    // Calculate total expected revenue
    const totalRevenue = revenueSummary.reduce((sum, item) => 
      sum + parseFloat(item.total_revenue || 0), 0
    );

    // Count pending approvals
    const pendingApprovals = revenueSummary.find(
      item => item.status === 'awaiting_approval'
    )?.order_count || 0;

    res.json({
      success: true,
      data: {
        total_expected_revenue: totalRevenue,
        pending_approvals: pendingApprovals,
        revenue_summary: revenueSummary
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// GET /api/companies - Get all companies
// ============================================
router.get('/companies', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
