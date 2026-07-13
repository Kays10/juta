import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("=== ENV VARS CHECK ===");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
  console.log(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseAnonKey
      ? `Set (length: ${supabaseAnonKey.length}, starts with: ${supabaseAnonKey.slice(0, 20)})`
      : "NOT SET"
  );
  console.log(
    "SUPABASE_SERVICE_ROLE_KEY:",
    serviceRoleKey
      ? `Set (length: ${serviceRoleKey.length}, starts with: ${serviceRoleKey.slice(0, 20)})`
      : "NOT SET"
  );
  console.log("=== END ===");

  return NextResponse.json({
    url: supabaseUrl,
    anonKey: supabaseAnonKey ? `Set (starts with: ${supabaseAnonKey.slice(0, 20)})` : "Not Set",
    serviceKey: serviceRoleKey ? `Set (starts with: ${serviceRoleKey.slice(0, 20)})` : "Not Set",
  });
}
