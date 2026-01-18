import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the database
export interface Profile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    total_xp: number;
    current_level: number;
    today_study_xp: number;
    last_date: string;
    strava_refresh_token: string | null;
    strava_access_token: string | null;
    strava_expires_at: number | null;
    strava_last_sync: number;
    created_at: string;
    updated_at: string;
}
