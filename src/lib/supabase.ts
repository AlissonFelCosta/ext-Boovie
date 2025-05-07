
import { createClient } from '@supabase/supabase-js';

// Using the Supabase project information that's already configured
const supabaseUrl = "https://atxtojnnwookypaqapvx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0eHRvam5ud29va3lwYXFhcHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NDkxMDMsImV4cCI6MjA2MDIyNTEwM30.vkqWH5oGI1EDpKJlVBb_fPcetiLBnBge9UZuxhem2eY";

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

export default supabase;
