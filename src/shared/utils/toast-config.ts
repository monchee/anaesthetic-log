import { toast } from 'sonner';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      classNames: {
        toast: 'border-l-4 border-l-green-500',
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 6000,
      classNames: {
        toast: 'border-l-4 border-l-red-500',
      },
    });
  },
  info: (message: string) => {
    toast(message, {
      duration: 5000,
      classNames: {
        toast: 'border-l-4 border-l-blue-500',
      },
    });
  },
  loading: (message: string) => {
    return toast.loading(message, {
      classNames: {
        toast: 'border-l-4 border-l-purple-500',
      },
    });
  },
  update: (onReload: () => void) => {
    toast.message('A new version is ready', {
      description: 'Reload to get the latest fixes.',
      duration: Infinity,
      closeButton: true,
      action: { label: 'Reload now', onClick: onReload },
      classNames: {
        toast: 'border-l-4 border-l-primary',
      },
    });
  },
};
