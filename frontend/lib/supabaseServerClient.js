import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Server Client Supabase URL:", supabaseUrl);
console.log("Server Client Service Role Key:", serviceRoleKey ? "Key is set" : "Key is NOT set");

export function createServerClient() {
  return createClient(supabaseUrl, serviceRoleKey);
}

