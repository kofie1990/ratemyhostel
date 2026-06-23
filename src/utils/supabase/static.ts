import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a lightweight Supabase client that does NOT use cookies/headers.
 * Safe to use inside unstable_cache since it avoids dynamic data sources.
 * This client uses the anon key and is read-only for public data.
 */
export function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
