import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET() {
  try {
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .limit(1);

    if (profilesError) {
      console.error("Profiles error:", profilesError);
    }

    // Check user_permissions table
    const { data: permissions, error: permError } = await supabaseAdmin
      .from("user_permissions")
      .select("*")
      .limit(1);

    if (permError) {
      console.error("Permissions error:", permError);
    }

    // Check invoices table
    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .limit(1);

    if (invoicesError) {
      console.error("Invoices error:", invoicesError);
    }

    return NextResponse.json({
      success: true,
      data: {
        profiles: profiles?.length || 0,
        permissions: permissions?.length || 0,
        invoices: invoices?.length || 0,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { success: false, error: "Debug failed" },
      { status: 500 }
    );
  }
}
