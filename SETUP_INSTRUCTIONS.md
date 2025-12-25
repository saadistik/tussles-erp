# TradeFlow ERP - Frontend Setup Instructions

## STEP 3: React + Vite + Tailwind CSS Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

---

## 1. Create Vite React Project

Open terminal in the project root and run:

```powershell
cd "c:\Users\hp\Desktop\client tracker"
npm create vite@latest frontend -- --template react
cd frontend
```

---

## 2. Install Core Dependencies

```powershell
# Core UI Libraries
npm install framer-motion lucide-react recharts

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# HTTP Client
npm install axios

# Routing
npm install react-router-dom

# Date handling
npm install date-fns
```

---

## 3. Configure Tailwind CSS

Create/Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          950: '#09090b',
        },
      },
      backdropBlur: {
        md: '12px',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-in',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## 4. Update CSS Entry Point

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-zinc-800;
  }
  
  body {
    @apply bg-zinc-950 text-zinc-100 antialiased;
  }
  
  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    @apply w-2 h-2;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-zinc-900;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-zinc-700 rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-zinc-600;
  }
}

@layer components {
  /* Glassmorphism Card */
  .glass-card {
    @apply bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl;
  }
  
  /* Glow Button */
  .btn-glow {
    @apply relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 
           text-white font-medium px-6 py-2.5 rounded-lg
           transition-all duration-300 hover:scale-105
           hover:shadow-lg hover:shadow-indigo-500/50;
  }
  
  /* Input Field */
  .input-field {
    @apply w-full px-4 py-2.5 bg-zinc-900/70 border border-zinc-800
           rounded-lg text-zinc-100 placeholder-zinc-500
           focus:outline-none focus:ring-2 focus:ring-indigo-500/50
           focus:border-indigo-500 transition-all;
  }
  
  /* Table Hover Row */
  .table-row-hover {
    @apply hover:bg-zinc-800/50 hover:scale-[1.01] 
           transition-all duration-200 cursor-pointer;
  }
}
```

---

## 5. Configure API Base URL

Create `src/config/api.js`:

```javascript
import axios from 'axios';

// Update this URL to match your PHP backend location
export const API_BASE_URL = 'http://localhost/client%20tracker/backend/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 6. Update Vite Config for Proxy (Optional)

Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/client%20tracker/backend/api')
      }
    }
  }
})
```

---

## 7. Project Structure

Create this folder structure:

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Layout.jsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.jsx
│   │   │   ├── SalesChart.jsx
│   │   │   └── OverdueAlerts.jsx
│   │   ├── orders/
│   │   │   ├── OrderForm.jsx
│   │   │   └── OrderList.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       └── Modal.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Orders.jsx
│   │   ├── Clients.jsx
│   │   └── Products.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useApi.js
│   ├── config/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
```

---

## 8. Run Development Server

```powershell
npm run dev
```

Visit: `http://localhost:5173`

---

## 9. Build for Production

```powershell
npm run build
```

The production files will be in `dist/` folder. Upload this to your shared hosting.

---

## Backend Setup Notes

1. Upload the `backend/` folder to your shared hosting
2. Import `database/tradeflow_schema.sql` via phpMyAdmin
3. Update `backend/config/db_connect.php` with your database credentials
4. Ensure PHP 8.0+ is enabled on your hosting
5. Test API: `http://yourdomain.com/backend/api/check_auth.php`

Default Login:
- Username: `admin`
- Password: `admin123`

---

**Ready for Component Development!**
