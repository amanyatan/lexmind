import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://huougoerztjniklldwib.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1b3Vnb2VyenRqbmlrbGxkd2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODk5MTAsImV4cCI6MjA4MTk2NTkxMH0.f2j7MyoODAaBwu_XqivsSlw-je8dKuyzFGvv1EdsDzM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
