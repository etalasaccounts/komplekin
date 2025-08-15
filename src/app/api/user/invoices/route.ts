import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
    // Create Supabase client for user authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No need to set cookies in GET request
          },
        },
      }
    );

    // Get current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get user_id from user_permissions table
    const { data: userPermissions, error: permissionsError } =
      await supabaseAdmin
        .from("user_permissions")
        .select("user_id,id")
        .eq("user_id", user.id)
        .single();

    if (permissionsError || !userPermissions) {
      return NextResponse.json(
        { success: false, error: "User permissions not found" },
        { status: 404 }
      );
    }

    // Fetch invoices using the user_id from user_permissions
    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("user_id", userPermissions.id)
      .order("due_date", { ascending: false });

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch invoices" },
        { status: 500 }
      );
    }

    // Calculate statistics
    // Unpaid invoices hanya termasuk yang belum ada pembayaran sama sekali
    const unpaidInvoices = invoices.filter(
      (invoice) => invoice.invoice_status === "Belum Bayar"
    );

    const paidInvoices = invoices.filter(
      (invoice) =>
        invoice.invoice_status === "Lunas" &&
        invoice.verification_status === "Terverifikasi"
    );

    // Invoices dengan pembayaran parsial
    const partiallyPaidInvoices = invoices.filter(
      (invoice) => invoice.invoice_status === "Kurang Bayar"
    );

    // Find overdue invoices (past due date and not paid)
    const now = new Date();
    const overdueInvoices = unpaidInvoices.filter(
      (invoice) => new Date(invoice.due_date) < now
    );

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        statistics: {
          total: invoices.length,
          unpaid: unpaidInvoices.length,
          paid: paidInvoices.length,
          partiallyPaid: partiallyPaidInvoices.length,
          overdue: overdueInvoices.length,
          totalUnpaidAmount: invoices
            .filter(
              (invoice) =>
                invoice.invoice_status === "Belum Bayar" ||
                invoice.invoice_status === "Kurang Bayar"
            )
            .reduce(
              (sum, invoice) =>
                sum + (invoice.bill_amount - (invoice.amount_paid || 0)),
              0
            ),
        },
      },
    });
  } catch (error) {
    console.error("Unexpected error in invoices API:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}
