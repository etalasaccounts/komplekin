export default function StatusPembayaranSkeleton() {
    return (
        <>
        <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="rounded-md border bg-card">
          <div className="border-b">
            <div className="grid grid-cols-10 gap-4 p-4">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Table Body Skeleton */}
          {[...Array(8)].map((_, index) => (
            <div key={index} className="border-b last:border-b-0">
              <div className="grid grid-cols-10 gap-4 p-4">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex space-x-1">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex space-x-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
        </>
    )
}