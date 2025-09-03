import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucketName = formData.get('bucketName') as string || 'payment-receipts';

    if (!file) {
      return NextResponse.json(
        { error: 'File diperlukan' },
        { status: 400 }
      );
    }

    // Validate file type (images and PDFs)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File harus berupa gambar (JPEG, PNG, GIF) atau PDF' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max for receipts)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 10MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFilename = `receipt_${timestamp}_${Math.random().toString(36).substr(2, 9)}.${extension}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(`receipts/${uniqueFilename}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Gagal mengupload file ke storage' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`receipts/${uniqueFilename}`);

    return NextResponse.json({
      success: true,
      filename: uniqueFilename,
      url: urlData.publicUrl,
      bucketName: bucketName,
      originalFilename: file.name,
      fileSize: file.size,
      fileType: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload file' },
      { status: 500 }
    );
  }
}
