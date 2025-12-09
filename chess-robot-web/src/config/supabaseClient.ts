import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lyvfqltjhsyjmjmlwweo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dmZxbHRqaHN5am1qbWx3d2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTE3NjEsImV4cCI6MjA3NzM2Nzc2MX0.yf3038nsKKJU0r1G1_fRgZ3gQRSW334pY5QDa1LnY68'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})
