import { toast as sonnerToast } from "sonner"

// Re-export Sonner's toast functions with consistent API
export const toast = {
  success: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
    })
  },
  
  error: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 4000,
    })
  },
  
  warning: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
    })
  },
  
  info: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
    })
  },
  
  loading: (message: string, options?: { description?: string }) => {
    return sonnerToast.loading(message, {
      description: options?.description,
    })
  },
  
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, options)
  },
  
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId)
  },
  
  custom: (jsx: React.ReactNode, options?: { duration?: number }) => {
    return sonnerToast.custom(jsx as any, {
      duration: options?.duration || 4000,
    })
  }
}

// Legacy useToast hook for backward compatibility
export function useToast() {
  return {
    toast,
    dismiss: toast.dismiss,
    toasts: [], // Empty array for backward compatibility
  }
}
