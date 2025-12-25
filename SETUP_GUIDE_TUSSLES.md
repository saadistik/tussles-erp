# 🎯 TUSSLES Manufacturing System - Complete Refactor Guide

## 📋 Overview
This refactor transforms the system into a **Tussles-specific manufacturing order management system** with:
- **Employee Role**: Create companies, add orders with images, mark orders done
- **Owner Role**: View financial dashboard, approve orders
- **Order Workflow**: Pending → Awaiting Approval → Completed
- **Technology Stack**: Node.js/Express + PostgreSQL (Supabase) + React

---

## 🗄️ DATABASE SETUP (Supabase)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your:
   - Project URL
   - Anon/Public Key

### Step 2: Run SQL Schema
1. Open Supabase SQL Editor
2. Copy and paste contents of `database/tussles_supabase_schema.sql`
3. Execute the script

### Step 3: Setup Storage Bucket
1. Go to Storage in Supabase Dashboard
2. Create bucket named `tussle-images`
3. Set as **Public bucket**
4. Run the policies from `database/supabase_storage_policies.sql` in SQL Editor

### Step 4: Create Owner Users
After you and your partner sign up via Supabase Auth:
```sql
-- Get your Auth UIDs from the auth.users table
SELECT id, email FROM auth.users;

-- Insert owner records
INSERT INTO public.users (id, email, full_name, role) VALUES
('YOUR-AUTH-UUID-1', 'owner1@tussles.com', 'Owner One', 'owner'),
('YOUR-AUTH-UUID-2', 'owner2@tussles.com', 'Owner Two', 'owner');
```

---

## 🖥️ BACKEND SETUP (Node.js)

### Step 1: Install Dependencies
```bash
cd backend-nodejs
npm install
```

### Step 2: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
```

### Step 3: Start Server
```bash
npm run dev
```

Server will run on: http://localhost:3000

### API Endpoints

#### Authentication Middleware
All endpoints require `Authorization: Bearer <token>` header

#### Orders
- `POST /api/orders` - Create order (Employee) - with multipart/form-data
- `GET /api/orders` - Get all orders (filtered by role)
- `GET /api/orders?status=pending` - Filter by status
- `PATCH /api/orders/:id/mark-done` - Mark order done (Employee)
- `POST /api/orders/:id/approve` - Approve order (Owner only)
- `GET /api/orders/dashboard/stats` - Dashboard stats (Owner only)

---

## 🎨 FRONTEND SETUP (React)

### Step 1: Update API Configuration
Edit `frontend/src/config/api.js`:
```javascript
export const API_BASE_URL = 'http://localhost:3000/api';
```

### Step 2: Install Supabase Client
```bash
cd frontend
npm install @supabase/supabase-js
```

### Step 3: Create Supabase Config
Create `frontend/src/config/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Step 4: Update Authentication
Replace your current auth logic with Supabase Auth:

```javascript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get user role
const { data: userData } = await supabase
  .from('users')
  .select('*')
  .eq('id', data.user.id)
  .single();

// Store token
localStorage.setItem('auth_token', data.session.access_token);
```

### Step 5: Update App Routing
In your `App.jsx`, add conditional routing based on role:

```javascript
import EmployeeDashboard from './pages/EmployeeDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

function App() {
  const user = getCurrentUser(); // Implement this
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            user.role === 'owner' 
              ? <OwnerDashboard /> 
              : <EmployeeDashboard />
          } 
        />
      </Routes>
    </Router>
  );
}
```

---

## 📸 IMAGE UPLOAD FLOW

### Frontend (React)
```javascript
// In AddOrderForm.jsx
const formData = new FormData();
formData.append('company_id', companyId);
formData.append('quantity', quantity);
formData.append('price_per_unit', pricePerUnit);
formData.append('due_date', dueDate);
formData.append('tussle_image', imageFile); // File from input

// Send to backend
await axios.post('/api/orders', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  }
});
```

### Backend (Node.js)
```javascript
// In routes/orders.js
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('tussle_image'), async (req, res) => {
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('tussle-images')
    .upload(`orders/${fileName}`, req.file.buffer);
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('tussle-images')
    .getPublicUrl(filePath);
  
  // Save URL to database
  const tussle_image_url = urlData.publicUrl;
});
```

---

## 🔐 ROLE-BASED ACCESS CONTROL

### Middleware Usage

```javascript
const { requireAuth, requireOwner, requireEmployee } = require('./middleware/auth');

// Employee-only endpoint
router.post('/orders', requireAuth, requireEmployee, async (req, res) => {
  // Only employees can create orders
});

// Owner-only endpoint
router.post('/orders/:id/approve', requireAuth, requireOwner, async (req, res) => {
  // Only owners can approve
});
```

---

## 🎯 ORDER WORKFLOW

```
1. Employee creates order → Status: "pending"
2. Employee marks done → Status: "awaiting_approval"
3. Owner approves → Status: "completed"
```

---

## 📊 FINANCIAL DASHBOARD (Owners Only)

Owners see:
- **Total Expected Revenue** (all orders)
- **Pending Approvals Count**
- **Completed Orders Count**
- **Revenue Breakdown by Status**
- **Approval Queue** with images

---

## 🚀 DEPLOYMENT CHECKLIST

### Database
- [ ] Supabase project created
- [ ] Schema executed
- [ ] Storage bucket created with policies
- [ ] Owner users created
- [ ] RLS policies tested

### Backend
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Server starts without errors
- [ ] API endpoints tested

### Frontend
- [ ] Supabase client configured
- [ ] API base URL updated
- [ ] Authentication flow tested
- [ ] Role-based rendering works
- [ ] Image upload tested

---

## 🧪 TESTING

### Test Employee Flow
1. Sign up as employee
2. Create a company
3. Add order with image
4. Mark order as done
5. Verify status = "awaiting_approval"

### Test Owner Flow
1. Sign up/in as owner
2. View dashboard
3. See pending approvals
4. Approve an order
5. Verify status = "completed"

---

## 📦 PRODUCTION DEPLOYMENT

### Backend (Node.js)
- Deploy to: Heroku, Railway, Render, or DigitalOcean
- Set environment variables
- Ensure CORS allows your frontend domain

### Frontend (React)
- Build: `npm run build`
- Deploy to: Vercel, Netlify, or Cloudflare Pages
- Update API_BASE_URL to production backend

### Database
- Supabase handles scaling automatically
- Monitor usage in Supabase Dashboard

---

## 🆘 TROUBLESHOOTING

### Image Upload Fails
- Check bucket name is exactly `tussle-images`
- Verify storage policies are applied
- Check file size < 5MB
- Ensure file type is image/*

### Owner Can't Approve
- Verify user role is 'owner' in database
- Check Authorization header includes token
- Test middleware with console logs

### CORS Errors
- Update backend CORS config with your frontend URL
- Check credentials: true in both frontend and backend

---

## 📝 MIGRATION FROM PHP

Since you're moving from PHP/MySQL to Node.js/PostgreSQL:

1. **Export existing data** from MySQL
2. **Transform data** to match new schema (users, orders)
3. **Import to Supabase** via SQL or CSV
4. **Update user roles** manually
5. **Test thoroughly** before going live

---

## 🎉 NEXT STEPS

1. Run the SQL schema in Supabase
2. Set up backend Node.js server
3. Configure frontend with Supabase
4. Test employee + owner flows
5. Deploy to production

Need help with any specific step? Let me know!
