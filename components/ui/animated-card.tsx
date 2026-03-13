import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './card';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, className }) => {
  return (
    <motion.div
      whileHover={{
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
        y: -2
      }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="h-full">
        {children}
      </Card>
    </motion.div>
  );
};
