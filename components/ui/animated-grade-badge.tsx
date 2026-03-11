import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from './custom-badge';

interface AnimatedGradeBadgeProps {
  grade: string;
  className?: string;
}

export const AnimatedGradeBadge: React.FC<AnimatedGradeBadgeProps> = ({ grade, className }) => {
  const gradeNum = grade.split(' -')[0];
  const isSevere = gradeNum === 'IV' || gradeNum === 'Grade IV';

  let variant: "default" | "grade4" | "grade3" | "grade2" | "grade1" | "ungraded" = "default";
  if (grade.includes('Grade IV') || grade.includes('IV')) variant = 'grade4';
  else if (grade.includes('Grade III') || grade.includes('III')) variant = 'grade3';
  else if (grade.includes('Grade II') || grade.includes('II')) variant = 'grade2';
  else if (grade.includes('Grade I') || grade.includes('I')) variant = 'grade1';
  else variant = 'ungraded';


  if (isSevere) {
    return (
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [1, 0.8, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Badge
          variant={variant}
          className={className}
        >
          {grade}
        </Badge>
      </motion.div>
    );
  }

  return (
    <Badge variant={variant} className={className}>
      {grade}
    </Badge>
  );
};
