import { DrugTestRow, LogFormData, Patient } from '../types';

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  // Check if it matches YYYY-MM-DD patterns usually found in ISO strings
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Determines the UI badge variant based on the grade string.
 */
export const getGradeVariant = (grade: string): "grade4" | "grade3" | "grade2" | "grade1" | "ungraded" => {
    if (!grade) return "ungraded";
    if (grade.includes("IV") || grade.includes("Cardiac Arrest")) return "grade4";
    if (grade.includes("III")) return "grade3";
    if (grade.includes("II")) return "grade2";
    if (grade.includes("I ") || grade === "Grade I") return "grade1";
    return "ungraded";
};

/**
 * Checks if a skin test row contains any positive result (>= 3mm).
 */
export const isSkinTestPositive = (row: DrugTestRow): boolean => {
    const spt = parseInt(row.sptWheal || '0');
    const idt100 = parseInt(row.idt100 || '0');
    const idt10 = parseInt(row.idt10 || '0');
    const idtNeat = parseInt(row.idtNeat || '0');
    return spt >= 3 || idt100 >= 3 || idt10 >= 3 || idtNeat >= 3;
};

export const getPositiveResults = (record: LogFormData) => {
  const drugs: string[] = [];
  
  // Resolve actual challenge name
  const challengeName = record.challengeDrug === 'Other' ? (record.challengeDrugCustom || 'Other') : record.challengeDrug;

  // 1. Challenge Positive
  if (record.proceedToChallenge && record.outcome === 'UNSUCCESS') {
      drugs.push(challengeName);
  }

  // 2. Skin Test Positive (Arbitrary >=3mm)
  (record.testPanel || []).forEach((t) => {
      const drugName = t.drugName === 'Other' ? (t.customName || 'Other') : t.drugName;
      
      // If challenged drug was tested in panel, rely on challenge outcome logic above if it was the specific target
      // But typically we list it if skin test positive regardless unless cleared by challenge.
      if (record.proceedToChallenge && drugName === challengeName) return;

      if (isSkinTestPositive(t)) {
          drugs.push(drugName);
      }
  });

  return [...new Set(drugs)]; 
};

export const getNegativeResults = (record: LogFormData) => {
  const drugs: string[] = [];

  // Resolve actual challenge name
  const challengeName = record.challengeDrug === 'Other' ? (record.challengeDrugCustom || 'Other') : record.challengeDrug;

  // 1. Challenge Negative
  if (record.proceedToChallenge && record.outcome === 'SUCCESS') {
      drugs.push(challengeName);
  }

  // 2. Skin Test Negative (Arbitrary <3mm)
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

export const parseRedcapCSV = (csvText: string): CsvParseResult => {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) {
      return { success: false, data: [], error: "The CSV file appears to be empty or missing a header row." };
  }
  
  const headers = splitCSVLine(lines[0]);
  const data: Patient[] = [];

  // Helper to find index safely
  const getIndex = (partialName: string) => headers.findIndex(h => h.toLowerCase().includes(partialName.toLowerCase()));

  // Validate Critical Columns
  const idxId = getIndex("Record ID");
  
  if (idxId === -1) {
      return { 
          success: false, 
          data: [], 
          error: "Missing critical column: 'Record ID'.",
          details: ["The file must be a standard REDCap export containing the 'Record ID' column."] 
      };
  }

  const idxFirst = getIndex("First Name");
  const idxLast = getIndex("Last Name");
  const idxDob = getIndex("Date of birth");
  const idxGender = getIndex("Gender");
  const idxCity = getIndex("City");
  const idxHospital = getIndex("Hospital where reaction occurred");
  const idxDate = getIndex("Date of Reaction");
  const idxInduction = getIndex("Time of Induction");
  const idxReactionTime = getIndex("Time Reaction First Noted");
  const idxGrade = getIndex("Severity of Allergic Reaction");
  const idxSummary = getIndex("Write a brief summary");
  const idxProcedure = getIndex("Procedure:");
  const idxAnaesthetist = getIndex("Name of Person Completing Form"); 
  const idxAnaesthetist2 = getIndex("Anaesthetic Consultant"); 

  // Identify columns for suspected agents (columns with "choice=")
  const agentCols = headers.map((h, i) => ({ h, i })).filter(col => col.h.includes("(choice="));

  // Identify columns for symptoms
  const symptomKeywords = ["Hypotension", "Tachycardia", "Bronchospasm", "Urticaria", "Rash", "Cardiac Arrest", "Desaturation", "Erythema", "Angioedema", "Swelling", "Wheeze"];
  const symptomCols = headers.map((h, i) => ({ h, i })).filter(col => symptomKeywords.some(k => col.h.toLowerCase().includes(k.toLowerCase())) && !col.h.includes("Treatment"));

  // Identify columns for treatment
  const treatmentKeywords = ["Adrenaline", "Fluids", "CPR", "Steroids", "Antihistamines", "Metaraminol", "Ephedrine", "Noradrenaline", "Vasopressin"];
  const treatmentCols = headers.map((h, i) => ({ h, i })).filter(col => treatmentKeywords.some(k => col.h.includes(k)));

  let skippedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVLine(lines[i]);
    
    // Skip completely malformed rows (length mismatch significantly)
    // We allow some flexibility, but it must at least cover the Record ID index
    if (row.length <= idxId) {
        skippedRows++;
        continue;
    }

    // Extract Suspected Agents
    const suspectedAgents: string[] = [];
    agentCols.forEach(col => {
        if (row[col.i] === "Checked") {
            const match = col.h.match(/choice=(.+)\)/);
            if (match && match[1]) {
                suspectedAgents.push(match[1]);
            }
        }
    });

    // Extract Symptoms
    const symptoms: string[] = [];
    symptomCols.forEach(col => {
        if (row[col.i] === "Checked" || row[col.i]?.toLowerCase() === "yes") {
            const keyword = symptomKeywords.find(k => col.h.toLowerCase().includes(k.toLowerCase()));
            if (keyword) symptoms.push(keyword);
        }
        if (col.h.includes("Other") && row[col.i] && row[col.i] !== "Unchecked") {
             symptoms.push(row[col.i]);
        }
    });

    // Extract Treatment
    const treatment: string[] = [];
    treatmentCols.forEach(col => {
         if (row[col.i] === "Checked" || row[col.i]?.toLowerCase() === "yes" || (row[col.i] && row[col.i] !== "Unchecked" && row[col.i].length > 1)) {
              const val = row[col.i] === "Checked" || row[col.i] === "Yes" ? col.h.split('(')[0].trim() : row[col.i];
              treatment.push(val);
         }
    });

    const patient: Patient = {
      id: row[idxId] || `CSV-${i}`,
      firstName: row[idxFirst] || '',
      lastName: row[idxLast] || '',
      dob: row[idxDob] || '',
      mrn: row[idxId] || '',
      gender: row[idxGender] || 'Unknown',
      city: row[idxCity] || '',
      history: {
        date: row[idxDate] || '',
        grade: row[idxGrade] ? row[idxGrade].split('-')[0].trim() : "Ungraded",
        reactionSummary: row[idxSummary] || '',
        symptoms: [...new Set(symptoms)],
        treatment: [...new Set(treatment)],
        suspectedAgents: [...new Set(suspectedAgents)],
        procedure: row[idxProcedure] || 'Unknown',
        anaesthetist: row[idxAnaesthetist] || row[idxAnaesthetist2] || 'Unknown',
        hospital: row[idxHospital] || '',
        inductionTime: row[idxInduction] || '',
        reactionTime: row[idxReactionTime] || ''
      }
    };
    
    if (patient.id) {
        data.push(patient);
    }
  }

  if (data.length === 0) {
      return { success: false, data: [], error: "Parsed CSV but found no valid patient records." };
  }

  return { success: true, data };
};