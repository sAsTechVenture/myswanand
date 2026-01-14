'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { colors } from '@/config/theme';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      richColors
      icons={{
        success: (
          <CircleCheckIcon className="size-4" style={{ color: colors.green }} />
        ),
        info: <InfoIcon className="size-4" style={{ color: colors.blue }} />,
        warning: (
          <TriangleAlertIcon className="size-4" style={{ color: '#f59e0b' }} />
        ),
        error: <OctagonXIcon className="size-4" style={{ color: '#ef4444' }} />,
        loading: (
          <Loader2Icon
            className="size-4 animate-spin"
            style={{ color: colors.primary }}
          />
        ),
      }}
      toastOptions={{
        style: {
          background: colors.white,
          color: colors.black,
          border: `1px solid ${colors.primaryLight}`,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(94, 46, 133, 0.15)',
        },
        classNames: {
          toast: 'font-sans',
          title: 'font-semibold',
          description: 'text-sm text-gray-600',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
