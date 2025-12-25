# 🚀 Quick Start Guide - TradeFlow ERP

## ⚡ Fast Setup (5 Minutes)

### 1️⃣ Database Setup (1 min)
```sql
-- Open phpMyAdmin and run:
SOURCE database/tradeflow_schema.sql;
```
**Done!** Database created with sample data.

---

### 2️⃣ Backend Setup (1 min)
1. Open `backend/config/db_connect.php`
2. Update lines 8-11:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'tradeflow_erp');
define('DB_USER', 'root');      // ← Your MySQL username
define('DB_PASS', '');          // ← Your MySQL password
```
3. **For Shared Hosting:** Upload `backend/` folder to public_html
4. **For Local:** Use XAMPP/WAMP, place in htdocs

---

### 3️⃣ Frontend Setup (3 min)
```powershell
# Navigate to frontend folder
cd "c:\Users\hp\Desktop\client tracker\frontend"

# Install dependencies (one-time)
npm install

# Start development server
npm run dev
```

**Open:** http://localhost:5173

---

### 4️⃣ Login
```
Username: admin
Password: admin123
```

**🎉 You're Done!** Start exploring TradeFlow.

---

## 🔥 What You Get Out of the Box

### ✅ Fully Functional Features
- 📊 **Animated Dashboard** with real-time stats
- 🛒 **Order Management** (Sales/Purchases/Samples)
- 👥 **Client Management** with ledger tracking
- 📦 **Product Inventory** with low-stock alerts
- 💰 **Payment Tracking** with auto-calculations
- 🔐 **Secure Authentication** system

### ✅ Database Tables Ready
- `users` - User accounts
- `clients` - Buyers & suppliers
- `products` - Inventory items
- `orders` - Sales & purchase orders
- `order_items` - Order line items
- `payments` - Payment records
- `expenses` - Business expenses

### ✅ API Endpoints Working
- `/api/login.php` - Authentication
- `/api/dashboard.php` - Dashboard data
- `/api/orders.php` - CRUD operations
- `/api/clients.php` - Client management
- `/api/products.php` - Inventory management
- `/api/payments.php` - Payment tracking

---

## 🎨 Design Highlights

### Cinematic Dark Theme
- Glassmorphism cards with backdrop blur
- Animated page transitions
- Staggered entry effects
- Hover glow effects
- Smooth color gradients

### Responsive Layout
- ✅ Desktop (1920px+) - Full sidebar
- ✅ Tablet (768px+) - Collapsible sidebar
- ✅ Mobile (320px+) - Drawer menu

---

## 📂 File Structure (Key Files)

```
📁 backend/
   ├── config/db_connect.php     ← Update credentials here
   └── api/*.php                 ← All REST endpoints

📁 frontend/
   ├── src/config/api.js         ← Update API URL here
   ├── src/pages/*.jsx           ← All page components
   └── package.json              ← Dependencies list

📁 database/
   └── tradeflow_schema.sql      ← Import this first
```

---

## 🔧 Common Tasks

### Change Default Password
```sql
UPDATE users 
SET password_hash = '$2y$10$NewHashHere' 
WHERE username = 'admin';
```
Or create new user via phpMyAdmin.

### Update API URL (for Deployment)
Edit `frontend/src/config/api.js`:
```javascript
export const API_BASE_URL = 'https://yourdomain.com/backend/api';
```

### Build for Production
```powershell
cd frontend
npm run build
# Upload 'dist/' folder to your hosting
```

---

## 🐞 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| White screen | Check browser console (F12) |
| API errors | Verify `API_BASE_URL` in `api.js` |
| Login fails | Check database credentials |
| CORS errors | Enable CORS in backend config |
| 404 on API | Check backend folder upload |

---

## 📊 Test Data Included

### Sample Users
- **admin** / admin123 (Full access)

### Sample Clients
- Rajesh Kumar (Buyer)
- Priya Sharma (Supplier)
- Amit Patel (Both)

### Sample Products
- Premium Rice (₹45/₹55)
- Basmati Rice (₹85/₹100)
- Toor Dal (₹120/₹140)
- Refined Oil (₹110/₹130)

---

## 🎯 Next Steps

1. ✅ **Login** and explore the dashboard
2. ✅ **Create a new order** to see calculations work
3. ✅ **Add a payment** to see balance update
4. ✅ **Check low stock alerts** in dashboard
5. ✅ **View client ledger** for transaction history

---

## 📞 Need Help?

1. Check **README.md** for detailed documentation
2. Review **SETUP_INSTRUCTIONS.md** for step-by-step guide
3. Check database triggers are working (run test order)
4. Verify PHP 8.0+ is enabled on your server

---

## ⚡ Production Checklist

Before going live:

- [ ] Change default admin password
- [ ] Update `db_connect.php` with production credentials
- [ ] Set `API_BASE_URL` to production domain
- [ ] Build frontend: `npm run build`
- [ ] Upload `dist/` to hosting
- [ ] Test all features on production
- [ ] Enable SSL certificate (HTTPS)
- [ ] Set up database backups
- [ ] Configure `.htaccess` for security

---

**🚀 Happy Trading with TradeFlow!**

*Built for speed, designed for elegance.*
