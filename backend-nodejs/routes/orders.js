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

// Configure multer for image uploads with strict validation
const storage = multer.memoryStorage();

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow 1 file
  },
  fileFilter: (req, file, cb) => {
    // Check MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed'));
    }
    
    // Check file extension
    const ext = file.originalname.toLowerCase().split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Invalid file extension'));
    }
    
    cb(null, true);
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

    const { data, error } = await query;

    if (error) throw error;

    // For employees: Filter out completed orders older than 24 hours
    let filteredData = data;
    if (req.user.role === 'employee') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      filteredData = data.filter(order => {
        // If not completed, show it
        if (order.status !== 'completed') {
          return true;
        }
        
        // If completed, only show if completed within last 24 hours
        const completedDate = new Date(order.completed_at || order.updated_at);
        return completedDate > twentyFourHoursAgo;
      });
    }
    // Owners can see all orders (no filtering)

    res.json({
      success: true,
      data: filteredData
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
    console.log('=== Order Creation Request ===');
    console.log('Body:', req.body);
    console.log('File:', req.file ? req.file.originalname : 'No file');
    console.log('User:', req.userId);
    
    const { company_id, quantity, price_per_unit, due_date, notes } = req.body;

    // Validate required fields
    if (!company_id || !quantity || !price_per_unit) {
      console.error('Missing required fields:', { company_id, quantity, price_per_unit });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: company_id, quantity, and price_per_unit are required'
      });
    }

    // Validate and sanitize inputs
    const parsedQuantity = parseInt(quantity, 10);
    const parsedPrice = parseFloat(price_per_unit);

    // Validation checks
    if (isNaN(parsedQuantity) || parsedQuantity <= 0 || parsedQuantity > 100000000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity. Must be a positive number between 1 and 100,000,000'
      });
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0 || parsedPrice > 10000000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price. Must be a positive number between 1 and 10,000,000'
      });
    }

    // Validate date format
    const dueDateTime = due_date ? new Date(due_date) : new Date();
    if (isNaN(dueDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid due date format'
      });
    }

    // Sanitize notes (limit length and remove potentially dangerous content)
    const sanitizedNotes = notes ? String(notes).substring(0, 1000).trim() : null;

    // Calculate total amount
    const total_amount = parsedQuantity * parsedPrice;

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

    // Create order with validated data
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        company_id,
        quantity: parsedQuantity,
        price_per_unit: parsedPrice,
        total_amount,
        due_date: dueDateTime.toISOString(),
        tussle_image_url: imageUrl,
        notes: sanitizedNotes,
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

    console.log('✅ Order created successfully:', {
      id: data.id,
      company: data.companies?.name,
      quantity: data.quantity,
      total_amount: data.total_amount
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: data
    });
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
});

// ============================================
// POST /api/orders/:id/approve - Approve order (Owner only)
// ============================================
router.post('/:id/approve', requireAuth, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    // First check if order exists and is in correct status
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single();

    if (checkError || !existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (existingOrder.status !== 'awaiting_approval') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be approved. Current status: ${existingOrder.status}`
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        approved_by: req.userId,
        approved_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
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
// GET /api/orders/completed - Get completed orders (Owner only)
// ============================================
router.get('/completed', requireAuth, requireOwner, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        companies:company_id (id, name, contact_person, phone, email),
        creator:created_by (id, full_name, email),
        approver:approved_by (id, full_name)
      `)
      .eq('status', 'completed')
      .order('approved_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get completed orders error:', error);
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

// ============================================
// POST /api/companies - Create new company
// ============================================
router.post('/companies', requireAuth, async (req, res) => {
  try {
    console.log('=== Company Creation Request ===');
    console.log('Body:', req.body);
    console.log('User:', req.userId);
    
    const { name, contact_person, phone, email, address } = req.body;

    // Validate required field
    if (!name || !name.trim()) {
      console.error('Company name is missing or empty');
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    // Sanitize company name
    const sanitizedName = name.trim().substring(0, 200);
    console.log('Sanitized company name:', sanitizedName);

    // Check if company already exists (don't use .single() as it throws on no match)
    const { data: existingCompanies, error: searchError } = await supabase
      .from('companies')
      .select('id, name')
      .ilike('name', sanitizedName);

    if (searchError) {
      console.error('Error searching for existing company:', searchError);
      throw searchError;
    }

    if (existingCompanies && existingCompanies.length > 0) {
      // Return existing company instead of creating duplicate
      console.log('Company already exists:', existingCompanies[0]);
      return res.json({
        success: true,
        message: 'Company already exists',
        data: existingCompanies[0]
      });
    }

    // Create new company
    console.log('Creating new company with data:', {
      name: sanitizedName,
      contact_person: contact_person?.trim() || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      created_by: req.userId
    });
    
    const { data, error } = await supabase
      .from('companies')
      .insert([{
        name: sanitizedName,
        contact_person: contact_person?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        created_by: req.userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      throw error;
    }

    console.log('Company created successfully:', data);
    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: data
    });
  } catch (error) {
    console.error('Create company error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create company',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
});

module.exports = router;
