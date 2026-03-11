import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTableRowProps {
  children: React.ReactNode;
  index: number;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  ariaLabel?: string;
  title?: string;
  tabIndex?: number;
}

export const AnimatedTableRow: React.FC<AnimatedTableRowProps> = ({
  children,
  index,
  className,
  onClick,
  onKeyDown,
  ariaLabel,
  title,
  tabIndex = 0
}) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.03, 0.3),
        duration: 0.2
      }}
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      title={title}
      tabIndex={tabIndex}
    >
      {children}
    </motion.tr>
  );
};
