

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

export const getPositiveResults = (record: any) => {
  const drugs: string[] = [];
  
  // Resolve actual challenge name
  const challengeName = record.challengeDrug === 'Other' ? (record.challengeDrugCustom || 'Other') : record.challengeDrug;

  // 1. Challenge Positive
  if (record.proceedToChallenge && record.outcome === 'UNSUCCESS') {
      drugs.push(challengeName);
  }

  // 2. Skin Test Positive (Arbitrary >=3mm)
  (record.testPanel || []).forEach((t: any) => {
      const drugName = t.drugName === 'Other' ? (t.customName || 'Other') : t.drugName;
      // If challenged drug was tested in panel, rely on challenge outcome logic above if it was the specific target
      // But typically we list it if skin test positive regardless unless cleared by challenge.
      if (record.proceedToChallenge && drugName === challengeName) return;

      const isSPT_POS = t.sptWheal && parseInt(t.sptWheal) >= 3;
      const isIDT_POS = (t.idt100 && parseInt(t.idt100) >= 3) || 
                        (t.idt10 && parseInt(t.idt10) >= 3) || 
                        (t.idtNeat && parseInt(t.idtNeat) >= 3);

      if (isSPT_POS || isIDT_POS) {
          drugs.push(drugName);
      }
  });

  return [...new Set(drugs)]; 
};

export const getNegativeResults = (record: any) => {
  const drugs: string[] = [];

  // Resolve actual challenge name
  const challengeName = record.challengeDrug === 'Other' ? (record.challengeDrugCustom || 'Other') : record.challengeDrug;

  // 1. Challenge Negative
  if (record.proceedToChallenge && record.outcome === 'SUCCESS') {
      drugs.push(challengeName);
  }

  // 2. Skin Test Negative (Arbitrary <3mm)
  (record.testPanel || []).forEach((t: any) => {
      const drugName = t.drugName === 'Other' ? (t.customName || 'Other') : t.drugName;
      if (record.proceedToChallenge && drugName === challengeName) return;

      const isSPT_POS = t.sptWheal && parseInt(t.sptWheal) >= 3;
      const isIDT_POS = (t.idt100 && parseInt(t.idt100) >= 3) || 
                        (t.idt10 && parseInt(t.idt10) >= 3) || 
                        (t.idtNeat && parseInt(t.idtNeat) >= 3);

      if (!isSPT_POS && !isIDT_POS) {
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

export const parseRedcapCSV = (csvText: string): any[] => {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  
  const headers = splitCSVLine(lines[0]);
  const data = [];

  // Helper to find index safely
  const getIndex = (partialName: string) => headers.findIndex(h => h.toLowerCase().includes(partialName.toLowerCase()));

  const idxId = getIndex("Record ID");
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
  // "Name of Person Completing Form" usually captures the anaesthetist in this context
  const idxAnaesthetist = getIndex("Name of Person Completing Form"); 
  const idxAnaesthetist2 = getIndex("Anaesthetic Consultant"); // Fallback

  // Identify columns for suspected agents (columns with "choice=")
  const agentCols = headers.map((h, i) => ({ h, i })).filter(col => col.h.includes("(choice="));

  // Identify columns for symptoms (Checking for common keywords in header)
  const symptomKeywords = ["Hypotension", "Tachycardia", "Bronchospasm", "Urticaria", "Rash", "Cardiac Arrest", "Desaturation", "Erythema", "Angioedema", "Swelling", "Wheeze"];
  const symptomCols = headers.map((h, i) => ({ h, i })).filter(col => symptomKeywords.some(k => col.h.toLowerCase().includes(k.toLowerCase())) && !col.h.includes("Treatment"));

  // Identify columns for treatment
  const treatmentKeywords = ["Adrenaline", "Fluids", "CPR", "Steroids", "Antihistamines", "Metaraminol", "Ephedrine", "Noradrenaline", "Vasopressin"];
  const treatmentCols = headers.map((h, i) => ({ h, i })).filter(col => treatmentKeywords.some(k => col.h.includes(k)));


  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVLine(lines[i]);
    if (row.length < headers.length) continue; // Skip malformed rows

    // Extract Suspected Agents
    const suspectedAgents: string[] = [];
    agentCols.forEach(col => {
        if (row[col.i] === "Checked") {
            // Extract drug name: "Muscle Relaxant (choice=Rocuronium)" -> "Rocuronium"
            const match = col.h.match(/choice=(.+)\)/);
            if (match && match[1]) {
                suspectedAgents.push(match[1]);
            }
        }
    });

    // Extract Symptoms
    const symptoms: string[] = [];
    symptomCols.forEach(col => {
        if (row[col.i] === "Checked" || row[col.i].toLowerCase() === "yes") {
            // Use the keyword that matched as the symptom name
            const keyword = symptomKeywords.find(k => col.h.toLowerCase().includes(k.toLowerCase()));
            if (keyword) symptoms.push(keyword);
        }
        // Also check for text values in "Other" columns
        if (col.h.includes("Other") && row[col.i] && row[col.i] !== "Unchecked") {
             symptoms.push(row[col.i]);
        }
    });

    // Extract Treatment
    const treatment: string[] = [];
    treatmentCols.forEach(col => {
         if (row[col.i] === "Checked" || row[col.i].toLowerCase() === "yes" || (row[col.i] && row[col.i] !== "Unchecked" && row[col.i].length > 1)) {
              // Just add the header name or value
              const val = row[col.i] === "Checked" || row[col.i] === "Yes" ? col.h.split('(')[0].trim() : row[col.i];
              treatment.push(val);
         }
    });

    const patient = {
      id: row[idxId] || `CSV-${i}`,
      firstName: row[idxFirst] || '',
      lastName: row[idxLast] || '',
      dob: row[idxDob] || '',
      mrn: row[idxId] || '',
      gender: row[idxGender] || 'Unknown',
      city: row[idxCity] || '',
      history: {
        date: row[idxDate] || '',
        grade: row[idxGrade] ? row[idxGrade].split('-')[0].trim() : "Ungraded", // Clean up grade
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
    
    // Only add valid records (must have at least an ID)
    if (patient.id) {
        data.push(patient);
    }
  }
  return data;
};