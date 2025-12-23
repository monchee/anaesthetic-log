// Date utility functions

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const calculateTimeDifference = (start?: string, end?: string): number | null => {
    if (!start || !end) return null;

    const parseMinutes = (timeStr: string) => {
        // Handle HH:MM or HH:MM:SS
        const parts = timeStr.trim().split(':').map(Number);
        if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
        return parts[0] * 60 + parts[1];
    };

    const startMins = parseMinutes(start);
    const endMins = parseMinutes(end);

    if (startMins === null || endMins === null) return null;

    let diff = endMins - startMins;

    // Handle midnight crossing (e.g. Induction 23:50, Reaction 00:05)
    // Assumption: Reaction is within 24 hours of induction.
    if (diff < 0) {
        diff += 1440; // Add 24 hours in minutes
    }

    return diff;
};
