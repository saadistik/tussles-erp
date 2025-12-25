# TradeFlow - B2B Trading ERP System

## 🚀 Complete System Overview

A **cinematic, high-performance B2B Trading ERP** built for shared hosting environments.

### Technology Stack
- **Backend:** Core PHP 8.0+ with PDO (MySQL)
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React

---

## 📁 Project Structure

```
client tracker/
├── database/
│   └── tradeflow_schema.sql          # Complete database schema
├── backend/
│   ├── config/
│   │   ├── db_connect.php            # PDO database connection
│   │   └── cors.php                  # CORS configuration
│   ├── includes/
│   │   ├── auth.php                  # Authentication & authorization
│   │   └── helpers.php               # Utility functions
│   ├── api/
│   │   ├── login.php                 # User login
│   │   ├── logout.php                # User logout
│   │   ├── check_auth.php            # Auth status check
│   │   ├── dashboard.php             # Dashboard statistics
│   │   ├── orders.php                # Orders CRUD
│   │   ├── clients.php               # Clients CRUD
│   │   ├── products.php              # Products CRUD
│   │   └── payments.php              # Payments CRUD
│   └── .htaccess                     # Apache configuration
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       ├── Layout.jsx        # Main layout wrapper
    │   │       └── Sidebar.jsx       # Animated sidebar
    │   ├── pages/
    │   │   ├── Login.jsx             # Login page
    │   │   ├── Dashboard.jsx         # Main dashboard
    │   │   ├── Orders.jsx            # Orders management
    │   │   ├── Clients.jsx           # Clients management
    │   │   └── Products.jsx          # Products management
    │   ├── config/
    │   │   └── api.js                # Axios configuration
    │   ├── App.jsx                   # Main app component
    │   ├── main.jsx                  # Entry point
    │   └── index.css                 # Tailwind styles
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

---

## 🛠️ Installation Guide

### Step 1: Database Setup
1. Open phpMyAdmin or MySQL command line
2. Import the database:
   ```sql
   SOURCE database/tradeflow_schema.sql;
   ```
3. The schema will create:
   - Database: `tradeflow_erp`
   - 7 tables with relationships
   - 7 automated triggers
   - 3 reporting views
   - Sample admin user

### Step 2: Backend Configuration
1. Navigate to `backend/config/db_connect.php`
2. Update database credentials:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'tradeflow_erp');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   ```

3. Upload `backend/` folder to your shared hosting
4. Ensure PHP 8.0+ is enabled
5. Test API: `http://yourdomain.com/backend/api/check_auth.php`

### Step 3: Frontend Setup
```powershell
# Navigate to frontend folder
cd "c:\Users\hp\Desktop\client tracker\frontend"

# Install dependencies
npm install

# Update API URL in src/config/api.js
# Change API_BASE_URL to your backend URL

# Run development server
npm run dev

# Visit: http://localhost:5173
```

### Step 4: Production Build
```powershell
# Build for production
npm run build

# Upload the 'dist/' folder to your hosting
# Point your domain to this folder
```

---

## 🎨 Design System

### Color Palette
- **Background:** `bg-zinc-950` (#09090b)
- **Cards:** `bg-zinc-900/50` with backdrop blur
- **Primary:** `text-indigo-400` / `bg-indigo-600`
- **Success:** `text-emerald-400` (Sales)
- **Danger:** `text-rose-400` (Purchases)
- **Warning:** `text-amber-400` (Pending)

### Key Animations
- **Staggered Entry:** Dashboard cards slide up sequentially
- **Hover Effects:** Tables scale on hover with glow
- **Page Transitions:** Smooth fade-in animations
- **Button Glow:** Spotlight effect on hover

---

## 🔐 Default Credentials

```
Username: admin
Password: admin123
```

**⚠️ Change this immediately in production!**

---

## 📊 Features Implemented

### ✅ Authentication System
- Session-based login/logout
- Protected routes
- Role-based access control

### ✅ Dashboard
- Total Sales with growth percentage
- Net Profit calculation
- Total Receivables tracking
- Overdue payments alerts
- Low stock products
- 7-day sales trend chart
- Recent transactions feed

### ✅ Order Management
- Create/Read/Update/Delete orders
- Support for Sale/Purchase/Sample orders
- Multi-item orders with auto-calculation
- Order status tracking (Pending/Partial/Completed)
- Payment tracking per order

### ✅ Client Management
- Buyer/Supplier classification
- Client ledger with transaction history
- Current balance tracking
- Credit limit management

### ✅ Product Management
- Stock quantity tracking
- Low stock alerts
- Buy/Sell price management
- Profit margin calculation
- Multi-unit support (kg, liter, piece, etc.)

### ✅ Automated Calculations
- Order totals auto-update when items change
- Stock adjustments on order completion
- Pending payment calculation
- Client balance updates on payment

---

## 🔒 Security Features

1. **SQL Injection Protection:** PDO with prepared statements
2. **XSS Protection:** Input sanitization
3. **CSRF Protection:** Session-based authentication
4. **Password Hashing:** bcrypt (PHP password_hash)
5. **CORS Configuration:** Controlled access
6. **Session Security:** HTTP-only cookies
7. **Input Validation:** Server and client-side

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/login.php` | POST | User login |
| `/api/logout.php` | POST | User logout |
| `/api/check_auth.php` | GET | Check auth status |
| `/api/dashboard.php` | GET | Dashboard data |
| `/api/orders.php` | GET/POST/PUT/DELETE | Orders CRUD |
| `/api/clients.php` | GET/POST/PUT/DELETE | Clients CRUD |
| `/api/products.php` | GET/POST/PUT/DELETE | Products CRUD |
| `/api/payments.php` | GET/POST/DELETE | Payments CRUD |

---

## 🎯 Business Logic

### Pending Payments
```
Pending Amount = Order Grand Total - Sum of Payments
```

### Net Profit
```
Net Profit = Total Sales - Total Purchases - Total Expenses
```

### Client Balance
- **Positive Balance:** Client owes us (Receivable)
- **Negative Balance:** We owe client (Payable)
- Auto-updated on payments

### Sample Orders
- Tracked separately in `orders` table with `type='sample'`
- Can be excluded from profit reports
- No impact on client balance

---

## 🚀 Performance Optimizations

1. **Database Indexes:** 20+ strategic indexes
2. **Lazy Loading:** React components load on demand
3. **Efficient Queries:** JOINs instead of multiple queries
4. **CSS Animations:** GPU-accelerated transforms
5. **Code Splitting:** Vite automatic optimization

---

## 📱 Responsive Design

- **Desktop:** Full dashboard with sidebar
- **Tablet:** Collapsible sidebar
- **Mobile:** Hamburger menu navigation

---

## 🔧 Customization Guide

### Change Theme Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: '#6366f1', // Change to your color
}
```

### Add New API Endpoint
1. Create `backend/api/your_endpoint.php`
2. Include CORS, DB, Auth files
3. Handle GET/POST/PUT/DELETE methods
4. Return JSON response

### Add New Page
1. Create `frontend/src/pages/YourPage.jsx`
2. Add route in `App.jsx`
3. Add menu item in `Sidebar.jsx`

---

## 🐛 Troubleshooting

### Backend Issues
1. **Database connection fails:**
   - Check credentials in `db_connect.php`
   - Ensure MySQL is running
   - Verify database exists

2. **CORS errors:**
   - Update allowed origin in `cors.php`
   - Check `.htaccess` configuration

### Frontend Issues
1. **API calls fail:**
   - Update `API_BASE_URL` in `src/config/api.js`
   - Check backend is accessible
   - Verify CORS settings

2. **Login not working:**
   - Check session cookies are enabled
   - Verify `withCredentials: true` in axios config

---

## 📈 Future Enhancements

- [ ] PDF invoice generation
- [ ] Email notifications
- [ ] Multi-warehouse support
- [ ] Advanced reporting
- [ ] Mobile app (React Native)
- [ ] Barcode scanning
- [ ] SMS integration
- [ ] Backup automation

---

## 📄 License

Proprietary - All Rights Reserved © 2025 TradeFlow

---

## 💡 Support

For issues or questions:
- Check database logs
- Enable PHP error reporting
- Check browser console for errors
- Review API responses in Network tab

---

**Built with ❤️ for B2B Trading Excellence**
