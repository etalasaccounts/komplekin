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
    // Parse form data
    const formData = await request.formData();

    const email = formData.get("email") as string;
    const fullname = formData.get("fullname") as string;
    const no_telp = formData.get("no_telp") as string;
    const address = formData.get("address") as string;
    const house_type = formData.get("house_type") as string;
    const house_number = formData.get("house_number") as string;
    const ownership_status = formData.get("ownership_status") as string;
    const emergency_telp = formData.get("emergency_telp") as string;
    const head_of_family = formData.get("head_of_family") as string;
    const work = formData.get("work") as string;
    const moving_date = formData.get("moving_date") as string;
    const citizen_status =
      (formData.get("citizen_status") as string) || "Warga baru";

    // Get file uploads
    const file_ktp = formData.get("file_ktp") as File;
    const file_kk = formData.get("file_kk") as File;

    // Validation
    if (
      !email ||
      !fullname ||
      !no_telp ||
      !address ||
      !house_type ||
      !house_number ||
      !ownership_status
    ) {
      return NextResponse.json(
        { success: false, error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // if (!file_ktp || !file_kk) {
    //   return NextResponse.json(
    //     { success: false, error: "Foto KTP dan Kartu Keluarga wajib diupload" },
    //     { status: 400 }
    //   );
    // }

    // Check if email already exists in profiles table
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar di sistem" },
        { status: 400 }
      );
    }

    // Generate temporary ID for file uploads (will be replaced with profile ID)
    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Upload files to storage
    let ktpUrl = "";
    let kkUrl = "";

    try {
      // Upload KTP file
      const ktpFileName = `${tempId}_ktp_${Date.now()}.${file_ktp.name
        .split(".")
        .pop()}`;
      const { error: ktpError } = await supabaseAdmin.storage
        .from("files")
        .upload(`ktp/${ktpFileName}`, file_ktp, {
          contentType: file_ktp.type,
          upsert: false,
        });

      if (ktpError) {
        throw new Error(`KTP upload failed: ${ktpError.message}`);
      }

      // Get public URL for KTP
      const { data: ktpPublicUrl } = supabaseAdmin.storage
        .from("files")
        .getPublicUrl(`ktp/${ktpFileName}`);
      ktpUrl = ktpPublicUrl.publicUrl;

      // Upload KK file
      const kkFileName = `${tempId}_kk_${Date.now()}.${file_kk.name
        .split(".")
        .pop()}`;
      const { error: kkError } = await supabaseAdmin.storage
        .from("files")
        .upload(`kartu_keluarga/${kkFileName}`, file_kk, {
          contentType: file_kk.type,
          upsert: false,
        });

      if (kkError) {
        throw new Error(`KK upload failed: ${kkError.message}`);
      }

      // Get public URL for KK
      const { data: kkPublicUrl } = supabaseAdmin.storage
        .from("files")
        .getPublicUrl(`kartu_keluarga/${kkFileName}`);
      kkUrl = kkPublicUrl.publicUrl;
    } catch (uploadError) {
      throw uploadError;
    }

    // Create profile record
    try {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          fullname: fullname,
          email: email,
          no_telp: no_telp,
          address: address,
          house_type: house_type,
          house_number: house_number,
          ownership_status: ownership_status,
          emergency_job: work, // Map work to emergency_job as per database schema
          emergency_telp: emergency_telp, // Add emergency contact phone
          head_of_family: head_of_family,
          moving_date: moving_date ? new Date(moving_date) : null,
          citizen_status: citizen_status,
          file_ktp: ktpUrl,
          file_kk: kkUrl,
        })
        .select("id")
        .single();

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // Create user_permissions with inactive status (no user_id and cluster assigned yet)
      const { error: permissionError } = await supabaseAdmin
        .from("user_permissions")
        .insert({
          id: Math.floor(Date.now() + Math.random() * 1000),
          user_id: null, // Will be filled when user is approved by admin
          profile_id: profileData.id,
          cluster_id: null, // Will be assigned by admin during approval
          role: "user",
          user_status: "Inactive",
        });

      if (permissionError) {
        throw new Error(
          `Permission creation failed: ${permissionError.message}`
        );
      }

      return NextResponse.json({
        success: true,
        message: "Pendaftaran berhasil. Menunggu persetujuan admin.",
        data: {
          profileId: profileData.id,
          email: email,
          fullname: fullname,
          status: "waiting_approval",
        },
      });
    } catch (dbError) {
      // If database operations fail, clean up uploaded files
      try {
        await supabaseAdmin.storage
          .from("files")
          .remove([
            `ktp/${ktpUrl.split("/").pop()}`,
            `kartu_keluarga/${kkUrl.split("/").pop()}`,
          ]);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Registration error:", error);
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
