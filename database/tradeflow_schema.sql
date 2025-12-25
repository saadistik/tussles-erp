-- ============================================
-- TradeFlow B2B Trading ERP System
-- MySQL Database Schema
-- Version: 1.0
-- PHP 8.0+ | MySQL 5.7+
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS tradeflow_erp 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE tradeflow_erp;

-- ============================================
-- TABLE 1: Users (Authentication & Roles)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'accountant') NOT NULL DEFAULT 'accountant',
    full_name VARCHAR(100),
    email VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 2: Clients (Buyers & Suppliers)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    gstin VARCHAR(15),
    type ENUM('buyer', 'supplier', 'both') NOT NULL DEFAULT 'buyer',
    current_balance DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Positive=Client owes us, Negative=We owe client',
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_name (name),
    INDEX idx_company (company_name),
    INDEX idx_balance (current_balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 3: Products (Inventory Management)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    unit ENUM('kg', 'gram', 'liter', 'piece', 'gross', 'packet', 'box', 'dozen') NOT NULL DEFAULT 'piece',
    buy_price DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Average purchase price',
    sell_price DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Default selling price',
    stock_qty DECIMAL(12,3) DEFAULT 0.000 COMMENT 'Current stock quantity',
    min_stock_alert DECIMAL(12,3) DEFAULT 0.000,
    category VARCHAR(50),
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_sku (sku),
    INDEX idx_category (category),
    INDEX idx_stock (stock_qty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 4: Orders (Sales & Purchase Orders)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'INV-2025-0001 format',
    client_id INT UNSIGNED NOT NULL,
    order_date DATE NOT NULL,
    type ENUM('sale', 'purchase', 'sample') NOT NULL DEFAULT 'sale',
    status ENUM('pending', 'completed', 'cancelled', 'partial') NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    grand_total DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'total_amount - discount + tax',
    paid_amount DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Sum of payments received',
    pending_amount DECIMAL(15,2) DEFAULT 0.00 COMMENT 'grand_total - paid_amount',
    notes TEXT,
    created_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_order_number (order_number),
    INDEX idx_client (client_id),
    INDEX idx_date (order_date),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_pending (pending_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 5: Order Items (Line Items)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    product_name VARCHAR(150) NOT NULL COMMENT 'Snapshot at time of order',
    quantity DECIMAL(12,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    price_at_moment DECIMAL(12,2) NOT NULL COMMENT 'Price per unit at time of order',
    subtotal DECIMAL(15,2) NOT NULL COMMENT 'quantity * price_at_moment',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 6: Payments (Transaction Records)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE COMMENT 'PAY-2025-0001 format',
    order_id INT UNSIGNED,
    client_id INT UNSIGNED NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'cheque', 'upi', 'card', 'other') NOT NULL DEFAULT 'cash',
    reference_number VARCHAR(100) COMMENT 'Cheque/Transaction number',
    notes TEXT,
    created_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_client (client_id),
    INDEX idx_date (payment_date),
    INDEX idx_method (payment_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 7: Expenses (Business Expenses)
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category ENUM('rent', 'salary', 'utilities', 'transport', 'marketing', 'supplies', 'maintenance', 'other') NOT NULL DEFAULT 'other',
    expense_date DATE NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'cheque', 'upi', 'card') NOT NULL DEFAULT 'cash',
    vendor_name VARCHAR(100),
    receipt_number VARCHAR(50),
    description TEXT,
    created_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_category (category),
    INDEX idx_date (expense_date),
    INDEX idx_amount (amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS FOR AUTOMATED CALCULATIONS
-- ============================================

-- Trigger 1: Auto-update order totals when items are added
DELIMITER $$
CREATE TRIGGER after_order_item_insert 
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE orders 
    SET 
        total_amount = (SELECT SUM(subtotal) FROM order_items WHERE order_id = NEW.order_id),
        grand_total = total_amount - discount_amount + tax_amount,
        pending_amount = grand_total - paid_amount
    WHERE id = NEW.order_id;
END$$
DELIMITER ;

-- Trigger 2: Auto-update order totals when items are updated
DELIMITER $$
CREATE TRIGGER after_order_item_update 
AFTER UPDATE ON order_items
FOR EACH ROW
BEGIN
    UPDATE orders 
    SET 
        total_amount = (SELECT SUM(subtotal) FROM order_items WHERE order_id = NEW.order_id),
        grand_total = total_amount - discount_amount + tax_amount,
        pending_amount = grand_total - paid_amount
    WHERE id = NEW.order_id;
END$$
DELIMITER ;

-- Trigger 3: Auto-update order totals when items are deleted
DELIMITER $$
CREATE TRIGGER after_order_item_delete 
AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
    UPDATE orders 
    SET 
        total_amount = IFNULL((SELECT SUM(subtotal) FROM order_items WHERE order_id = OLD.order_id), 0),
        grand_total = total_amount - discount_amount + tax_amount,
        pending_amount = grand_total - paid_amount
    WHERE id = OLD.order_id;
END$$
DELIMITER ;

-- Trigger 4: Update stock on sale order completion
DELIMITER $$
CREATE TRIGGER after_sale_order_complete
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.type = 'sale' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE products p
        INNER JOIN order_items oi ON p.id = oi.product_id
        SET p.stock_qty = p.stock_qty - oi.quantity
        WHERE oi.order_id = NEW.id;
    END IF;
END$$
DELIMITER ;

-- Trigger 5: Update stock on purchase order completion
DELIMITER $$
CREATE TRIGGER after_purchase_order_complete
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.type = 'purchase' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE products p
        INNER JOIN order_items oi ON p.id = oi.product_id
        SET p.stock_qty = p.stock_qty + oi.quantity
        WHERE oi.order_id = NEW.id;
    END IF;
END$$
DELIMITER ;

-- Trigger 6: Auto-update paid_amount when payment is added
DELIMITER $$
CREATE TRIGGER after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.order_id IS NOT NULL THEN
        UPDATE orders 
        SET 
            paid_amount = (SELECT IFNULL(SUM(amount), 0) FROM payments WHERE order_id = NEW.order_id),
            pending_amount = grand_total - paid_amount,
            status = CASE 
                WHEN grand_total - paid_amount = 0 THEN 'completed'
                WHEN paid_amount > 0 THEN 'partial'
                ELSE status
            END
        WHERE id = NEW.order_id;
    END IF;
    
    -- Update client balance
    UPDATE clients
    SET current_balance = current_balance - NEW.amount
    WHERE id = NEW.client_id;
END$$
DELIMITER ;

-- Trigger 7: Auto-update paid_amount when payment is deleted
DELIMITER $$
CREATE TRIGGER after_payment_delete
AFTER DELETE ON payments
FOR EACH ROW
BEGIN
    IF OLD.order_id IS NOT NULL THEN
        UPDATE orders 
        SET 
            paid_amount = (SELECT IFNULL(SUM(amount), 0) FROM payments WHERE order_id = OLD.order_id),
            pending_amount = grand_total - paid_amount,
            status = CASE 
                WHEN paid_amount = 0 THEN 'pending'
                WHEN grand_total - paid_amount = 0 THEN 'completed'
                ELSE 'partial'
            END
        WHERE id = OLD.order_id;
    END IF;
    
    -- Update client balance
    UPDATE clients
    SET current_balance = current_balance + OLD.amount
    WHERE id = OLD.client_id;
END$$
DELIMITER ;

-- ============================================
-- SAMPLE DATA (For Testing)
-- ============================================

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, role, full_name, email) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Administrator', 'admin@tradeflow.com');

-- Insert sample clients
INSERT INTO clients (name, company_name, phone, type, current_balance) VALUES
('Rajesh Kumar', 'Kumar Trading Co.', '9876543210', 'buyer', 0.00),
('Priya Sharma', 'Sharma Suppliers', '9876543211', 'supplier', 0.00),
('Amit Patel', 'Patel Enterprises', '9876543212', 'both', 0.00);

-- Insert sample products
INSERT INTO products (name, sku, unit, buy_price, sell_price, stock_qty, category) VALUES
('Premium Rice', 'RICE-001', 'kg', 45.00, 55.00, 1000.000, 'Food Grains'),
('Basmati Rice', 'RICE-002', 'kg', 85.00, 100.00, 500.000, 'Food Grains'),
('Toor Dal', 'DAL-001', 'kg', 120.00, 140.00, 300.000, 'Pulses'),
('Refined Oil', 'OIL-001', 'liter', 110.00, 130.00, 200.000, 'Cooking Oil');

-- ============================================
-- USEFUL VIEWS FOR REPORTING
-- ============================================

-- View: Client Outstanding Balance
CREATE OR REPLACE VIEW vw_client_outstanding AS
SELECT 
    c.id,
    c.name,
    c.company_name,
    c.type,
    c.current_balance,
    COUNT(DISTINCT o.id) as total_orders,
    IFNULL(SUM(CASE WHEN o.type = 'sale' THEN o.pending_amount ELSE 0 END), 0) as pending_receivables,
    IFNULL(SUM(CASE WHEN o.type = 'purchase' THEN o.pending_amount ELSE 0 END), 0) as pending_payables
FROM clients c
LEFT JOIN orders o ON c.id = o.client_id AND o.status != 'cancelled'
GROUP BY c.id, c.name, c.company_name, c.type, c.current_balance;

-- View: Low Stock Alert
CREATE OR REPLACE VIEW vw_low_stock_products AS
SELECT 
    id,
    name,
    sku,
    unit,
    stock_qty,
    min_stock_alert,
    sell_price,
    category
FROM products
WHERE stock_qty <= min_stock_alert AND is_active = 1
ORDER BY stock_qty ASC;

-- View: Monthly Sales Summary
CREATE OR REPLACE VIEW vw_monthly_sales AS
SELECT 
    DATE_FORMAT(order_date, '%Y-%m') as month,
    COUNT(*) as total_orders,
    SUM(grand_total) as total_sales,
    SUM(paid_amount) as collected_amount,
    SUM(pending_amount) as pending_amount
FROM orders
WHERE type = 'sale' AND status != 'cancelled'
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY month DESC;

-- ============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================

-- Composite indexes for common queries
CREATE INDEX idx_orders_client_date ON orders(client_id, order_date);
CREATE INDEX idx_orders_type_status ON orders(type, status);
CREATE INDEX idx_payments_client_date ON payments(client_id, payment_date);

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Grant privileges (adjust as needed for your hosting)
-- GRANT ALL PRIVILEGES ON tradeflow_erp.* TO 'your_username'@'localhost';
-- FLUSH PRIVILEGES;
