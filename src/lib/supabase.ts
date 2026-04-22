import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'CRITICAL: Missing Supabase environment variables.\n' +
        'If deployed on Vercel, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in:\n' +
        'Vercel Dashboard → Project Settings → Environment Variables\n' +
        'Then redeploy the project.'
    );
}

// Create a real client if env vars exist, otherwise create a placeholder that won't crash the app on load
let supabase: SupabaseClient;
if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    // Fallback: create with placeholder to prevent immediate crash
    // All Supabase operations will fail gracefully at call time instead
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };
