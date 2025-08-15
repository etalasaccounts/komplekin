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

    // Get user_id from user_permissions table to find cluster_id
    const { data: userPermissions, error: permissionsError } =
      await supabaseAdmin
        .from("user_permissions")
        .select("cluster_id")
        .eq("user_id", user.id)
        .single();

    if (permissionsError || !userPermissions) {
      console.error("Error fetching user permissions:", permissionsError);
      return NextResponse.json(
        { success: false, error: "User permissions not found" },
        { status: 404 }
      );
    }

    // Fetch cluster bank accounts filtered by user's cluster_id
    const { data: bankAccounts, error: bankAccountsError } = await supabaseAdmin
      .from("cluster_bank_account")
      .select("*")
      .eq("cluster_id", userPermissions.cluster_id)
      .order("bank_name", { ascending: true });

    if (bankAccountsError) {
      console.error("Error fetching bank accounts:", bankAccountsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch bank accounts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bankAccounts || [],
    });
  } catch (error) {
    console.error("Unexpected error in cluster bank accounts API:", error);
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
