import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';

interface AnimatedButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = "default",
  size = "default",
  children,
  className,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      className={className}
      {...props}
    >
      <Button variant={variant} size={size} className="pointer-events-none">
        {children}
      </Button>
    </motion.button>
  );
};
