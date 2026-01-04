# TradeFlow/Tussles ERP System - Complete Architecture Report

## 📋 Executive Summary

This is a **dual-backend B2B Trading and Manufacturing ERP system** designed for order management, client tracking, inventory control, and financial operations. The system features a modern React frontend with **two distinct backend implementations**: a PHP backend (TradeFlow) for traditional hosting and a Node.js backend (Tussles) using Supabase for cloud deployment.

---

## 🏗️ System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                        │
│  React 18 + Vite + TailwindCSS + Framer Motion              │
│  Port: 5173 (Development) / Vercel (Production)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ REST API (Axios)
                     │
        ┌────────────┴──────────────┐
        │                           │
┌───────▼────────┐          ┌───────▼────────┐
│  PHP BACKEND   │          │ NODE.JS BACKEND│
│  (TradeFlow)   │          │   (Tussles)    │
│  Port: Apache  │          │  Port: 3000    │
└───────┬────────┘          └───────┬────────┘
        │                           │
        │ PDO                       │ Supabase Client
        │                           │
┌───────▼────────┐          ┌───────▼────────┐
│ MySQL Database │          │ Supabase DB    │
│ (tradeflow_erp)│          │ (PostgreSQL)   │
└────────────────┘          └────────────────┘
```

---

## 💻 FRONTEND ARCHITECTURE

### Technology Stack
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.8
- **Styling:** TailwindCSS 3.3.6
- **Animations:** Framer Motion 10.16.16
- **Routing:** React Router DOM 6.20.0
- **HTTP Client:** Axios 1.6.2
- **Icons:** Lucide React 0.294.0
- **Charts:** Recharts 2.10.3
- **Date Handling:** date-fns 3.0.0

### Project Structure

```
frontend/
├── src/
│   ├── main.jsx                 # Entry point, renders App
│   ├── App.jsx                  # Main router with role-based routing
│   ├── index.css                # Tailwind imports + global styles
│   │
│   ├── components/
│   │   ├── AddOrderForm.jsx     # Order creation form
│   │   └── layout/
│   │       ├── Layout.jsx       # Main layout wrapper with sidebar
│   │       └── Sidebar.jsx      # Animated navigation sidebar
│   │
│   ├── pages/
│   │   ├── Login.jsx            # Authentication page
│   │   ├── Dashboard.jsx        # Main dashboard (generic)
│   │   ├── EmployeeDashboard.jsx # Employee role dashboard
│   │   ├── OwnerDashboard.jsx   # Owner role dashboard (full access)
│   │   ├── Orders.jsx           # Order management page
│   │   ├── Clients.jsx          # Client management page
│   │   └── Products.jsx         # Product/inventory management
│   │
│   ├── context/
│   │   └── AuthContext.jsx      # Global authentication state
│   │
│   └── config/
│       ├── api.js               # Axios instance configuration
│       └── supabase.js          # Supabase client initialization
│
├── index.html                   # HTML template
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # TailwindCSS configuration
├── postcss.config.js            # PostCSS configuration
├── package.json                 # Dependencies
└── vercel.json                  # Vercel deployment config
```

### Key Frontend Features

#### 1. **Authentication Flow**
```javascript
// AuthContext.jsx provides:
- Session management with Supabase Auth
- User data fetching from database
- Role-based access control
- Persistent login state

// Login Process:
1. User enters credentials
2. Supabase.auth.signInWithPassword()
3. Fetch user data (id, role, full_name)
4. Store in React Context
5. Redirect based on role
```

#### 2. **Role-Based Routing**
```javascript
// App.jsx routing logic:
- Public: /login
- Protected: /dashboard
  - Owner role → OwnerDashboard
  - Employee role → EmployeeDashboard
- Fallback: 404 page
```

#### 3. **UI/UX Design Patterns**
- **Dark Mode:** Zinc-950 background with blue accents
- **Animations:** Framer Motion for smooth transitions
- **Responsive:** Mobile-first design with TailwindCSS
- **Accessibility:** Proper ARIA labels, keyboard navigation

---

## 🔧 BACKEND ARCHITECTURE (PHP - TradeFlow)

### Technology Stack
- **Language:** PHP 8.0+
- **Database Driver:** PDO (PHP Data Objects)
- **Database:** MySQL 5.7+
- **Web Server:** Apache (with .htaccess)
- **Authentication:** Session-based

### Project Structure

```
backend/
├── config/
│   ├── db_connect.php           # PDO singleton connection
│   └── cors.php                 # CORS headers configuration
│
├── includes/
│   ├── auth.php                 # Authentication functions
│   └── helpers.php              # Utility functions (JSON responses)
│
├── api/
│   ├── login.php                # POST /api/login
│   ├── logout.php               # POST /api/logout
│   ├── check_auth.php           # GET /api/check_auth
│   ├── dashboard.php            # GET /api/dashboard
│   ├── orders.php               # CRUD /api/orders
│   ├── clients.php              # CRUD /api/clients
│   ├── products.php             # CRUD /api/products
│   └── payments.php             # CRUD /api/payments
│
├── middleware/
│   └── auth.js                  # (Node.js middleware, misplaced)
│
└── .htaccess                    # Apache rewrite rules
```

### Key Backend Features

#### 1. **Database Connection (Singleton Pattern)**
```php
// db_connect.php
class Database {
    private static $instance = null;
    private $conn;
    
    // Singleton ensures one PDO connection per request
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    // PDO with prepared statements (SQL injection protection)
    private function __construct() {
        $dsn = "mysql:host=localhost;dbname=tradeflow_erp;charset=utf8mb4";
        $this->conn = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    }
}
```

#### 2. **Authentication System**
```php
// Session-based authentication (shared hosting compatible)
- requireAuth() - Middleware function
- hasRole($role) - Role hierarchy checking
- loginUser($userData) - Creates session
- logoutUser() - Destroys session

// Role Hierarchy:
admin (3) > manager (2) > accountant (1)
```

#### 3. **API Endpoints**

##### Orders API (`orders.php`)
- **GET /api/orders** - List orders with filters
  - Query params: type, status, client_id, date_from, date_to, search, limit, offset
- **GET /api/orders?id=X** - Get single order with items and payments
- **POST /api/orders** - Create new order
- **PUT /api/orders?id=X** - Update order
- **DELETE /api/orders?id=X** - Delete order

##### Clients API (`clients.php`)
- **GET /api/clients** - List all clients
- **GET /api/clients?id=X** - Get single client
- **POST /api/clients** - Create client
- **PUT /api/clients?id=X** - Update client
- **DELETE /api/clients?id=X** - Delete client

##### Products API (`products.php`)
- Similar CRUD operations for inventory management

##### Dashboard API (`dashboard.php`)
- **GET /api/dashboard** - Returns statistics:
  - Total orders, revenue, pending payments
  - Recent orders
  - Low stock alerts
  - Monthly trends

---

## 🚀 BACKEND ARCHITECTURE (Node.js - Tussles)

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express 4.18.2
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (JWT)
- **File Upload:** Multer 1.4.5
- **Deployment:** Vercel

### Project Structure

```
backend-nodejs/
├── server.js                    # Main Express application
├── index.js                     # Vercel serverless entry point
├── package.json                 # Dependencies
├── vercel.json                  # Vercel configuration
│
├── config/
│   └── supabase.js              # Supabase client with service role
│
├── middleware/
│   └── auth.js                  # JWT token verification
│
└── routes/
    └── orders.js                # Order routes with file upload
```

### Key Backend Features

#### 1. **Supabase Integration**
```javascript
// Service Role Key (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Backend uses SERVICE_ROLE_KEY for admin operations
// Frontend uses ANON_KEY with RLS policies
```

#### 2. **Authentication Middleware**
```javascript
// JWT verification from Supabase Auth
async function verifyAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = user;
  next();
}
```

#### 3. **File Upload Handling**
```javascript
// Multer configuration for order image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('order-images')
  .upload(fileName, fileBuffer);
```

#### 4. **API Endpoints**

##### Orders API (`/api/orders`)
- **POST /api/orders** - Create order with image upload
- **GET /api/orders** - List orders (with filters)
- **GET /api/orders/:id** - Get single order
- **PUT /api/orders/:id** - Update order
- **DELETE /api/orders/:id** - Delete order
- **PUT /api/orders/:id/approve** - Approve order (owner only)
- **PUT /api/orders/:id/reject** - Reject order (owner only)
- **PUT /api/orders/:id/complete** - Mark as completed
- **GET /api/orders/dashboard/stats** - Dashboard statistics

##### Companies API (`/api/companies`)
- **GET /api/companies** - List all companies

---

## 🗄️ DATABASE ARCHITECTURE

### MySQL Schema (TradeFlow)

#### Database: `tradeflow_erp`
Character Set: `utf8mb4_unicode_ci`

#### Tables Overview

```
┌─────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────┐     ┌────────┐     ┌──────────┐           │
│  │ users  │     │clients │     │ products │           │
│  └───┬────┘     └───┬────┘     └────┬─────┘           │
│      │              │                │                  │
│      │              │                │                  │
│  ┌───▼──────────────▼────────────────▼─────┐           │
│  │            orders                        │           │
│  └───┬──────────────────────────────────────┘           │
│      │                                                   │
│  ┌───▼────────────┐     ┌─────────────┐                │
│  │  order_items   │     │  payments   │                │
│  └────────────────┘     └─────────────┘                │
│                                                          │
│  ┌────────────┐                                         │
│  │  expenses  │                                         │
│  └────────────┘                                         │
└─────────────────────────────────────────────────────────┘
```

#### 1. **users** (Authentication & Authorization)
```sql
- id (PRIMARY KEY)
- username (UNIQUE)
- password_hash (bcrypt)
- role ENUM('admin', 'manager', 'accountant')
- full_name
- email
- is_active (TINYINT)
- created_at
- last_login
```

#### 2. **clients** (Buyers & Suppliers)
```sql
- id (PRIMARY KEY)
- name
- company_name
- phone, email, address
- city, state, pincode, gstin
- type ENUM('buyer', 'supplier', 'both')
- current_balance (DECIMAL) - Running balance
- credit_limit
- is_active
- created_at, updated_at
```

#### 3. **products** (Inventory)
```sql
- id (PRIMARY KEY)
- name
- sku (UNIQUE)
- unit ENUM('kg', 'gram', 'liter', 'piece', etc.)
- buy_price, sell_price
- stock_qty (DECIMAL)
- min_stock_alert
- category
- description
- is_active
- created_at, updated_at
```

#### 4. **orders** (Sales & Purchase Orders)
```sql
- id (PRIMARY KEY)
- order_number (UNIQUE) - 'INV-2025-0001'
- client_id (FOREIGN KEY → clients)
- order_date
- type ENUM('sale', 'purchase', 'sample')
- status ENUM('pending', 'completed', 'cancelled', 'partial')
- total_amount (Sum of items)
- discount_amount
- tax_amount
- grand_total (total - discount + tax)
- paid_amount (Sum of payments)
- pending_amount (grand_total - paid_amount)
- notes
- created_by (FOREIGN KEY → users)
- created_at, updated_at
```

#### 5. **order_items** (Line Items)
```sql
- id (PRIMARY KEY)
- order_id (FOREIGN KEY → orders, CASCADE DELETE)
- product_id (FOREIGN KEY → products)
- product_name (Snapshot)
- quantity
- unit
- price_at_moment (Price when ordered)
- subtotal (quantity × price_at_moment)
- created_at
```

#### 6. **payments** (Transaction Records)
```sql
- id (PRIMARY KEY)
- payment_number - 'PAY-2025-0001'
- order_id (FOREIGN KEY → orders)
- client_id (FOREIGN KEY → clients)
- amount
- payment_date
- payment_method ENUM('cash', 'bank_transfer', 'cheque', 'upi', 'card', 'other')
- reference_number (Cheque/Transaction #)
- notes
- created_by (FOREIGN KEY → users)
- created_at
```

#### 7. **expenses** (Business Expenses)
```sql
- id (PRIMARY KEY)
- title
- amount
- category ENUM('rent', 'salary', 'utilities', 'transport', 'marketing', etc.)
- expense_date
- payment_method
- vendor_name
- receipt_number
- description
- created_by (FOREIGN KEY → users)
- created_at
```

### Database Triggers (Automated Business Logic)

#### 1. **Order Total Calculation**
```sql
-- Trigger: after_order_item_insert/update/delete
-- Automatically recalculates:
- total_amount (SUM of order_items.subtotal)
- grand_total (total - discount + tax)
- pending_amount (grand_total - paid_amount)
```

#### 2. **Inventory Management**
```sql
-- Trigger: after_sale_order_complete
-- Reduces stock when sale order marked as 'completed'
UPDATE products SET stock_qty = stock_qty - quantity

-- Trigger: after_purchase_order_complete
-- Increases stock when purchase order completed
UPDATE products SET stock_qty = stock_qty + quantity
```

#### 3. **Payment Processing**
```sql
-- Trigger: after_payment_insert
1. Updates order.paid_amount (SUM of payments)
2. Recalculates pending_amount
3. Auto-updates order status:
   - 'completed' if pending_amount = 0
   - 'partial' if paid_amount > 0
4. Updates client.current_balance

-- Trigger: after_payment_delete
- Reverses the above operations
```

### Database Views (Reporting)

#### 1. **vw_client_outstanding**
```sql
-- Shows client balances with outstanding amounts
SELECT 
    client_id, name, company_name,
    total_orders,
    pending_receivables (sales),
    pending_payables (purchases)
```

#### 2. **vw_low_stock_products**
```sql
-- Products below minimum stock alert level
WHERE stock_qty <= min_stock_alert
```

#### 3. **vw_monthly_sales**
```sql
-- Monthly aggregated sales statistics
GROUP BY month
```

### Supabase Schema (Tussles)

#### Tables (PostgreSQL)

##### 1. **users**
```sql
- id (UUID, PRIMARY KEY)
- email (from auth.users)
- full_name
- role ('owner' or 'employee')
- company_id (FOREIGN KEY)
- created_at
```

##### 2. **companies**
```sql
- id (UUID, PRIMARY KEY)
- name
- created_at
```

##### 3. **orders**
```sql
- id (UUID, PRIMARY KEY)
- company_id (FOREIGN KEY)
- employee_id (FOREIGN KEY → users)
- quantity
- price_per_unit
- total_price
- due_date
- status ('awaiting_approval', 'approved', 'rejected', 'completed')
- image_url (Supabase Storage path)
- notes
- approved_by (FOREIGN KEY → users)
- completed_at
- created_at, updated_at
```

### Row Level Security (RLS) Policies

```sql
-- Employees can:
- INSERT their own orders
- SELECT their own orders

-- Owners can:
- SELECT, UPDATE all orders in their company
- Approve/Reject orders
- Mark orders as completed
```

---

## 🔐 SECURITY ARCHITECTURE

### Authentication Methods

#### PHP Backend (Session-Based)
```php
1. User submits login credentials
2. Server verifies against database (password_verify)
3. Creates PHP session with user data
4. Session ID stored in cookie
5. Subsequent requests authenticated via session
```

#### Node.js Backend (JWT-Based)
```javascript
1. User submits login credentials
2. Supabase Auth validates credentials
3. Returns JWT access token + refresh token
4. Frontend stores tokens in localStorage
5. Requests include: Authorization: Bearer <token>
6. Backend verifies JWT signature with Supabase
```

### Security Features

#### 1. **SQL Injection Prevention**
- PHP: PDO prepared statements
- Node.js: Supabase parameterized queries

#### 2. **Password Security**
- PHP: bcrypt hashing (`password_hash()`)
- Supabase: Built-in bcrypt with salt

#### 3. **CORS Configuration**
```javascript
// Node.js backend
- Whitelist specific origins
- Credentials enabled
- Preflight request handling

// PHP backend
- Access-Control-Allow-Origin header
- Configurable in cors.php
```

#### 4. **Authorization**
- Role-based access control (RBAC)
- Frontend: Route guards
- Backend: Middleware functions
- Database: Foreign key constraints

#### 5. **Input Validation**
- Frontend: HTML5 validation + React state
- Backend: Type checking, sanitization
- Database: ENUM constraints, NOT NULL

---

## 📊 DATA FLOW EXAMPLES

### Example 1: Creating an Order (PHP Backend)

```
┌─────────────┐
│   FRONTEND  │
│  Orders.jsx │
└──────┬──────┘
       │ 1. User fills form
       │ 2. axios.post('/api/orders', data)
       ▼
┌─────────────────┐
│   orders.php    │
│  handlePost()   │
└──────┬──────────┘
       │ 3. requireAuth() - Check session
       │ 4. Validate input data
       │ 5. Begin transaction
       ▼
┌─────────────────┐
│     orders      │ 6. INSERT order record
│   (table)       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  order_items    │ 7. INSERT each line item
│   (table)       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│    TRIGGER      │ 8. after_order_item_insert fires
│                 │ 9. Auto-calculate totals
└──────┬──────────┘
       │ 10. Commit transaction
       ▼
┌─────────────────┐
│   RESPONSE      │ 11. Return order ID + data
│ { success: true }
└─────────────────┘
```

### Example 2: Approving an Order (Node.js Backend)

```
┌─────────────────┐
│ OwnerDashboard  │
│   (Frontend)    │
└──────┬──────────┘
       │ 1. Click "Approve" button
       │ 2. axios.put('/api/orders/:id/approve')
       │ 3. Headers: Authorization: Bearer <JWT>
       ▼
┌─────────────────┐
│  middleware/    │ 4. verifyAuth() - Verify JWT
│   auth.js       │ 5. Extract user from token
└──────┬──────────┘
       │ 6. Check if user.role === 'owner'
       ▼
┌─────────────────┐
│  routes/        │ 7. Update order status
│  orders.js      │ 8. Set approved_by = owner_id
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Supabase      │ 9. UPDATE orders table
│   (PostgreSQL)  │ 10. RLS policies checked
└──────┬──────────┘
       │ 11. Return updated order
       ▼
┌─────────────────┐
│   RESPONSE      │ 12. Frontend updates UI
│ { success: true }│
└─────────────────┘
```

---

## 🎨 UI/UX DESIGN SYSTEM

### Color Palette (Dark Theme)
```css
Background: zinc-950 (#09090b)
Surface: zinc-900 (#18181b)
Border: zinc-800 (#27272a)
Text Primary: white (#ffffff)
Text Secondary: zinc-400 (#a1a1aa)
Accent: blue-500 (#3b82f6)
Success: green-500 (#22c55e)
Warning: yellow-500 (#eab308)
Error: red-500 (#ef4444)
```

### Typography
- **Font Family:** System font stack (sans-serif)
- **Headings:** font-bold, text-2xl to text-4xl
- **Body:** text-sm to text-base
- **Monospace:** Code/numbers

### Component Library

#### Buttons
```jsx
Primary: bg-blue-600 hover:bg-blue-700
Secondary: bg-zinc-800 hover:bg-zinc-700
Danger: bg-red-600 hover:bg-red-700
```

#### Cards
```jsx
className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
```

#### Forms
```jsx
Input: bg-zinc-800 border-zinc-700 rounded-lg
Focus: ring-2 ring-blue-500
```

### Animations (Framer Motion)

#### Page Transitions
```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
transition={{ duration: 0.3 }}
```

#### Sidebar
```jsx
// Slide in from left
initial={{ x: -300 }}
animate={{ x: 0 }}
```

#### Modals
```jsx
// Backdrop fade + modal scale
Backdrop: opacity 0 → 1
Modal: scale 0.9 → 1
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Frontend Deployment (Vercel)

#### Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_API_URL": "@api-url",
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

#### Build Process
```bash
1. npm install
2. npm run build (Vite builds to /dist)
3. Vercel deploys static files
4. SPA routing handled by rewrite rule
```

### Backend Deployment Options

#### Option 1: PHP Backend (Shared Hosting)
```
1. Upload /backend folder via FTP
2. Create MySQL database
3. Import tradeflow_schema.sql
4. Update db_connect.php credentials
5. Ensure PHP 8.0+ enabled
6. Test: yourdomain.com/backend/api/check_auth.php
```

#### Option 2: Node.js Backend (Vercel Serverless)

##### Configuration (`backend-nodejs/vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key"
  }
}
```

##### Serverless Adaptation (`index.js`)
```javascript
// Wrap Express app for Vercel
const app = require('./server');

module.exports = (req, res) => {
  return app(req, res);
};
```

---

## 🔄 SYSTEM WORKFLOWS

### Workflow 1: Order Lifecycle (Manufacturing)

```
1. EMPLOYEE creates order
   ├─ Selects company
   ├─ Enters quantity, price, due date
   ├─ Uploads reference image
   └─ Status: 'awaiting_approval'

2. OWNER reviews pending orders
   ├─ Views order details + image
   ├─ Can APPROVE or REJECT
   └─ Status: 'approved' or 'rejected'

3. If APPROVED:
   ├─ Order moves to "In Progress"
   └─ Employee can mark as 'completed'

4. Order COMPLETED:
   ├─ Final status set
   ├─ completed_at timestamp recorded
   └─ Moves to completed orders list
```

### Workflow 2: Sales Order with Payment

```
1. Create SALE order
   ├─ Select buyer client
   ├─ Add products to cart
   ├─ System calculates totals
   └─ Status: 'pending'

2. Record PAYMENT
   ├─ Link to order
   ├─ Payment method + amount
   └─ Trigger updates:
       ├─ order.paid_amount
       ├─ order.pending_amount
       └─ order.status → 'partial' or 'completed'

3. Complete ORDER
   ├─ Status: 'completed'
   └─ Trigger updates inventory:
       └─ product.stock_qty -= quantity

4. View REPORTS
   ├─ Monthly sales summary
   ├─ Client outstanding balances
   └─ Low stock alerts
```

---

## 📈 PERFORMANCE OPTIMIZATIONS

### Database Optimizations

#### Indexes
```sql
-- Orders table
INDEX idx_orders_client_date (client_id, order_date)
INDEX idx_orders_type_status (type, status)

-- Payments table
INDEX idx_payments_client_date (client_id, payment_date)

-- Products table
INDEX idx_products_stock (stock_qty)
INDEX idx_products_sku (sku)
```

#### Query Optimization
- Use of JOINs instead of multiple queries
- Pagination with LIMIT/OFFSET
- COUNT(*) queries separated from data queries
- Filtered indexes on frequently queried columns

### Frontend Optimizations

#### Code Splitting
```javascript
// React.lazy for route-based splitting
const Orders = React.lazy(() => import('./pages/Orders'));
const Products = React.lazy(() => import('./pages/Products'));
```

#### Image Optimization
- Lazy loading with loading="lazy"
- Responsive images with srcset
- WebP format support
- Compression before upload

#### State Management
- React Context for global state (Auth)
- Local state for component data
- No unnecessary re-renders (React.memo)

### Backend Optimizations

#### PHP Backend
- PDO persistent connections
- Output buffering
- Opcode caching (OPcache)
- GZIP compression

#### Node.js Backend
- Serverless function warm-up
- Connection pooling (Supabase)
- Response caching headers
- Error logging without blocking

---

## 🧪 TESTING STRATEGY

### Manual Testing Checklist

#### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Session persistence
- [ ] Logout functionality
- [ ] Role-based redirect

#### Orders Management
- [ ] Create order with items
- [ ] View order details
- [ ] Update order
- [ ] Delete order
- [ ] Approve/Reject (owner)
- [ ] Mark as completed

#### Inventory
- [ ] Stock updates on order completion
- [ ] Low stock alerts
- [ ] Product CRUD operations

#### Payments
- [ ] Record payment
- [ ] Link to order
- [ ] Auto-update order status
- [ ] Payment history

#### Reports
- [ ] Dashboard statistics
- [ ] Monthly sales view
- [ ] Client balances
- [ ] Export functionality

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: CORS Errors
```
Problem: Frontend can't reach backend
Solution:
- PHP: Update cors.php with frontend URL
- Node.js: Add origin to allowed list in server.js
- Vercel: Set environment variables correctly
```

### Issue 2: Authentication Fails
```
Problem: Session/JWT not working
Solution:
- PHP: Check session_start() is called
- Node.js: Verify JWT token in headers
- Supabase: Ensure ANON_KEY vs SERVICE_ROLE_KEY usage
```

### Issue 3: Database Connection
```
Problem: Can't connect to database
Solution:
- PHP: Check db_connect.php credentials
- MySQL: Ensure user has privileges
- Supabase: Verify project URL and keys
```

### Issue 4: Triggers Not Firing
```
Problem: Order totals not calculating
Solution:
- Check trigger definitions in database
- Ensure DELIMITER properly reset
- Verify trigger permissions
```

---

## 📚 API REFERENCE

### PHP Backend Endpoints

#### Authentication
```
POST /api/login
Body: { username, password }
Response: { success, user, message }

POST /api/logout
Response: { success, message }

GET /api/check_auth
Response: { success, authenticated, user }
```

#### Orders
```
GET /api/orders
Query: type, status, client_id, date_from, date_to, search, limit, offset
Response: { success, data: [], total }

GET /api/orders?id=123
Response: { success, data: {order, items, payments} }

POST /api/orders
Body: { client_id, order_date, type, items: [], discount, tax, notes }
Response: { success, order_id, message }

PUT /api/orders?id=123
Body: { /* updated fields */ }
Response: { success, message }

DELETE /api/orders?id=123
Response: { success, message }
```

#### Clients
```
GET /api/clients
Response: { success, data: [] }

POST /api/clients
Body: { name, company_name, phone, email, type, ... }
Response: { success, client_id }
```

#### Products
```
GET /api/products
Response: { success, data: [] }

POST /api/products
Body: { name, sku, unit, buy_price, sell_price, stock_qty, ... }
Response: { success, product_id }
```

### Node.js Backend Endpoints

#### Orders
```
POST /api/orders
Headers: Authorization: Bearer <token>
Body (multipart/form-data): 
  - company_id
  - quantity
  - price_per_unit
  - due_date
  - notes
  - image (file)
Response: { success, data: order }

GET /api/orders?status=awaiting_approval
Headers: Authorization: Bearer <token>
Response: { success, data: [] }

PUT /api/orders/:id/approve
Headers: Authorization: Bearer <token>
Response: { success, data: order }

PUT /api/orders/:id/reject
Headers: Authorization: Bearer <token>
Response: { success, data: order }

PUT /api/orders/:id/complete
Headers: Authorization: Bearer <token>
Response: { success, data: order }

GET /api/orders/dashboard/stats
Response: { 
  success, 
  data: {
    pending_approval,
    approved,
    completed,
    total_revenue
  }
}
```

---

## 🔧 ENVIRONMENT VARIABLES

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend Node.js (.env)
```bash
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=https://your-frontend.vercel.app
```

### Backend PHP (db_connect.php)
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'tradeflow_erp');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

---

## 📦 DEPENDENCIES SUMMARY

### Frontend
- **Core:** React, React Router, React Context
- **UI:** TailwindCSS, Framer Motion, Lucide Icons
- **Data:** Axios, date-fns
- **Auth:** Supabase Client
- **Build:** Vite, PostCSS, Autoprefixer

### Backend (PHP)
- **Runtime:** PHP 8.0+
- **Database:** MySQL 5.7+, PDO
- **Web Server:** Apache with mod_rewrite

### Backend (Node.js)
- **Runtime:** Node.js 16+
- **Framework:** Express
- **Database:** Supabase (PostgreSQL)
- **Upload:** Multer
- **Utils:** CORS, dotenv, uuid

---

## 🎯 FUTURE ENHANCEMENTS

### Planned Features
1. **PDF Invoice Generation** - Generate printable invoices
2. **Email Notifications** - Order confirmations, payment reminders
3. **Advanced Reports** - Profit/loss, inventory valuation
4. **Multi-currency Support** - International trading
5. **Barcode Scanning** - Inventory management
6. **Mobile App** - React Native version
7. **Real-time Updates** - WebSocket notifications
8. **Backup/Restore** - Automated database backups
9. **Audit Logs** - Track all changes
10. **API Rate Limiting** - Prevent abuse

### Technical Debt
- Add unit tests (Jest, PHPUnit)
- Implement API documentation (Swagger)
- Add TypeScript for type safety
- Implement Redis caching
- Set up CI/CD pipeline
- Add error tracking (Sentry)

---

## 📞 SUPPORT & MAINTENANCE

### Logging
- **Frontend:** Console logs (development), Error boundaries
- **PHP Backend:** error_log() to server logs
- **Node.js Backend:** console.error() captured by Vercel

### Monitoring
- Vercel Analytics for frontend
- Database slow query logs
- Uptime monitoring (UptimeRobot, Pingdom)

### Backup Strategy
- Daily database backups
- Version control (Git) for code
- Supabase automatic backups
- Export functionality for data

---

## 📄 LICENSE & CREDITS

### Project Information
- **Name:** TradeFlow/Tussles ERP System
- **Version:** 1.0.0
- **Type:** B2B Trading & Manufacturing Management
- **License:** MIT (or proprietary, based on usage)

### Technology Credits
- React Team for React framework
- Vercel for hosting platform
- Supabase for BaaS
- TailwindCSS for utility-first CSS
- Framer Motion for animations
- Open source community

---

## 🎓 LEARNING RESOURCES

### For Understanding This System
1. **React Basics:** React documentation
2. **PHP PDO:** PHP.net PDO tutorial
3. **MySQL Triggers:** MySQL documentation
4. **Express.js:** Express.js guide
5. **Supabase:** Supabase documentation
6. **REST API Design:** RESTful API best practices

### Recommended Reading
- "Learning React" by Alex Banks & Eve Porcello
- "PHP Objects, Patterns, and Practice" by Matt Zandstra
- "Node.js Design Patterns" by Mario Casciaro
- "Database Design for Mere Mortals" by Michael J. Hernandez

---

## 📝 CONCLUSION

This system represents a **comprehensive ERP solution** with:
- ✅ Dual backend architecture (flexibility)
- ✅ Modern, responsive UI
- ✅ Robust database design with automated triggers
- ✅ Role-based access control
- ✅ Scalable deployment options
- ✅ Production-ready security

The architecture supports both **traditional shared hosting** (PHP/MySQL) and **modern serverless** (Node.js/Supabase) deployments, making it adaptable to various business requirements and budgets.

---

**Document Version:** 1.0  
**Last Updated:** January 4, 2026  
**Generated by:** GitHub Copilot
