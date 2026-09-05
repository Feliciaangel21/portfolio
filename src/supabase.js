import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

// Only the admin screens need the full SDK (auth and storage). The public site
// reads through lib/portfolioApi.js, which is a thin fetch wrapper.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
