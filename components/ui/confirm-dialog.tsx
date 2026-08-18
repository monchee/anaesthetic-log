import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button } from './index';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const variantStyles = {
    danger: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    warning: 'bg-status-warning hover:bg-status-warning/90 text-status-warning-foreground',
    info: 'bg-status-info hover:bg-status-info/90 text-status-info-foreground',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className={`w-full sm:w-auto ${variantStyles[variant]}`}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

// Hook for easier usage
export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<ConfirmDialogConfig | null>(null);

  const confirm = (params: ConfirmDialogConfig) => {
    setConfig(params);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    config?.onConfirm();
    setIsOpen(false);
  };

  const ConfirmDialogComponent = config ? (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={config.title}
      message={config.message}
      confirmLabel={config.confirmLabel}
      cancelLabel={config.cancelLabel}
      variant={config.variant}
      onConfirm={handleConfirm}
    />
  ) : null;

  return { confirm, ConfirmDialogComponent };
};
