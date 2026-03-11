import React from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

interface AnimatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AnimatedDialog: React.FC<AnimatedDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          )}
          {children}
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
