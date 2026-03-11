import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui';

interface AnimatedBackButtonProps {
  onClick: () => void;
  label?: string;
}

export const AnimatedBackButton: React.FC<AnimatedBackButtonProps> = ({ onClick, label = "Back" }) => {
  return (
    <motion.div
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <Button onClick={onClick} variant="outline" size="sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> {label}
      </Button>
    </motion.div>
  );
};
