import { createClient } from '@supabase/supabase-js';

// Use environment variables for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xueopsqhkcjnefttiucs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZW9wc3Foa2NqbmVmdHRpdWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NzY3OTYsImV4cCI6MjA4MjI1Mjc5Nn0.kIfKeGsKV22ZKfMQ3n3YUfy0XTgTIgWwgIbbih-VUnk';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
