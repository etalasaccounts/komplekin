import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert URL to File object
 * @param url - The URL to convert
 * @param filename - Optional filename for the file
 * @returns Promise<File>
 */
export async function urlToFile(url: string, filename?: string): Promise<File> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const name = filename || url.split('/').pop() || 'file';
    
    return new File([blob], name, { type: blob.type });
  } catch (error) {
    console.error('Error converting URL to File:', error);
    throw error;
  }
}

/**
 * Convert base64 string to File object
 * @param base64 - The base64 string
 * @param filename - Optional filename for the file
 * @param mimeType - MIME type of the file
 * @returns File
 */
export function base64ToFile(base64: string, filename?: string, mimeType: string = 'image/jpeg'): File {
  try {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:[^;]+;base64,/, '');
    
    // Convert base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    const name = filename || `file.${mimeType.split('/')[1]}`;
    
    return new File([blob], name, { type: mimeType });
  } catch (error) {
    console.error('Error converting base64 to File:', error);
    throw error;
  }
}

/**
 * Convert File to base64 string
 * @param file - The file to convert
 * @returns Promise<string>
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
} 

/**
 * Validate if a file is an image
 * @param file - The file to validate
 * @returns boolean
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Validate file size (default: 5MB)
 * @param file - The file to validate
 * @param maxSize - Maximum size in bytes (default: 5MB)
 * @returns boolean
 */
export function isValidFileSize(file: File, maxSize: number = 5 * 1024 * 1024): boolean {
  return file.size <= maxSize;
}

/**
 * Get file extension from filename
 * @param filename - The filename
 * @returns string
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Generate unique filename with timestamp
 * @param originalName - Original filename
 * @param prefix - Optional prefix
 * @returns string
 */
export function generateUniqueFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const extension = getFileExtension(originalName);
  const name = originalName.replace(`.${extension}`, '');
  return `${prefix ? `${prefix}_` : ''}${name}_${timestamp}.${extension}`;
} 

/**
 * Validate file for upload (frontend validation)
 * @param file - The file to validate
 * @returns { isValid: boolean, error?: string }
 */
export function validateFileForUpload(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'File harus berupa gambar (JPG, PNG, GIF, dll)'
    };
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Ukuran file terlalu besar. Maksimal 5MB'
    };
  }

  return { isValid: true };
} 