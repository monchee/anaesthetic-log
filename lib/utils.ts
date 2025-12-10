import { DrugTestRow, LogFormData, Patient } from '../types';
import { FLAT_DRUG_OPTIONS } from './constants';

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

export const getGradeVariant = (grade: string): "grade4" | "grade3" | "grade2" | "grade1" | "ungraded" => {
    if (!grade) return "ungraded";
    const g = grade.toUpperCase();
    if (g === "4" || g.includes("IV") || g.includes("CARDIAC ARREST")) return "grade4";
    if (g === "3" || g.includes("III")) return "grade3";
    if (g === "2" || g.includes("II")) return "grade2";
    if (g === "1" || g.includes("I ") || g === "GRADE I") return "grade1";
    return "ungraded";
};

export const isSkinTestPositive = (row: DrugTestRow): boolean => {
    const spt = parseInt(row.sptWheal || '0');
    const idt100 = parseInt(row.idt100 || '0');
    const idt10 = parseInt(row.idt10 || '0');
    const idtNeat = parseInt(row.idtNeat || '0');
    return spt >= 3 || idt100 >= 3 || idt10 >= 3 || idtNeat >= 3;
};

export const getPositiveResults = (record: LogFormData) => {
  const drugs: string[] = [];
  const challengeName = record.challengeDrug === 'Other' ? (record.challengeDrugCustom || 'Other') : record.challengeDrug;

  if (record.proceedToChallenge && record.outcome === 'UNSUCCESS') {
      drugs.push(challengeName);
  }

  (record.testPanel || []).forEach((t) => {
      const drugName = t.drugName === 'Other' ? (t.customName || 'Other') : t.drugName;
      if (record.proceedToChallenge && drugName === challengeName) return;
      if (isSkinTestPositive(t)) {
          drugs.push(drugName);
      }
  });

  return [...new Set(drugs)]; 
};

export const getNegativeResults = (record: LogFormData) => {
  const drugs: string[] = [];
  const challengeName = record.challengeDrug === 'Other' ? (record.challengeDrugCustom || 'Other') : record.challengeDrug;

  if (record.proceedToChallenge && record.outcome === 'SUCCESS') {
      drugs.push(challengeName);
  }

  (record.testPanel || []).forEach((t) => {
      const drugName = t.drugName === 'Other' ? (t.customName || 'Other') : t.drugName;
      if (record.proceedToChallenge && drugName === challengeName) return;
      if (!isSkinTestPositive(t)) {
          drugs.push(drugName);
      }
  });

  return [...new Set(drugs)];
};

// --- CSV Parsing Utilities ---

const splitCSVLine = (line: string) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i+1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

export interface CsvParseResult {
    success: boolean;
    data: Patient[];
    error?: string;
    details?: string[];
}

/**
 * Robustly extracts HH:MM from various string formats.
 * Handles: "2024-04-24 12:00:50", "12:00", "1200", "12.00"
 */
const normalizeTime = (timeStr: string): string => {
    if (!timeStr) return "";
    
    // Clean up "Drug @ Time" format if passed accidentally
    const cleanStr = timeStr.includes('@') ? timeStr.split('@')[1] : timeStr;
    
    // Look for HH:MM pattern (colons or dots) inside the string
    const match = cleanStr.match(/(?:^|\s|T)(\d{1,2})[:.](\d{2})(?::(\d{2}))?/);
    if (match) {
        const h = match[1].padStart(2, '0');
        const m = match[2].padStart(2, '0');
        return `${h}:${m}`;
    }

    // Fallback: Check for 4 digit time without separator (e.g. 0800) if strict string
    const strictFourDigit = cleanStr.trim().match(/^(\d{2})(\d{2})$/);
    if (strictFourDigit) {
         const h = strictFourDigit[1];
         const m = strictFourDigit[2];
         // Basic validity check
         if (parseInt(h) < 24 && parseInt(m) < 60) {
             return `${h}:${m}`;
         }
    }

    return "";
};

// Helper to compare times "HH:MM"
const isTimeBefore = (t1: string, t2: string): boolean => {
    if (!t1 || !t2) return false;
    // Simple string comparison works for HH:MM format 24h
    return t1 < t2;
};

interface ExtractedDrug {
    name: string;
    time?: string;
}

/**
 * Extracts potential drug names from a text block and looks for associated times.
 */
const extractDrugsWithContext = (text: string): ExtractedDrug[] => {
    if (!text) return [];
    // Replace newlines with spaces to ensure regex works across lines
    const cleanText = text.replace(/\n/g, ' '); 
    const lowerText = cleanText.toLowerCase();
    const found: ExtractedDrug[] = [];
    
    const aliases: Record<string, string> = {
        'sux': 'Suxamethonium',
        'roc': 'Rocuronium',
        'vec': 'Vecuronium',
        'cis': 'Cis-atracurium',
        'atr': 'Atracurium',
        'prop': 'Propofol',
        'midaz': 'Midazolam',
        'fent': 'Fentanyl',
        'remi': 'Remifentanil',
        'cef': 'Cefazolin',
        'ceph': 'Cefazolin',
        'co-amoxiclav': 'Augmentin',
        'augmentin': 'Augmentin',
        'tazocin': 'Piperacillin/Tazobactam',
        'vanc': 'Vancomycin',
        'gent': 'Gentamicin',
        'chlorhex': 'Chlorhexidine',
        'blue': 'Patent Blue',
        'sugammadex': 'Sugammadex',
        'bridion': 'Sugammadex'
    };

    const checkAndAdd = (term: string, canonicalName: string) => {
        // Regex to find the term as a whole word
        const drugRegex = new RegExp(`\\b${term}\\b`, 'gi');
        let match;
        
        while ((match = drugRegex.exec(cleanText)) !== null) {
            // Found a drug match. 
            // Look for time in wider proximity (prev 15 chars, next 30 chars) to catch "08:00 Drug" or "Drug 08:00"
            const startSearch = Math.max(0, match.index - 20);
            const endSearch = Math.min(cleanText.length, match.index + term.length + 30);
            const snippet = cleanText.substring(startSearch, endSearch);
            
            // Regex for time: HH:MM or HH.MM or @ HHMM or just HHMM
            const timeRegex = /(?:@|at)?\s*(\b(?:[01]?\d|2[0-3])[:.][0-5]\d\b|\b(?:0\d|1\d|2[0-3])[0-5]\d\b)/i;
            const timeMatch = snippet.match(timeRegex);
            
            let time = undefined;
            if (timeMatch) {
                let rawTime = timeMatch[1];
                // Normalize 1400 to 14:00
                if (/^\d{4}$/.test(rawTime)) {
                    rawTime = `${rawTime.substring(0,2)}:${rawTime.substring(2)}`;
                }
                time = rawTime.replace('.', ':');
            }

            // Avoid duplicates with same time
            const existing = found.find(f => f.name === canonicalName && f.time === time);
            if (!existing) {
                found.push({ name: canonicalName, time });
            }
        }
    };

    // Check standard list
    FLAT_DRUG_OPTIONS.forEach(drug => {
        if (lowerText.includes(drug.toLowerCase())) {
            checkAndAdd(drug, drug);
        }
    });

    // Check aliases
    Object.entries(aliases).forEach(([alias, canonical]) => {
        if (lowerText.includes(alias.toLowerCase())) {
            checkAndAdd(alias, canonical);
        }
    });

    // Deduplicate by preference (if same drug found with and without time, prefer with time)
    const uniqueMap = new Map<string, ExtractedDrug>();
    found.forEach(item => {
        const existing = uniqueMap.get(item.name);
        if (!existing || (!existing.time && item.time)) {
            uniqueMap.set(item.name, item);
        }
    });

    return Array.from(uniqueMap.values());
};

export const parseRedcapCSV = (csvText: string): CsvParseResult => {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) {
      return { success: false, data: [], error: "The CSV file appears to be empty or missing a header row." };
  }
  
  const headers = splitCSVLine(lines[0]);
  const data: Patient[] = [];

  const getIndex = (candidates: string[]) => {
      for (const c of candidates) {
          let idx = headers.findIndex(h => h.trim() === c.trim());
          if (idx !== -1) return idx;
          idx = headers.findIndex(h => h.trim().toLowerCase() === c.trim().toLowerCase());
          if (idx !== -1) return idx;
      }
      return -1;
  };

  const idxId = getIndex(["record_id", "Record ID"]);
  
  if (idxId === -1) {
      return { 
          success: false, 
          data: [], 
          error: "Missing critical column: 'record_id' or 'Record ID'.",
          details: ["The file must be a REDCap export containing the Record ID."] 
      };
  }

  const idxFirst = getIndex(["first_name", "First Name"]);
  const idxLast = getIndex(["last_name", "Last Name"]);
  const idxDob = getIndex(["dob", "Date of birth"]);
  const idxGender = getIndex(["sex", "Gender"]);
  const idxCity = getIndex(["city", "City"]);
  const idxHospital = getIndex(["hospital", "Hospital where reaction occurred"]);
  const idxDate = getIndex(["datereaction", "Date of Reaction"]);
  const idxInduction = getIndex(["time_induction", "Time of Induction"]);
  const idxReactionTime = getIndex(["time_reaction", "Time Reaction First Noted"]);
  const idxGrade = getIndex(["severity_of_allergic_react", "Severity of Allergic Reaction"]);
  const idxSummary = getIndex(["write_a_brief_summary_of_t", "reaction_summary", "Write a brief summary"]);
  const idxProcedure = getIndex(["procedure", "Procedure:"]);
  const idxAnaesthetist = getIndex(["namecompleter", "Name of Person Completing Form"]);
  const idxOutcome = getIndex(["outcome", "Outcome"]);

  const symptomMap: Record<string, string> = {
      'hypotension': 'Hypotension',
      'tachycardia_100bpm_before': 'Tachycardia',
      'bradycardia_60bpm': 'Bradycardia',
      'cardiac_arrest': 'Cardiac Arrest',
      'bronchospasm': 'Bronchospasm',
      'low_oxygen_saturations': 'Desaturation',
      'flushing_erythema': 'Flushing/Erythema',
      'uticaria': 'Urticaria',
      'angioedema': 'Angioedema',
      'rash': 'Rash'
  };

  const treatmentMap: Record<string, string> = {
      'adrenaline_given': 'Adrenaline',
      'iv_fluids_for_resuscitatio': 'Fluids',
      'cardiac_compressions': 'CPR',
      'steroids1': 'Steroids',
      'antihistamines': 'Antihistamines',
      'bronchospasm_treatment': 'Bronchodilators'
  };

  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVLine(lines[i]);
    if (row.length <= idxId) continue;
    const id = row[idxId];
    if (!id) continue;

    // Apply strict normalization to these columns
    const inductionTimeClean = normalizeTime(row[idxInduction]);
    const reactionTimeClean = normalizeTime(row[idxReactionTime]);

    const symptoms: string[] = [];
    Object.keys(symptomMap).forEach(key => {
        const colIdx = getIndex([key]);
        if (colIdx !== -1 && (row[colIdx] === '1' || row[colIdx]?.toLowerCase() === 'checked' || row[colIdx]?.toLowerCase() === 'yes')) {
            symptoms.push(symptomMap[key]);
        }
    });

    const treatment: string[] = [];
    Object.keys(treatmentMap).forEach(key => {
        const colIdx = getIndex([key]);
        if (colIdx !== -1 && (row[colIdx] === '1' || row[colIdx]?.toLowerCase() === 'checked' || row[colIdx]?.toLowerCase() === 'yes')) {
            treatment.push(treatmentMap[key]);
        }
    });

    let grade = "Ungraded";
    const rawGrade = row[idxGrade];
    if (rawGrade === "1") grade = "Grade I";
    else if (rawGrade === "2") grade = "Grade II";
    else if (rawGrade === "3") grade = "Grade III";
    else if (rawGrade === "4") grade = "Grade IV";
    else if (rawGrade) grade = rawGrade;

    let outcome = "Unknown";
    if (row[idxOutcome] === "1") outcome = "Abandoned";
    else if (row[idxOutcome] === "2") outcome = "Completed";
    else if (row[idxOutcome]) outcome = row[idxOutcome];

    // --- Extract Drugs ---
    const suspectedAgents: string[] = [];
    const preInductionDrugs: string[] = [];
    const postInductionDrugs: string[] = [];

    // 1. Explicit columns
    const idxOtherDrugs = getIndex(["other_drugs", "other_drugs_given"]);
    if (idxOtherDrugs !== -1 && row[idxOtherDrugs]) {
        const explicit = row[idxOtherDrugs];
        if (explicit.includes('@')) {
             const parts = explicit.split('@');
             const dName = parts[0].trim();
             const dTime = normalizeTime(parts[1].trim());
             
             if (inductionTimeClean && isTimeBefore(dTime, inductionTimeClean)) {
                 preInductionDrugs.push(explicit);
             } else {
                 postInductionDrugs.push(explicit);
             }
             if (!suspectedAgents.includes(dName)) suspectedAgents.push(dName);
        } else {
             if (!suspectedAgents.includes(explicit)) suspectedAgents.push(explicit);
        }
    }

    // 2. Scan Summary for drugs and times
    const summaryText = row[idxSummary] || '';
    if (summaryText) {
        const extracted = extractDrugsWithContext(summaryText);
        extracted.forEach(item => {
            // Always add to suspected list (name only) for analytics
            if (!suspectedAgents.includes(item.name)) suspectedAgents.push(item.name);

            // If time found, sort into timeline
            if (item.time) {
                const normDrugTime = normalizeTime(item.time);
                const formatted = `${item.name} @ ${normDrugTime}`;
                
                // Only sort if we have a valid induction time to compare against
                if (inductionTimeClean && isTimeBefore(normDrugTime, inductionTimeClean)) {
                    if (!preInductionDrugs.includes(formatted)) preInductionDrugs.push(formatted);
                } else {
                    if (!postInductionDrugs.includes(formatted)) postInductionDrugs.push(formatted);
                }
            } else {
               // No time found, do not add to timeline lists, leave in suspectedAgents
            }
        });
    }

    const patient: Patient = {
      id: id,
      firstName: row[idxFirst] || '',
      lastName: row[idxLast] || '',
      dob: row[idxDob] || '',
      mrn: id,
      gender: row[idxGender] === '0' ? 'Female' : row[idxGender] === '1' ? 'Male' : 'Other',
      city: row[idxCity] || '',
      history: {
        date: row[idxDate] || '',
        grade: grade,
        reactionSummary: summaryText,
        symptoms: symptoms,
        treatment: treatment,
        suspectedAgents: suspectedAgents,
        preInductionDrugs: preInductionDrugs, 
        postInductionDrugs: postInductionDrugs,
        procedure: row[idxProcedure] || 'Unknown',
        anaesthetist: row[idxAnaesthetist] || 'Unknown',
        hospital: row[idxHospital] || '',
        inductionTime: inductionTimeClean, // Use the cleaned time
        reactionTime: reactionTimeClean,   // Use the cleaned time
        procedureOutcome: outcome
      }
    };
    
    data.push(patient);
  }

  if (data.length === 0) {
      return { success: false, data: [], error: "Parsed CSV but found no valid patient records." };
  }

  return { success: true, data };
};