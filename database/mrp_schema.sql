-- ============================================
-- TradeFlow MRP System - Complete Database Schema
-- Manufacturing Resource Planning with Hierarchical Structure
-- PostgreSQL (Supabase Compatible)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MIGRATION: Add missing columns to existing tables
-- (Safe to run on existing databases)
-- ============================================

-- Add salary column to users if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='salary') THEN
        ALTER TABLE users ADD COLUMN salary DECIMAL(12,2) DEFAULT 0.00;
    END IF;
END $$;

-- Add total_spent column to companies if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='companies' AND column_name='total_spent') THEN
        ALTER TABLE companies ADD COLUMN total_spent DECIMAL(15,2) DEFAULT 0.00;
    END IF;
END $$;

-- ============================================
-- TABLE 1: Users (Owners & Employees)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'employee')),
    salary DECIMAL(12,2) DEFAULT 0.00,
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE 2: Companies (Root Clients)
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    gstin TEXT,
    total_spent DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);

-- ============================================
-- TABLE 3: Tussles (Projects/Orders)
-- ============================================
CREATE TABLE IF NOT EXISTS tussles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    reference_image_url TEXT,
    quantity INTEGER NOT NULL,
    sell_price DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'awaiting_approval' 
        CHECK (status IN ('awaiting_approval', 'approved', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    notes TEXT,
    
    -- Financial calculations (auto-computed via triggers or app logic)
    material_cost DECIMAL(12,2) DEFAULT 0.00,
    labor_cost DECIMAL(12,2) DEFAULT 0.00,
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (material_cost + labor_cost) STORED,
    gross_profit DECIMAL(12,2) GENERATED ALWAYS AS (sell_price - (material_cost + labor_cost)) STORED,
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tussles_company ON tussles(company_id);
CREATE INDEX IF NOT EXISTS idx_tussles_status ON tussles(status);
CREATE INDEX IF NOT EXISTS idx_tussles_created_by ON tussles(created_by);
CREATE INDEX IF NOT EXISTS idx_tussles_due_date ON tussles(due_date);

-- ============================================
-- TABLE 4: Receipts (Bulk Material Purchases)
-- ============================================
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_image_url TEXT,
    vendor_name TEXT,
    total_amount DECIMAL(12,2) NOT NULL,
    allocated_amount DECIMAL(12,2) DEFAULT 0.00,
    remaining_amount DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - allocated_amount) STORED,
    purchase_date DATE NOT NULL,
    category TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_receipts_purchase_date ON receipts(purchase_date);
CREATE INDEX IF NOT EXISTS idx_receipts_category ON receipts(category);
CREATE INDEX IF NOT EXISTS idx_receipts_created_by ON receipts(created_by);

-- ============================================
-- TABLE 5: Expense Allocations (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS expense_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    tussle_id UUID NOT NULL REFERENCES tussles(id) ON DELETE CASCADE,
    allocated_amount DECIMAL(12,2) NOT NULL CHECK (allocated_amount > 0),
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate allocations
    UNIQUE(receipt_id, tussle_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_allocations_receipt ON expense_allocations(receipt_id);
CREATE INDEX IF NOT EXISTS idx_allocations_tussle ON expense_allocations(tussle_id);

-- ============================================
-- TABLE 6: Workers (Outsourced Labor)
-- ============================================
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    specialty TEXT,
    default_rate DECIMAL(10,2),
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workers_name ON workers(name);
CREATE INDEX IF NOT EXISTS idx_workers_specialty ON workers(specialty);

-- ============================================
-- TABLE 7: Work Assignments (Worker-to-Tussle Link)
-- ============================================
CREATE TABLE IF NOT EXISTS work_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tussle_id UUID NOT NULL REFERENCES tussles(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
    quantity_assigned INTEGER NOT NULL CHECK (quantity_assigned > 0),
    rate_per_unit DECIMAL(10,2) NOT NULL CHECK (rate_per_unit > 0),
    total_pay DECIMAL(12,2) GENERATED ALWAYS AS (quantity_assigned * rate_per_unit) STORED,
    due_date DATE,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'paid')),
    completion_date DATE,
    payment_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assignments_tussle ON work_assignments(tussle_id);
CREATE INDEX IF NOT EXISTS idx_assignments_worker ON work_assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON work_assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON work_assignments(due_date);

-- ============================================
-- TRIGGERS: Auto-Update Calculated Fields
-- ============================================

-- Trigger 1: Update receipt allocated_amount when allocation changes
CREATE OR REPLACE FUNCTION update_receipt_allocated_amount()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE receipts
    SET allocated_amount = (
        SELECT COALESCE(SUM(allocated_amount), 0)
        FROM expense_allocations
        WHERE receipt_id = COALESCE(NEW.receipt_id, OLD.receipt_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.receipt_id, OLD.receipt_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_receipt_allocated
AFTER INSERT OR UPDATE OR DELETE ON expense_allocations
FOR EACH ROW EXECUTE FUNCTION update_receipt_allocated_amount();

-- Trigger 2: Update tussle material_cost when allocations change
CREATE OR REPLACE FUNCTION update_tussle_material_cost()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tussles
    SET material_cost = (
        SELECT COALESCE(SUM(allocated_amount), 0)
        FROM expense_allocations
        WHERE tussle_id = COALESCE(NEW.tussle_id, OLD.tussle_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.tussle_id, OLD.tussle_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tussle_material_cost
AFTER INSERT OR UPDATE OR DELETE ON expense_allocations
FOR EACH ROW EXECUTE FUNCTION update_tussle_material_cost();

-- Trigger 3: Update tussle labor_cost when work assignments change
CREATE OR REPLACE FUNCTION update_tussle_labor_cost()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tussles
    SET labor_cost = (
        SELECT COALESCE(SUM(total_pay), 0)
        FROM work_assignments
        WHERE tussle_id = COALESCE(NEW.tussle_id, OLD.tussle_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.tussle_id, OLD.tussle_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tussle_labor_cost
AFTER INSERT OR UPDATE OR DELETE ON work_assignments
FOR EACH ROW EXECUTE FUNCTION update_tussle_labor_cost();

-- Trigger 4: Update company total_spent when tussles complete
CREATE OR REPLACE FUNCTION update_company_total_spent()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE companies
        SET total_spent = total_spent + NEW.sell_price,
            updated_at = NOW()
        WHERE id = NEW.company_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_total_spent
AFTER UPDATE ON tussles
FOR EACH ROW EXECUTE FUNCTION update_company_total_spent();

-- Trigger 5: Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_companies BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_tussles BEFORE UPDATE ON tussles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_receipts BEFORE UPDATE ON receipts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_workers BEFORE UPDATE ON workers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_assignments BEFORE UPDATE ON work_assignments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tussles ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Policy: Owners can read all users
CREATE POLICY "Owners can read all users" ON users
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'
    )
);

-- Policy: Owners can update user salaries
CREATE POLICY "Owners can update users" ON users
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'
    )
);

-- Policy: All authenticated users can read companies
CREATE POLICY "Authenticated users can read companies" ON companies
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Employees and Owners can create/update companies
CREATE POLICY "Employees can manage companies" ON companies
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'employee')
    )
);

-- Policy: All authenticated users can read tussles
CREATE POLICY "Authenticated users can read tussles" ON tussles
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Employees and Owners can create/update tussles
CREATE POLICY "Employees can manage tussles" ON tussles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'employee')
    )
);

-- Policy: All authenticated users can read receipts
CREATE POLICY "Authenticated users can read receipts" ON receipts
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Employees can manage receipts
CREATE POLICY "Employees can manage receipts" ON receipts
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'employee')
    )
);

-- Policy: All authenticated users can read allocations
CREATE POLICY "Authenticated users can read allocations" ON expense_allocations
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Employees can manage allocations
CREATE POLICY "Employees can manage allocations" ON expense_allocations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'employee')
    )
);

-- Policy: All authenticated users can read workers
CREATE POLICY "Authenticated users can read workers" ON workers
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Employees can manage workers
CREATE POLICY "Employees can manage workers" ON workers
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'employee')
    )
);

-- Policy: All authenticated users can read work assignments
CREATE POLICY "Authenticated users can read assignments" ON work_assignments
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Employees can manage work assignments
CREATE POLICY "Employees can manage assignments" ON work_assignments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'employee')
    )
);

-- ============================================
-- USEFUL VIEWS FOR REPORTING
-- ============================================

-- View: Complete Tussle Financial Summary
CREATE OR REPLACE VIEW vw_tussle_financials AS
SELECT 
    t.id,
    t.name,
    t.company_id,
    c.name as company_name,
    t.quantity,
    t.sell_price,
    t.material_cost,
    t.labor_cost,
    t.total_cost,
    t.gross_profit,
    (t.gross_profit / NULLIF(t.sell_price, 0) * 100) as profit_margin_percentage,
    t.status,
    t.due_date,
    t.created_at,
    t.completed_at
FROM tussles t
JOIN companies c ON t.company_id = c.id;

-- View: Receipt Allocation Status
CREATE OR REPLACE VIEW vw_receipt_status AS
SELECT 
    r.id,
    r.vendor_name,
    r.total_amount,
    r.allocated_amount,
    r.remaining_amount,
    (r.allocated_amount / NULLIF(r.total_amount, 0) * 100) as allocation_percentage,
    r.purchase_date,
    r.category,
    COUNT(ea.id) as allocation_count
FROM receipts r
LEFT JOIN expense_allocations ea ON r.id = ea.receipt_id
GROUP BY r.id;

-- View: Worker Performance Summary
CREATE OR REPLACE VIEW vw_worker_performance AS
SELECT 
    w.id,
    w.name,
    w.specialty,
    COUNT(wa.id) as total_assignments,
    SUM(wa.quantity_assigned) as total_quantity,
    SUM(wa.total_pay) as total_earnings,
    AVG(wa.rate_per_unit) as avg_rate,
    COUNT(CASE WHEN wa.status = 'completed' THEN 1 END) as completed_assignments,
    COUNT(CASE WHEN wa.status = 'paid' THEN 1 END) as paid_assignments
FROM workers w
LEFT JOIN work_assignments wa ON w.id = wa.worker_id
GROUP BY w.id, w.name, w.specialty;

-- View: Monthly Revenue & Profit
CREATE OR REPLACE VIEW vw_monthly_financials AS
SELECT 
    DATE_TRUNC('month', completed_at) as month,
    COUNT(*) as total_tussles,
    SUM(sell_price) as total_revenue,
    SUM(material_cost) as total_material_cost,
    SUM(labor_cost) as total_labor_cost,
    SUM(total_cost) as total_cogs,
    SUM(gross_profit) as total_gross_profit,
    AVG(gross_profit / NULLIF(sell_price, 0) * 100) as avg_profit_margin
FROM tussles
WHERE status = 'completed' AND completed_at IS NOT NULL
GROUP BY DATE_TRUNC('month', completed_at)
ORDER BY month DESC;

-- ============================================
-- SAMPLE DATA (For Testing - Safe to re-run)
-- ============================================

-- Note: If you're running this on an existing database and get errors about
-- missing 'salary' column, you need to add it first with:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS salary DECIMAL(12,2) DEFAULT 0.00;

-- Insert sample owner (password: owner123)
INSERT INTO users (id, email, full_name, role, salary) VALUES
('11111111-1111-1111-1111-111111111111', 'owner@tradeflow.com', 'John Owner', 'owner', 50000.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample employee (password: employee123)
INSERT INTO users (id, email, full_name, role, salary) VALUES
('22222222-2222-2222-2222-222222222222', 'employee@tradeflow.com', 'Jane Employee', 'employee', 30000.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample companies
INSERT INTO companies (id, name, contact_person, phone) VALUES
('33333333-3333-3333-3333-333333333333', 'Sapphire Textiles', 'Rajesh Kumar', '+91-9876543210')
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, contact_person, phone) VALUES
('44444444-4444-4444-4444-444444444444', 'Emerald Garments', 'Priya Sharma', '+91-9876543211')
ON CONFLICT (id) DO NOTHING;

-- Insert sample workers (Note: workers table has no UNIQUE constraint, so we can't use ON CONFLICT)
-- Comment these out if you already have test data
-- INSERT INTO workers (name, phone, specialty, default_rate) VALUES
-- ('Ramesh - Stitching', '+91-9876543212', 'Stitching', 5.00),
-- ('Sunita - Embroidery', '+91-9876543213', 'Embroidery', 8.00),
-- ('Vikram - Packaging', '+91-9876543214', 'Packaging', 2.00);

-- ============================================
-- COLUMN COMMENTS (PostgreSQL Syntax)
-- ============================================

-- Users table comments
COMMENT ON COLUMN users.salary IS 'Monthly salary for OpEx calculations';

-- Companies table comments
COMMENT ON COLUMN companies.total_spent IS 'Lifetime spending by this client';

-- Tussles table comments
COMMENT ON COLUMN tussles.name IS 'Project name or item description';
COMMENT ON COLUMN tussles.reference_image_url IS 'Album cover style photo';
COMMENT ON COLUMN tussles.sell_price IS 'Total selling price';
COMMENT ON COLUMN tussles.material_cost IS 'Sum of allocated expenses';
COMMENT ON COLUMN tussles.labor_cost IS 'Sum of worker payments';

-- Receipts table comments
COMMENT ON COLUMN receipts.receipt_image_url IS 'Photo of the purchase receipt';
COMMENT ON COLUMN receipts.total_amount IS 'Total receipt value';
COMMENT ON COLUMN receipts.allocated_amount IS 'Sum of all allocations';
COMMENT ON COLUMN receipts.category IS 'e.g., Fabric, Thread, Buttons, Packaging';

-- Expense allocations comments
COMMENT ON COLUMN expense_allocations.notes IS 'Why this amount was allocated';

-- Workers table comments
COMMENT ON COLUMN workers.specialty IS 'e.g., Stitching, Embroidery, Packaging';
COMMENT ON COLUMN workers.default_rate IS 'Default rate per unit';

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function: Calculate Net Profit (for Owner Dashboard)
CREATE OR REPLACE FUNCTION calculate_net_profit(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
) RETURNS TABLE (
    total_revenue DECIMAL,
    total_cogs DECIMAL,
    total_opex DECIMAL,
    net_profit DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(t.sell_price), 0) as total_revenue,
        COALESCE(SUM(t.total_cost), 0) as total_cogs,
        (SELECT COALESCE(SUM(salary), 0) FROM users WHERE is_active = true) as total_opex,
        COALESCE(SUM(t.gross_profit), 0) - (SELECT COALESCE(SUM(salary), 0) FROM users WHERE is_active = true) as net_profit
    FROM tussles t
    WHERE t.status = 'completed'
        AND (start_date IS NULL OR t.completed_at >= start_date)
        AND (end_date IS NULL OR t.completed_at <= end_date);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- END OF MRP SCHEMA
-- ============================================

-- Grant privileges (adjust for Supabase)
-- Supabase handles this automatically with RLS policies

-- Database comment (Supabase databases are managed automatically)
-- You can add a description in the Supabase dashboard Settings > General
