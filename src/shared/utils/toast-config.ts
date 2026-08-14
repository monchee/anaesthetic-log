import { toast } from 'sonner';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      classNames: {
        toast: 'border border-status-success/40 bg-card text-foreground rounded-none shadow-md',
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 6000,
      classNames: {
        toast: 'border border-status-danger/40 bg-card text-foreground rounded-none shadow-md',
      },
    });
  },
  info: (message: string) => {
    toast(message, {
      duration: 5000,
      classNames: {
        toast: 'border border-status-info/40 bg-card text-foreground rounded-none shadow-md',
      },
    });
  },
  loading: (message: string) => {
    return toast.loading(message, {
      classNames: {
        toast: 'border border-primary/40 bg-card text-foreground rounded-none shadow-md',
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
        toast: 'border border-primary bg-card text-foreground rounded-none shadow-md',
      },
    });
  },
};
