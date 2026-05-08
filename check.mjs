import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase.from('hostels').select('id, name, university_slug, hostel_slug').limit(5);
  if (error) console.error("Error:", error);
  else console.log("Hostels:", data);
}

check();
