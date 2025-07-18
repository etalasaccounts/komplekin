import Image from "next/image";

export function WaitingApproval() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="mb-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-white"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-900">KomplekIn</span>
        </div>
      </div>

      {/* Illustration */}
      <div className="mb-8 w-80 h-80 relative">
        <Image
          src="/image/illustration/waiting-approval.svg"
          alt="Person relaxing while waiting for approval"
          width={320}
          height={320}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Content */}
      <div className="text-center max-w-md mx-auto mb-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Menunggu Verifikasi Admin
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Permintaan pendaftaran Anda sedang ditinjau. Anda akan diberi akses
          setelah disetujui oleh admin.
        </p>
      </div>

      {/* Button */}
      <button className="w-full max-w-md bg-gray-900 text-white py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        Onboarding
      </button>
    </div>
  );
}
