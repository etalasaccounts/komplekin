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

    // Get profile data from user_permissions with profile details
    const { data: userPermissions, error: permissionsError } =
      await supabaseAdmin
        .from("user_permissions")
        .select(
          `
          profile_id,
          profiles (
            id,
            fullname,
            email,
            no_telp,
            address,
            house_type,
            ownership_status,
            photo,
            citizen_status,
            created_at
          )
        `
        )
        .eq("user_id", user.id)
        .single();

    if (permissionsError || !userPermissions) {
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 }
      );
    }

    const profile = Array.isArray(userPermissions.profiles)
      ? userPermissions.profiles[0]
      : userPermissions.profiles;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Unexpected error in profile GET API:", error);
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

export async function PUT(request: NextRequest) {
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
            // No need to set cookies in PUT request
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

    // Parse form data
    const formData = await request.formData();

    const fullname = formData.get("fullname") as string;
    const no_telp = formData.get("no_telp") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const house_type = formData.get("house_type") as string;
    const ownership_status = formData.get("ownership_status") as string;
    const photo = formData.get("photo") as File | null;

    // Validation
    if (!fullname || !no_telp || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama lengkap, nomor HP, dan email wajib diisi",
        },
        { status: 400 }
      );
    }

    // Get user profile ID
    const { data: userPermissions, error: permissionsError } =
      await supabaseAdmin
        .from("user_permissions")
        .select("profile_id")
        .eq("user_id", user.id)
        .single();

    if (permissionsError || !userPermissions) {
      return NextResponse.json(
        { success: false, error: "User permissions not found" },
        { status: 404 }
      );
    }

    let photoUrl = null;

    // Handle photo upload if provided
    if (photo && photo.size > 0) {
      try {
        const photoFileName = `${
          userPermissions.profile_id
        }_${Date.now()}.${photo.name.split(".").pop()}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from("user-photo")
          .upload(photoFileName, photo, {
            contentType: photo.type,
            upsert: true, // Allow overwriting existing photos
          });

        if (uploadError) {
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }

        // Get public URL for photo
        const { data: photoPublicUrl } = supabaseAdmin.storage
          .from("user-photo")
          .getPublicUrl(photoFileName);

        photoUrl = photoPublicUrl.publicUrl;
      } catch (uploadError) {
        console.error("Photo upload error:", uploadError);
        return NextResponse.json(
          { success: false, error: "Gagal mengupload foto profil" },
          { status: 500 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      fullname: string;
      no_telp: string;
      email: string;
      address: string;
      house_type: string;
      ownership_status: string;
      updated_at: string;
      photo?: string;
    } = {
      fullname,
      no_telp,
      email,
      address,
      house_type,
      ownership_status,
      updated_at: new Date().toISOString(),
    };

    // Only update photo if a new one was uploaded
    if (photoUrl) {
      updateData.photo = photoUrl;
    }

    // Update profile data
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", userPermissions.profile_id)
      .select()
      .single();

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Gagal mengupdate profil" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Unexpected error in profile PUT API:", error);
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
