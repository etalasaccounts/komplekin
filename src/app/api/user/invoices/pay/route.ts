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

export async function POST(request: NextRequest) {
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
            // No need to set cookies in POST request
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

    // Parse form data for file upload
    const formData = await request.formData();
    const invoiceId = formData.get("invoiceId") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const paymentAmount = formData.get("paymentAmount") as string;
    const receiptFile = formData.get("receipt") as File;

    if (!invoiceId || !paymentMethod || !paymentAmount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
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

    // Verify invoice belongs to user using the correct foreign key
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("user_id", userPermissions.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    let receiptUrl = "";

    // Upload receipt file if provided
    if (receiptFile && receiptFile.size > 0) {
      const fileName = `payment_receipt_${invoiceId}_${Date.now()}.${receiptFile.name
        .split(".")
        .pop()}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("payment-receipts")
        .upload(fileName, receiptFile, {
          contentType: receiptFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading receipt:", uploadError);
        return NextResponse.json(
          { success: false, error: "Failed to upload receipt" },
          { status: 500 }
        );
      }

      // Get public URL for the uploaded file
      const { data: urlData } = supabaseAdmin.storage
        .from("payment-receipts")
        .getPublicUrl(fileName);

      receiptUrl = urlData.publicUrl;
    }

    // Update invoice with payment information
    const paymentAmountNum = parseFloat(paymentAmount);
    const newAmountPaid = (invoice.amount_paid || 0) + paymentAmountNum;
    const billAmount = invoice.bill_amount;

    // Determine invoice status based on payment amount vs bill amount
    let invoiceStatus = "Kurang Bayar"; // Default to partial payment
    if (newAmountPaid >= billAmount) {
      invoiceStatus = "Lunas";
    }

    console.log(
      `Payment calculation: Amount paid: ${newAmountPaid}, Bill amount: ${billAmount}, Status: ${invoiceStatus}`
    );

    const { error: updateError } = await supabaseAdmin
      .from("invoices")
      .update({
        amount_paid: newAmountPaid,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        receipt: receiptUrl,
        invoice_status: invoiceStatus,
        verification_status: "Belum dicek",
      })
      .eq("id", invoiceId);

    if (updateError) {
      console.error("Error updating invoice:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update payment" },
        { status: 500 }
      );
    }

    // Create ledger entry for the payment
    const { error: ledgerError } = await supabaseAdmin.from("ledgers").insert({
      user_id: user.id,
      cluster_id: invoice.cluster_id,
      invoice_id: invoiceId,
      coa_id: 1, // Assuming revenue account - you might want to make this dynamic
      ledger_type: "Credit",
      account_type: "Revenue",
      description: `Payment for ${invoice.payment_purpose}`,
      amount: paymentAmountNum,
      date: new Date().toISOString(),
      receipt: receiptUrl,
    });

    if (ledgerError) {
      console.error("Error creating ledger entry:", ledgerError);
      // Don't fail the payment if ledger creation fails
      console.warn("Payment successful but ledger entry failed");
    }

    return NextResponse.json({
      success: true,
      message: "Payment submitted successfully",
      data: {
        invoiceId,
        amountPaid: paymentAmountNum,
        totalPaid: newAmountPaid,
        status: invoiceStatus,
        verificationStatus: "Belum dicek",
      },
    });
  } catch (error) {
    console.error("Unexpected error in payment API:", error);
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
