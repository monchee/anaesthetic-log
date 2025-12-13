import { PatientHistory } from '../types';

// Timeline parsing utilities

export interface TimelineEvent {
  time: string;
  type: 'med' | 'induction' | 'reaction' | 'info';
  label: string;
  subtext?: string;
}

// Key terms that identify an entry as an Anaesthesia Type, not a medication
const ANAESTHESIA_TYPE_KEYWORDS = [
    'General', 'General Anaesthesia', 'GA',
    'Regional', 'Regional Anaesthesia', 'Regional Block',
    'Local', 'Local Anaesthesia', 'LA',
    'Sedation', 'IV Sedation', 'Conscious Sedation'
];

// Regex to strip common dosage patterns (e.g., " 50mg", " 2g", " 2.5ml", " 100mcg")
const DOSAGE_REGEX = /\s+\d+(\.\d+)?\s*(mg|g|mcg|ml|l|units|unit|%)\b/gi;

export const parsePatientTimeline = (history: PatientHistory) => {
  const events: TimelineEvent[] = [];
  const untimed: string[] = [];

  const cleanMedicationName = (name: string) => {
      return name.replace(DOSAGE_REGEX, '').trim();
  };

  const processDrug = (d: string) => {
      const trimmedD = d.trim();
      if (!trimmedD) return;

      if (trimmedD.includes('@')) {
          const parts = trimmedD.split('@');
          const rawLabel = parts[0].trim();
          const drugLabel = cleanMedicationName(rawLabel);
          const time = (parts[1] || '').trim();

          if (time) {
             events.push({ time, type: 'med', label: drugLabel });
          } else {
             if (drugLabel) untimed.push(drugLabel);
          }
      } else {
          untimed.push(cleanMedicationName(trimmedD));
      }
  };

  const allMedications = [
      ...(history.medications || []),
      ...(history.preInductionDrugs || []),
      ...(history.postInductionDrugs || [])
  ];

  [...new Set(allMedications)].forEach(d => processDrug(d));

  if (history.inductionTime) events.push({ time: history.inductionTime, type: 'induction', label: 'Anaesthetic Induction' });
  if (history.reactionTime) events.push({ time: history.reactionTime, type: 'reaction', label: 'Reaction Onset' });

  // Filter out items from 'untimed' that are actually anaesthesia types
  // This ensures they don't appear in "Medication with no listed time" if they are also displayed in the Induction Hover Card
  const filteredUntimed = untimed.filter(item => {
      // Check if this item is present in the anaesthesiaType array
      if (history.anaesthesiaType?.some(t => t.includes(item) || item.includes(t))) return false;

      // Also check against keywords just in case they were added to medications but not anaesthesiaType
      return !ANAESTHESIA_TYPE_KEYWORDS.some(kw => item.toLowerCase() === kw.toLowerCase());
  });

  return {
      events: events.sort((a, b) => a.time.localeCompare(b.time)),
      untimedMedications: filteredUntimed
  };
};
