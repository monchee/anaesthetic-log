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
    const g = grade.toUpperCase();
    if (g === "4" || g.includes("IV") || g.includes("CARDIAC ARREST")) return "grade4";
    if (g === "3" || g.includes("III")) return "grade3";
    if (g === "2" || g.includes("II")) return "grade2";
    if (g === "1" || g.includes("I ") || g === "GRADE I") return "grade1";
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

  // Helper to find index safely by checking multiple possible header names (Label or Raw)
  const getIndex = (candidates: string[]) => {
      for (const c of candidates) {
          // Exact match (trim whitespace)
          let idx = headers.findIndex(h => h.trim() === c.trim());
          if (idx !== -1) return idx;
          
          // Case-insensitive match
          idx = headers.findIndex(h => h.trim().toLowerCase() === c.trim().toLowerCase());
          if (idx !== -1) return idx;
          
          // Partial match (Label headers often contain extra info)
          // Only if candidate is reasonably specific (>3 chars) to avoid false positives
          if (c.length > 3) {
             idx = headers.findIndex(h => h.toLowerCase().includes(c.toLowerCase()));
             if (idx !== -1) return idx;
          }
      }
      return -1;
  };

  // Map Critical Columns (Label Name, Raw Name)
  const idxId = getIndex(["Record ID", "record_id"]);
  
  if (idxId === -1) {
      return { 
          success: false, 
          data: [], 
          error: "Missing critical column: 'Record ID' or 'record_id'.",
          details: ["The file must be a REDCap export containing the Record ID."] 
      };
  }

  const idxFirst = getIndex(["First Name", "first_name"]);
  const idxLast = getIndex(["Last Name", "last_name"]);
  const idxDob = getIndex(["Date of birth", "dob"]);
  const idxGender = getIndex(["Gender", "sex"]);
  const idxCity = getIndex(["City", "city"]);
  const idxHospital = getIndex(["Hospital where reaction occurred", "hospital"]);
  const idxDate = getIndex(["Date of Reaction", "datereaction"]);
  const idxInduction = getIndex(["Time of Induction", "time_induction"]);
  const idxReactionTime = getIndex(["Time Reaction First Noted", "time_reaction"]);
  const idxGrade = getIndex(["Severity of Allergic Reaction", "severity_of_allergic_react"]);
  const idxSummary = getIndex(["Write a brief summary", "write_a_brief_summary_of_t", "reaction_summary"]);
  const idxProcedure = getIndex(["Procedure:", "procedure"]);
  const idxAnaesthetist = getIndex(["Name of Person Completing Form", "namecompleter"]);
  const idxAnaesthetist2 = getIndex(["Anaesthetic Consultant", "referring_doc"]);

  // Identify columns for suspected agents (columns with "choice=")
  // FIX: Exclude acknowledgment/condition fields
  const excludedPhrases = ["acknowledge", "relevant conditions", "tick if patient taking", "documents to chase", "follow up", "checklist", "please acknowledge"];
  const agentCols = headers.map((h, i) => ({ h, i })).filter(col => 
      col.h.includes("(choice=") && 
      !excludedPhrases.some(phrase => col.h.toLowerCase().includes(phrase))
  );

  // Map Agent Names to their Time Administration columns
  // We scan headers for patterns like "Midazolam - Time of Administration"
  const timeColumnMap: Record<string, number> = {};
  headers.forEach((h, i) => {
      const lowerH = h.toLowerCase();
      if (lowerH.includes("time of administration")) {
          // Attempt to extract drug name. E.g., "Midazolam - Time of Administration" -> "Midazolam"
          const parts = h.split(/[-:]/); // Split by dash or colon
          let potentialDrugName = parts[0].trim();
          
          // Cleanup common suffixes if split didn't catch them or formatting varies
          potentialDrugName = potentialDrugName.replace(/time of administration/i, "").trim();
          
          if (potentialDrugName) {
              timeColumnMap[potentialDrugName.toLowerCase()] = i;
          }
      }
  });

  // Identify columns for symptoms
  const symptomKeywords = ["Hypotension", "Tachycardia", "Bronchospasm", "Urticaria", "Rash", "Cardiac Arrest", "Desaturation", "Erythema", "Angioedema", "Swelling", "Wheeze"];
  const symptomCols = headers.map((h, i) => ({ h, i })).filter(col => symptomKeywords.some(k => col.h.toLowerCase().includes(k.toLowerCase())) && !col.h.includes("Treatment"));

  // Identify columns for treatment
  const treatmentKeywords = ["Adrenaline", "Fluids", "CPR", "Steroids", "Antihistamines", "Metaraminol", "Ephedrine", "Noradrenaline", "Vasopressin"];
  const treatmentCols = headers.map((h, i) => ({ h, i })).filter(col => treatmentKeywords.some(k => col.h.includes(k)));

  let skippedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVLine(lines[i]);
    
    // Skip completely malformed rows
    if (row.length <= idxId) {
        skippedRows++;
        continue;
    }

    // FIX: Clean Induction Time (remove date if present, e.g. "2024-05-07 13:10" -> "13:10")
    // This prevents string comparison errors where date string > time string
    let inductionTime = row[idxInduction] || '';
    if (inductionTime.includes(' ') && inductionTime.includes(':')) {
        const parts = inductionTime.split(' ');
        // Assuming format YYYY-MM-DD HH:MM, take the time part. 
        const timePart = parts.find(p => p.includes(':'));
        if (timePart) inductionTime = timePart;
    }
    
    // Extract Suspected Agents and Split into Pre/Post Induction
    const suspectedAgents: string[] = [];
    const preInductionDrugs: string[] = [];
    const postInductionDrugs: string[] = [];

    agentCols.forEach(col => {
        if (row[col.i] === "Checked") {
            const match = col.h.match(/choice=(.+)\)/);
            if (match && match[1]) {
                const drugName = match[1];
                
                // Check if we have a time for this drug
                const timeIdx = timeColumnMap[drugName.toLowerCase()];
                const drugTime = timeIdx !== undefined ? row[timeIdx] : null;

                // FIX: Time comparison logic
                // inductionTime is now strictly HH:MM (e.g. "13:10")
                if (drugTime) {
                    if (inductionTime && drugTime < inductionTime) {
                         preInductionDrugs.push(`${drugName} @ ${drugTime}`);
                    } else {
                         // Post-induction or exact time match
                         postInductionDrugs.push(`${drugName} @ ${drugTime}`);
                    }
                } else {
                    // No time recorded
                    suspectedAgents.push(drugName);
                }
            }
        }
    });

    // Extract Symptoms
    const symptoms: string[] = [];
    symptomCols.forEach(col => {
        const val = row[col.i]?.toLowerCase();
        // Check for "Checked" (Label), "Yes" (Label), or "1" (Raw)
        if (val === "checked" || val === "yes" || val === "1") {
            const keyword = symptomKeywords.find(k => col.h.toLowerCase().includes(k.toLowerCase()));
            if (keyword) symptoms.push(keyword);
        }
        // Handle "Other" text fields
        if (col.h.includes("Other") && row[col.i] && row[col.i] !== "Unchecked" && row[col.i] !== "0") {
             symptoms.push(row[col.i]);
        }
    });

    // Extract Treatment
    const treatment: string[] = [];
    treatmentCols.forEach(col => {
         const val = row[col.i];
         const lowerVal = val?.toLowerCase();
         // Check for "Checked", "Yes", "1" or text content
         if (lowerVal === "checked" || lowerVal === "yes" || lowerVal === "1" || (val && lowerVal !== "unchecked" && lowerVal !== "0" && val.length > 1)) {
              // Use header name if it's a checkbox, otherwise use value
              const displayVal = (lowerVal === "checked" || lowerVal === "yes" || lowerVal === "1") 
                ? col.h.split('(')[0].trim() // Clean "Adrenaline (choice=IV)" to "Adrenaline"
                : val;
              treatment.push(displayVal);
         }
    });

    // Normalize Grade from Raw Code (1-4) to Label if needed
    let grade = row[idxGrade] ? row[idxGrade].split('-')[0].trim() : "Ungraded";
    if (grade === "1") grade = "Grade I";
    if (grade === "2") grade = "Grade II";
    if (grade === "3") grade = "Grade III";
    if (grade === "4") grade = "Grade IV";

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
        grade: grade,
        reactionSummary: row[idxSummary] || '',
        symptoms: [...new Set(symptoms)],
        treatment: [...new Set(treatment)],
        suspectedAgents: [...new Set(suspectedAgents)],
        preInductionDrugs: [...new Set(preInductionDrugs)],
        postInductionDrugs: [...new Set(postInductionDrugs)],
        procedure: row[idxProcedure] || 'Unknown',
        anaesthetist: row[idxAnaesthetist] || row[idxAnaesthetist2] || 'Unknown',
        hospital: row[idxHospital] || '',
        inductionTime: row[idxInduction] || '', // Keep original detailed string for display if needed
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