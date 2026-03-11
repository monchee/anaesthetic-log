

// Re-export utilities from specialized modules for backward compatibility
export { formatDate, calculateTimeDifference } from './dateUtils';
export { getGradeVariant, type GradeVariant } from './gradingUtils';
export { isSkinTestPositive, getPositiveResults, getNegativeResults } from './testingUtils';
export { parsePatientTimeline, type TimelineEvent } from './timelineUtils';
export { parseRedcapCSV, type CsvParseResult } from './csvUtils';

// Shadcn cn utility
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
