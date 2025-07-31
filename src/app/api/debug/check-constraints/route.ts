import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking database constraints...");

    // Try to get the database schema information
    // Let's check what happens if we insert with a known profile_id instead
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .limit(3);

    const { data: userPermissions, error: permError } = await supabaseAdmin
      .from("user_permissions")
      .select("user_id, profile_id, role")
      .eq("role", "user")
      .limit(3);

    // Try to understand what existing invoices reference
    const { data: existingInvoices, error: invoicesError } = await supabaseAdmin
      .from("invoices")
      .select("user_id")
      .limit(5);

    // Let's try creating a test invoice with profile_id instead of user_id
    const testProfileId = profiles?.[0]?.id;
    let testResult = null;
    let testError = null;

    if (testProfileId) {
      const { data: testInvoice, error: testErr } = await supabaseAdmin
        .from("invoices")
        .insert({
          user_id: testProfileId, // Using profile.id instead of auth user.id
          bill_amount: 50000,
          due_date: "2025-01-15",
          payment_purpose: "Test Invoice",
          invoice_status: "Belum bayar",
          verification_status: "Belum dicek"
        })
        .select();

      testResult = testInvoice;
      testError = testErr;

      // Clean up test data
      if (testInvoice?.[0]?.id) {
        await supabaseAdmin
          .from("invoices")
          .delete()
          .eq("id", testInvoice[0].id);
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        profiles: {
          count: profiles?.length || 0,
          sample: profiles?.slice(0, 2) || []
        },
        userPermissions: {
          count: userPermissions?.length || 0,
          sample: userPermissions?.slice(0, 2) || []
        },
        existingInvoices: {
          count: existingInvoices?.length || 0,
          sampleUserIds: existingInvoices?.map(i => i.user_id) || []
        },
        testResult: {
          success: !testError,
          error: testError?.message || null,
          data: testResult || null,
          testedWith: `profile_id: ${testProfileId}`
        },
        analysis: {
          hypothesis: "invoices.user_id might reference profiles.id (integer) not auth.users.id (UUID)",
          recommendation: testError ? 
            "Check database schema or create invoices with correct reference" :
            "Use profile.id as user_id in invoices table"
        }
      }
    });

  } catch (error) {
    console.error("💥 Constraints check error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 