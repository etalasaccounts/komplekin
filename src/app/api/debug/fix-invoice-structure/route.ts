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

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Fixing invoice structure...");

    // Get a user_permission with role 'user'
    const { data: userPermission, error: permError } = await supabaseAdmin
      .from("user_permissions")
      .select("user_id, profile_id, role")
      .eq("role", "user")
      .not("user_id", "is", null)
      .limit(1)
      .single();

    if (permError || !userPermission) {
      throw new Error(
        "No user found with role 'user': " + (permError?.message || "No data")
      );
    }

    const authUserId = userPermission.user_id; // UUID from auth.users
    const profileId = userPermission.profile_id; // integer from profiles

    console.log("👤 Auth User ID (UUID):", authUserId);
    console.log("📋 Profile ID (integer):", profileId);

    // Delete all existing invoices first
    await supabaseAdmin
      .from("invoices")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    // Create test invoices using the AUTH USER ID (UUID)
    const testInvoices = [
      {
        user_id: authUserId, // Use the UUID from auth.users
        cluster_id: null,
        bill_amount: 150000,
        due_date: "2025-01-31",
        payment_purpose: "Iuran Bulanan Januari 2025",
        invoice_status: "Belum bayar",
        verification_status: "Belum dicek",
        amount_paid: null,
        payment_date: null,
        payment_method: null,
        receipt: null,
      },
      {
        user_id: authUserId,
        cluster_id: null,
        bill_amount: 150000,
        due_date: "2024-12-31",
        payment_purpose: "Iuran Bulanan Desember 2024",
        invoice_status: "Lunas",
        verification_status: "Terverifikasi",
        amount_paid: 150000,
        payment_date: "2024-12-28",
        payment_method: "Transfer Bank",
        receipt: null,
      },
    ];

    const { data: newInvoices, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .insert(testInvoices)
      .select();

    if (invoiceError) {
      console.error("❌ Invoice creation failed:", invoiceError);

      // Maybe the foreign key references profiles.id, let's try that
      console.log("🔄 Trying with profile_id instead...");

      const testInvoicesWithProfileId = testInvoices.map((invoice) => ({
        ...invoice,
        user_id: profileId, // Try using profile.id instead
      }));

      const { data: newInvoices2, error: invoiceError2 } = await supabaseAdmin
        .from("invoices")
        .insert(testInvoicesWithProfileId)
        .select();

      if (invoiceError2) {
        throw new Error(
          "Both attempts failed. Auth UUID error: " +
            invoiceError.message +
            " | Profile ID error: " +
            invoiceError2.message
        );
      }

      // Success with profile_id
      return NextResponse.json({
        success: true,
        message: "Success using profile_id!",
        solution:
          "invoices.user_id should use profiles.id (integer), not auth.users.id (UUID)",
        data: {
          method: "profile_id",
          profileId,
          authUserId,
          invoices: newInvoices2,
        },
        recommendation:
          "Update API to map auth.user.id -> user_permissions.profile_id -> invoices.user_id",
      });
    }

    // Success with auth UUID
    return NextResponse.json({
      success: true,
      message: "Success using auth user UUID!",
      data: {
        method: "auth_uuid",
        authUserId,
        invoices: newInvoices,
      },
    });
  } catch (error) {
    console.error("💥 Fix structure error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
