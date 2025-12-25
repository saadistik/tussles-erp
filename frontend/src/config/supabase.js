import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xueopsqhkcjnefttiucs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZW9wc3Foa2NqbmVmdHRpdWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NzY3OTYsImV4cCI6MjA4MjI1Mjc5Nn0.kIfKeGsKV22ZKfMQ3n3YUfy0XTgTIgWwgIbbih-VUnk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
