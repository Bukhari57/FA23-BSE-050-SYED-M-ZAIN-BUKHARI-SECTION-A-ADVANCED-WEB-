const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // use service_role key for server-side operations

if (!supabaseUrl || !supabaseKey) {
  console.warn('SUPABASE_URL or SUPABASE_KEY not set in environment');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;
