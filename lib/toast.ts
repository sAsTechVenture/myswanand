import { toast as sonnerToast } from 'sonner';
import { colors } from '@/config/theme';

type ToastOptions = {
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

/**
 * Centralized toast utility with app theme styling
 */
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      ...options,
      style: {
        background: colors.white,
        color: colors.black,
        border: `1px solid ${colors.primaryLight}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(94, 46, 133, 0.15)',
      },
      classNames: {
        toast: 'toast-success',
        title: 'font-semibold',
        description: 'text-sm text-gray-600',
      },
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      ...options,
      style: {
        background: colors.white,
        color: colors.black,
        border: `1px solid #ef4444`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
      },
      classNames: {
        toast: 'toast-error',
        title: 'font-semibold',
        description: 'text-sm text-gray-600',
      },
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      ...options,
      style: {
        background: colors.white,
        color: colors.black,
        border: `1px solid ${colors.blue}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(21, 93, 252, 0.15)',
      },
      classNames: {
        toast: 'toast-info',
        title: 'font-semibold',
        description: 'text-sm text-gray-600',
      },
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      ...options,
      style: {
        background: colors.white,
        color: colors.black,
        border: `1px solid #f59e0b`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
      },
      classNames: {
        toast: 'toast-warning',
        title: 'font-semibold',
        description: 'text-sm text-gray-600',
      },
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      ...options,
      style: {
        background: colors.white,
        color: colors.black,
        border: `1px solid ${colors.primaryLight}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(94, 46, 133, 0.15)',
      },
      classNames: {
        toast: 'toast-loading',
        title: 'font-semibold',
        description: 'text-sm text-gray-600',
      },
    });
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
      style: {
        background: colors.white,
        color: colors.black,
        border: `1px solid ${colors.primaryLight}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(94, 46, 133, 0.15)',
      },
      classNames: {
        toast: 'toast-promise',
        title: 'font-semibold',
        description: 'text-sm text-gray-600',
      },
    });
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};
