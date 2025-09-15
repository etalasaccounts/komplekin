import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.TEMP_PASSWORD_ENCRYPTION_KEY || 'default-key-change-in-production-32b';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Converts base64 to base64url encoding
 */
function base64ToBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Converts base64url to base64 encoding
 */
function base64UrlToBase64(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  return base64;
}

/**
 * Encrypts a temporary password for secure transmission via URL
 * @param text - The temporary password to encrypt
 * @returns Encrypted string that can be safely used in URLs
 */
export function encryptTempPassword(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV and encrypted data, then base64 encode for URL safety
    const combined = iv.toString('hex') + ':' + encrypted;
    const base64 = Buffer.from(combined).toString('base64');
    return base64ToBase64Url(base64);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt temporary password');
  }
}

/**
 * Decrypts a temporary password from URL parameter
 * @param encryptedText - The encrypted string from URL
 * @returns Decrypted temporary password
 */
export function decryptTempPassword(encryptedText: string): string {
  try {
    // Convert base64url to base64 and decode
    const base64 = base64UrlToBase64(encryptedText);
    const combined = Buffer.from(base64, 'base64').toString();
    const [ivHex, encrypted] = combined.split(':');
    
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt temporary password');
  }
}

/**
 * Validates if an encrypted temp password string is properly formatted
 * @param encryptedText - The encrypted string to validate
 * @returns boolean indicating if the format is valid
 */
export function isValidEncryptedFormat(encryptedText: string): boolean {
  try {
    const combined = Buffer.from(encryptedText, 'base64url').toString();
    const parts = combined.split(':');
    return parts.length === 2 && parts[0].length === 32 && parts[1].length > 0;
  } catch {
    return false;
  }
}