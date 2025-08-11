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
    const documentType = formData.get('documentType') as string; // 'ktp' atau 'kartu_keluarga'
    const originalFilename = formData.get('originalFilename') as string;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'File dan tipe dokumen diperlukan' },
        { status: 400 }
      );
    }

    // Validate document type
    if (!['ktp', 'kartu_keluarga'].includes(documentType)) {
      return NextResponse.json(
        { error: 'Tipe dokumen tidak valid' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFilename = `temp_${timestamp}_${Math.random().toString(36).substr(2, 9)}_${documentType}_${timestamp}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('files')
      .upload(`${documentType}/${uniqueFilename}`, file, {
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
      .from('files')
      .getPublicUrl(`${documentType}/${uniqueFilename}`);

    return NextResponse.json({
      success: true,
      filename: uniqueFilename,
      url: urlData.publicUrl,
      documentType: documentType,
      originalFilename: originalFilename
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload file' },
      { status: 500 }
    );
  }
} 