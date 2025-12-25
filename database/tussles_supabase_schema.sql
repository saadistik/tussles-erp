-- ============================================
-- TUSSLES Manufacturing System
-- PostgreSQL/Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: Users (Employees & Owners)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('employee', 'owner')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on role for faster queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- TABLE 2: Companies (Clients)
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_companies_created_by ON companies(created_by);

-- ============================================
-- TABLE 3: Orders (Tussle Orders)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_unit DECIMAL(10, 2) NOT NULL CHECK (price_per_unit >= 0),
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT DEFAULT 'PKR',
    due_date DATE NOT NULL,
    tussle_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'awaiting_approval', 'completed')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_orders_company ON orders(company_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_orders_due_date ON orders(due_date);

-- ============================================
-- TABLE 4: Order History (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS order_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'created', 'marked_done', 'approved', 'rejected'
    old_status TEXT,
    new_status TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_history_order ON order_history(order_id);

-- ============================================
-- FUNCTION: Auto-generate Order Number
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    month TEXT;
    count INTEGER;
    order_num TEXT;
BEGIN
    year := TO_CHAR(CURRENT_DATE, 'YYYY');
    month := TO_CHAR(CURRENT_DATE, 'MM');
    
    SELECT COUNT(*) + 1 INTO count
    FROM orders
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    order_num := 'TSL-' || year || '-' || month || '-' || LPAD(count::TEXT, 4, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Set Order Number on Insert
-- ============================================
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- ============================================
-- TRIGGER: Update timestamp on record change
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TRIGGER: Log Order Status Changes
-- ============================================
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_history (order_id, user_id, action, old_status, new_status)
        VALUES (NEW.id, NEW.approved_by, 'status_changed', OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_order_status
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy: Owners can view all users
CREATE POLICY "Owners can view all users"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'owner'
    )
);

-- Policy: Everyone can view all companies
CREATE POLICY "Authenticated users can view companies"
ON companies FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policy: Employees can create companies
CREATE POLICY "Employees can create companies"
ON companies FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Policy: Employees can update their companies
CREATE POLICY "Employees can update their companies"
ON companies FOR UPDATE
USING (auth.uid() = created_by);

-- Policy: Everyone can view all orders
CREATE POLICY "Authenticated users can view orders"
ON orders FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policy: Employees can create orders
CREATE POLICY "Employees can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Policy: Employees can update their pending orders
CREATE POLICY "Employees can update their pending orders"
ON orders FOR UPDATE
USING (auth.uid() = created_by AND status IN ('pending', 'awaiting_approval'));

-- Policy: Owners can update any order (for approval)
CREATE POLICY "Owners can update orders for approval"
ON orders FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'owner'
    )
);

-- Policy: Everyone can view order history
CREATE POLICY "Authenticated users can view order history"
ON order_history FOR SELECT
USING (auth.uid() IS NOT NULL);

-- ============================================
-- VIEWS: Financial Dashboard for Owners
-- ============================================

-- View: Total Revenue by Status
CREATE OR REPLACE VIEW revenue_summary AS
SELECT
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    currency
FROM orders
GROUP BY status, currency;

-- View: Orders Awaiting Approval
CREATE OR REPLACE VIEW pending_approvals AS
SELECT
    o.id,
    o.order_number,
    o.quantity,
    o.total_amount,
    o.currency,
    o.due_date,
    o.tussle_image_url,
    c.name as company_name,
    u.full_name as created_by_name,
    o.created_at
FROM orders o
LEFT JOIN companies c ON o.company_id = c.id
LEFT JOIN users u ON o.created_by = u.id
WHERE o.status = 'awaiting_approval'
ORDER BY o.created_at DESC;

-- View: Monthly Revenue Report
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
    DATE_TRUNC('month', created_at) as month,
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    currency
FROM orders
GROUP BY DATE_TRUNC('month', created_at), status, currency
ORDER BY month DESC;

-- ============================================
-- SEED DATA: Create Default Owner Users
-- ============================================
-- Note: Update with your actual Supabase Auth UIDs after user signup

-- INSERT INTO users (id, email, full_name, role) VALUES
-- ('OWNER-UUID-1', 'owner1@tussles.com', 'Owner One', 'owner'),
-- ('OWNER-UUID-2', 'owner2@tussles.com', 'Owner Two', 'owner');

-- ============================================
-- STORAGE BUCKET SETUP (Run in Supabase SQL Editor)
-- ============================================
-- This will be handled separately via Supabase Dashboard or SQL below
