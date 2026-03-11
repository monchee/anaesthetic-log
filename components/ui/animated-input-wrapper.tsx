import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedInputWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedInputWrapper: React.FC<AnimatedInputWrapperProps> = ({ children, className }) => {
  return (
    <motion.div
      whileFocus={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
