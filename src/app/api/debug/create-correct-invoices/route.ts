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
    console.log(
      "📝 Creating correct invoices using user_permissions.user_id..."
    );

    // Get a user with role 'user' from user_permissions
    const { data: userPermission, error: permError } = await supabaseAdmin
      .from("user_permissions")
      .select("user_id, role, profile_id")
      .eq("role", "user")
      .not("user_id", "is", null)
      .limit(1)
      .single();

    if (permError || !userPermission) {
      throw new Error(
        "No user found with role 'user': " + (permError?.message || "No data")
      );
    }

    const userId = userPermission.user_id;
    console.log("👤 Using user_id from user_permissions:", userId);

    // Clear any existing invoices for this user to avoid duplicates
    const { error: deleteError } = await supabaseAdmin
      .from("invoices")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.warn(
        "⚠️ Could not delete existing invoices:",
        deleteError.message
      );
    }

    // Create test invoices with the correct user_id
    const testInvoices = [
      {
        user_id: userId,
        cluster_id: null,
        bill_amount: 150000,
        due_date: "2025-01-31",
        payment_purpose: "Iuran Bulanan Januari 2025",
        invoice_status: "Belum Bayar",
        verification_status: "Belum dicek",
        amount_paid: null,
        payment_date: null,
        payment_method: null,
        receipt: null,
      },
      {
        user_id: userId,
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
      {
        user_id: userId,
        cluster_id: null,
        bill_amount: 150000,
        due_date: "2024-11-30",
        payment_purpose: "Iuran Bulanan November 2024",
        invoice_status: "Lunas",
        verification_status: "Belum dicek",
        amount_paid: 150000,
        payment_date: "2024-11-25",
        payment_method: "Transfer Bank",
        receipt: null,
      },
    ];

    const { data: newInvoices, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .insert(testInvoices)
      .select();

    if (invoiceError) {
      throw new Error("Failed to create invoices: " + invoiceError.message);
    }

    console.log(
      "✅ Created",
      newInvoices?.length,
      "test invoices for user:",
      userId
    );

    // Get the user's email for login info
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
      userId
    );

    return NextResponse.json({
      success: true,
      message: `Successfully created ${newInvoices?.length} test invoices`,
      data: {
        userId,
        userEmail: authUser.user?.email,
        invoiceCount: newInvoices?.length,
        invoices: newInvoices,
      },
      loginInfo: {
        email: authUser.user?.email,
        note: "Login dengan email ini untuk melihat invoices",
      },
    });
  } catch (error) {
    console.error("💥 Create correct invoices error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
