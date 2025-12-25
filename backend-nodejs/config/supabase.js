// ============================================
// Supabase Client Configuration (SAFE MODE)
// File: backend-nodejs/config/supabase.js
// ============================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// SAFE MODE: Don't crash if keys are missing, just log and create dummy client
if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ WARNING: Missing Supabase environment variables!');
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING');
}

// Create client with fallback values to prevent crashes
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

module.exports = supabase;
