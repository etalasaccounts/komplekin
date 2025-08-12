'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface VerificationResponse {
  success: boolean;
  message: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    verified: boolean;
  };
}

export default function AdminVerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token');
        const purpose = searchParams.get('purpose');

        if (!token || !purpose) {
          setVerificationStatus('error');
          setMessage('Parameter verifikasi tidak lengkap');
          return;
        }

        if (purpose !== 'email_verification') {
          setVerificationStatus('error');
          setMessage('Tujuan verifikasi tidak valid');
          return;
        }

        const response = await fetch(`/api/admin/verify?token=${token}&purpose=${purpose}`);
        const data: VerificationResponse = await response.json();

        if (data.success) {
          setVerificationStatus('success');
          setMessage(data.message);
          setUserData(data.user);
          
          // Redirect ke dashboard admin setelah 3 detik
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 3000);
        } else {
          setVerificationStatus('error');
          setMessage(data.error || 'Verifikasi gagal');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('Terjadi kesalahan saat verifikasi');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return <AlertTriangle className="h-16 w-16 text-yellow-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">KomplekIn</h1>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            Verifikasi Email Admin
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-2 ${getStatusBgColor()}`}>
          <div className="text-center">
            {getStatusIcon()}
            
            <h3 className={`mt-4 text-lg font-medium ${getStatusColor()}`}>
              {verificationStatus === 'loading' && 'Memverifikasi...'}
              {verificationStatus === 'success' && 'Verifikasi Berhasil!'}
              {verificationStatus === 'error' && 'Verifikasi Gagal'}
            </h3>
            
            <p className="mt-2 text-sm text-gray-600">
              {message}
            </p>

            {verificationStatus === 'success' && userData && (
              <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Email:</strong> {userData.email}
                </p>
                <p className="text-sm text-green-800 mt-1">
                  <strong>Status:</strong> Terverifikasi
                </p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Anda akan dialihkan ke dashboard admin dalam beberapa detik...
                </p>
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="mt-3 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ke Dashboard Admin
                </button>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-4">
                  Jika Anda mengalami masalah, silakan hubungi tim support atau coba lagi.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Coba Lagi
                </button>
              </div>
            )}
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