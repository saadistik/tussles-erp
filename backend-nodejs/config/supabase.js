// ============================================
// Supabase Client Configuration (SAFE MODE)
// File: backend-nodejs/config/supabase.js
// ============================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// SAFE MODE: Don't crash if keys are missing, just log and create dummy client
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('⚠️ WARNING: Missing Supabase environment variables!');
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING');
  console.error('⚠️ Backend requires SERVICE_ROLE_KEY, not ANON_KEY!');
}

// Create client with SERVICE ROLE key for backend operations
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

module.exports = supabase;
