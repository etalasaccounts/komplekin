'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
  user?: {
    id: string;
    email: string;
  };
}

function AdminResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [purpose, setPurpose] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<{
    id: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    // Ambil token dan purpose dari URL
    const urlToken = searchParams.get('token');
    const urlPurpose = searchParams.get('purpose');
    const forceReset = searchParams.get('force_reset') === 'true';
    
    if (urlToken && urlPurpose) {
      setToken(urlToken);
      setPurpose(urlPurpose);
    }
    
    // Jika force_reset=true, user sudah login dan perlu ganti password
    if (forceReset) {
      setPurpose('force_reset');
      // Tidak perlu token karena user sudah login
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Jika force_reset, tidak perlu token
    if (purpose !== 'force_reset' && (!token || !purpose)) {
      setResetStatus('error');
      setMessage('Token reset password tidak valid');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetStatus('error');
      setMessage('Password dan konfirmasi password tidak cocok');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setResetStatus('error');
      setMessage('Password tidak memenuhi kriteria keamanan');
      return;
    }

    setLoading(true);
    setResetStatus('idle');

    try {
      const response = await fetch('/api/auth/verify-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          purpose,
          newPassword
        })
      });

      const data: ResetPasswordResponse = await response.json();

      if (data.success) {
        setResetStatus('success');
        setMessage(data.message);
        setUserData(data.user || null);
        
        // Redirect berdasarkan purpose
        setTimeout(() => {
          if (purpose === 'force_reset') {
            // Redirect ke dashboard admin setelah force reset
            router.push('/admin/dashboard');
          } else {
            // Redirect ke login admin setelah regular reset
            router.push('/admin/auth');
          }
        }, 3000);
      } else {
        setResetStatus('error');
        setMessage(data.error || 'Reset password gagal');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setResetStatus('error');
      setMessage('Terjadi kesalahan saat reset password');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (resetStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (resetStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = () => {
    switch (resetStatus) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const passwordValidation = validatePassword(newPassword);

  if (resetStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">KomplekIn</h1>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Reset Password Admin Berhasil
            </h2>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className={`bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-2 ${getStatusBgColor()}`}>
            <div className="text-center">
              {getStatusIcon()}
              
              <h3 className={`mt-4 text-lg font-medium ${getStatusColor()}`}>
                Password Berhasil Direset!
              </h3>
              
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>

              {userData && (
                <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Email:</strong> {userData.email}
                  </p>
                  <p className="text-sm text-green-800 mt-1">
                    <strong>Status:</strong> Password Updated
                  </p>
                </div>
              )}

              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Anda akan dialihkan ke halaman login admin dalam beberapa detik...
                </p>
                <button
                  onClick={() => router.push('/admin/auth')}
                  className="mt-3 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ke Login Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">KomplekIn</h1>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            Reset Password Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masukkan password baru untuk akun admin Anda
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {resetStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 rounded-md border border-red-200">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-800">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Password Baru
              </label>
              <div className="mt-1 relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Masukkan password baru"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Konfirmasi password baru"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Kriteria Password:</h4>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`h-3 w-3 mr-2 ${passwordValidation.minLength ? 'text-green-500' : 'text-gray-400'}`} />
                  Minimal 8 karakter
                </div>
                <div className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`h-3 w-3 mr-2 ${passwordValidation.hasUpperCase ? 'text-green-500' : 'text-gray-400'}`} />
                  Minimal 1 huruf besar
                </div>
                <div className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`h-3 w-3 mr-2 ${passwordValidation.hasLowerCase ? 'text-green-500' : 'text-gray-400'}`} />
                  Minimal 1 huruf kecil
                </div>
                <div className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`h-3 w-3 mr-2 ${passwordValidation.hasNumbers ? 'text-green-500' : 'text-gray-400'}`} />
                  Minimal 1 angka
                </div>
                <div className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                  <CheckCircle className={`h-3 w-3 mr-2 ${passwordValidation.hasSpecialChar ? 'text-green-500' : 'text-gray-400'}`} />
                  Minimal 1 karakter khusus
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !passwordValidation.isValid || newPassword !== confirmPassword}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Reset Password'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/admin/auth')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Kembali ke Login
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2025 KomplekIn. Sistem Manajemen Komplek Modern.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">KomplekIn</h1>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              Loading...
            </h2>
          </div>
        </div>
      </div>
    }>
      <AdminResetPasswordPageContent />
    </Suspense>
  );
} 