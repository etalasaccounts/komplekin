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

    // Fetch detailed invoices using the user_id from user_permissions
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

    // Transform data to match the UI format
    const transformedInvoices = invoices.map((invoice) => {
      const dueDate = new Date(invoice.due_date);
      const now = new Date();
      const isOverdue = dueDate < now && invoice.invoice_status !== "Lunas";
      const daysDiff = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let status = "";
      if (invoice.invoice_status === "Lunas") {
        if (invoice.verification_status === "Terverifikasi") {
          status = "Lunas";
        } else if (invoice.verification_status === "Belum dicek") {
          status = "Menunggu Verifikasi";
        } else {
          status = "Ditolak";
        }
      } else if (isOverdue) {
        status = `Terlambat ${daysDiff} Hari`;
      } else {
        status = "Belum Bayar";
      }

      return {
        id: invoice.id,
        keterangan:
          invoice.payment_purpose ||
          `Iuran ${dueDate.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          })}`,
        jatuhTempo: dueDate.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        status,
        nominal: `Rp${invoice.bill_amount.toLocaleString("id-ID")}`,
        metode: invoice.payment_method || "Transfer",
        tanggalBayar: invoice.payment_date
          ? new Date(invoice.payment_date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
        buktiBayar: invoice.receipt || "",
        originalData: invoice,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedInvoices,
    });
  } catch (error) {
    console.error("Unexpected error in detailed invoices API:", error);
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
