// Backward compatibility - re-exports from new location
export { cn } from '../src/shared/utils/cn';
export { formatDate, calculateTimeDifference } from '../src/shared/utils/dateUtils';
export { getGradeVariant, type GradeVariant } from '../src/shared/utils/gradingUtils';
export { isSkinTestPositive, getPositiveResults, getNegativeResults } from '../src/shared/utils/testingUtils';
export { parsePatientTimeline, type TimelineEvent } from '../src/shared/utils/timelineUtils';
export { parseRedcapCSV, type CsvParseResult } from '../src/shared/utils/csvUtils';
