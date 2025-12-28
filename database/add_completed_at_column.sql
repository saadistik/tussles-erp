-- ============================================
-- Add completed_at column to orders table
-- This is needed to track when orders were completed
-- for the 24-hour employee visibility rule
-- ============================================

-- Add completed_at column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_completed_at ON orders(completed_at);

-- Update existing completed orders to set completed_at = approved_at
UPDATE orders 
SET completed_at = approved_at 
WHERE status = 'completed' 
  AND completed_at IS NULL 
  AND approved_at IS NOT NULL;

-- Done!
SELECT 'completed_at column added successfully!' as message;
