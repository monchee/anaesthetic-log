import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@/components/ui';
import { AlertTriangle } from 'lucide-react';

interface NavigationGuardDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const NavigationGuardDialog: React.FC<NavigationGuardDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  onDelete,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent
        className="max-w-md rounded-none border border-border bg-card p-6 shadow-lg"
        aria-describedby="navigation-guard-description"
      >
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-status-warning/10 text-status-warning rounded-none shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              Leave testing session?
            </DialogTitle>
          </div>
          <DialogDescription
            id="navigation-guard-description"
            className="text-sm text-muted-foreground leading-relaxed pt-1"
          >
            Your testing draft will remain on this device for up to 6 hours.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
          {onDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              className="rounded-none min-h-[44px] sm:min-h-[40px] px-4 text-sm border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive mr-auto"
            >
              Delete draft
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-none min-h-[44px] sm:min-h-[40px] px-4 text-sm btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Stay in session
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="rounded-none min-h-[44px] sm:min-h-[40px] px-4 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Leave and keep draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
