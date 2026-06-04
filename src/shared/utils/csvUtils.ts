import { Patient } from '@features/patients/types';

// CSV parsing utilities

const TIME_HHMMSS_REGEX = /(\d{1,2}):(\d{2})(?::\d{2})?/;
const TIME_HHMM_REGEX = /^(\d{2})(\d{2})$/;
const DRUG_CHOICE_REGEX = /\(choice=(.+)\)/;

export interface CsvParseResult {
    success: boolean;
    data: Patient[];
    error?: string;
    details?: string[];
}

// Required headers for a valid REDCap export
const REQUIRED_HEADERS = [
    'Record ID',
    'First Name',
    'Last Name',
    'Date of Reaction:'
];

/**
 * Validates that the CSV headers contain all required REDCap columns.
 * Returns null if valid, or an error message if validation fails.
 */
const validateCSVHeaders = (headers: string[]): string | null => {
    const normalizedHeaders = headers.map(h => h.trim());
    const missingHeaders: string[] = [];

    for (const required of REQUIRED_HEADERS) {
        if (!normalizedHeaders.includes(required)) {
            missingHeaders.push(required);
        }
    }

    if (missingHeaders.length > 0) {
        return `Missing required columns: ${missingHeaders.join(', ')}. ` +
               `Please ensure you're exporting from REDCap using "CSV / Microsoft Excel (labels)" format.`;
    }

    return null;
};

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

const normalizeTime = (timeStr: string): string => {
    if (!timeStr) return "";
    const cleanStr = timeStr.trim();

    // Check for HH:MM:SS
    let match = cleanStr.match(TIME_HHMMSS_REGEX);
    if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;

    // Check for HHMM
    match = cleanStr.match(TIME_HHMM_REGEX);
    if (match) {
        const h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        if (h < 24 && m < 60) return `${match[1]}:${match[2]}`;
    }

    return cleanStr;
};

// Configuration for CSV parsing (moved from utils.ts)
const DRUG_TIME_MATCHERS: Record<string, string[]> = {
    'Suxamethonium': ['Sux', 'Suxamethonium'],
    'Rocuronium': ['Roc', 'Rocuronium'],
    'Vecuronium': ['Vec', 'Vecuronium'],
    'Cisatracurium': ['Cisatracurium', 'Cis', 'Cisatracurirum'],
    'Atracurium': ['Atracurirum', 'Atracurium', 'Atr'],
    'Mivacurium': ['Miva', 'Mivacurium'],
    'Thiopentine': ['Thiopentine', 'Thiopentone'],
    'Dexamethasone': ['Dexmethasone', 'Dexamethasone'],
    'Chlorhexidine': ['Chlorhex', 'Chlorhexidine'],
    'Amoxicillin': ['Amoxicillin', 'Amoxycillin'],
    'Cefazolin': ['Cefazolin', 'Cephazolin'],
    'Metoclopramide': ['Metoclopramide', 'Metoclopr'],
    'Ondansetron': ['Ondansetron'],
    'Parecoxib': ['Parecoxib'],
    'Paracetamol': ['Paracetamol'],
    'Tramadol': ['Tramadol'],
    'Lignocaine': ['Lignocaine', 'Lidocaine'],
    'Patent Blue': ['Patent Blue'],
    'Methylene Blue': ['Methylene Blue'],
    'Heparin': ['Heparin'],
    'Protamine': ['Protamine'],
    'Sugammadex': ['Sugammadex', 'Sugamma'],
    'Neostigmine': ['Neostigmine'],
    'Atropine': ['Atropine'],
    'Glycopyrrolate': ['Glycopyrrolate', 'Glycopyrrolate'],
    'Rocuronium/ Sugammadex complex': ['Roc/Sugammadex complex'],
    'Anti-hypertensive': ['Ant-hypertensive', 'Anti-hypertensive'],
    'Inotrope/vasopressor': ['Inotrope/vasopressor'],
    'Iodinated Contrast Media': ['Iodinated contrast']
};

interface SymptomMapConfig {
    key: string;
    label: string;
    detailKey?: string;
    detailCheckboxes?: string[];
}

const SYMPTOM_CONFIGS: SymptomMapConfig[] = [
    { key: "Tachycardia (>100bpm before adrenaline)", label: "Tachycardia" },
    { key: "Bradycardia (< 60bpm)", label: "Bradycardia" },
    { key: "Arrhythmia", label: "Arrhythmia", detailKey: "Arrhythmia Type:" },
    { key: "Hypotension", label: "Hypotension" },
    { key: "Cardiac Arrest", label: "Cardiac Arrest" },
    { key: "Cough", label: "Cough" },
    {
        key: "Bronchospasm",
        label: "Bronchospasm",
        detailCheckboxes: [
            "Mild Wheeze",
            "Moderate Wheeze",
            "Severe Wheeze",
            "Dyspnoea reported by patient",
            "Difficult to ventilate",
            "Very difficult to ventilate"
        ]
    },
    { key: "Low Oxygen Saturations", label: "Desaturation" },
    {
        key: "Flushing/Erythema",
        label: "Flushing/Erythema",
        detailCheckboxes: ["Local", "Generalised"]
    },
    { key: "Urticaria", label: "Urticaria", detailCheckboxes: ["Local", "Generalised"] },
    { key: "Piloerection", label: "Piloerection" },
    { key: "Angioedema", label: "Angioedema" },
    { key: "Swelling", label: "Swelling", detailKey: "Swelling - Site/Duration:" },
    { key: "Other Cutaneous Signs", label: "Other Cutaneous", detailKey: "Other cutaneous signs:" },
    { key: "Gastrointestinal Signs", label: "GI Symptoms", detailKey: "GIT Symptoms Other" },
];

const TREATMENT_CONFIGS = [
    { key: "Adrenaline Given", label: "Adrenaline" },
    { key: "IV Fluids for Resuscitation", label: "IV Fluids" },
    { key: "Cardiac Compressions", label: "CPR" },
    { key: "Cardioversion/Defib", label: "Defibrillation" },
    { key: "Vasopressors/second line agents other than adrenaline", label: "Vasopressors" },
    { key: "Steroids", label: "Steroids" },
    { key: "Antihistamines", label: "Antihistamines" },
    { key: "Bronchospasm Treatment", label: "Bronchodilators" },
    { key: "Other Treatment/Management", label: "Other Treatment" }
];

const OTHER_DRUG_COLUMNS_CONFIG = [
    { label: 'Other Opioid' },
    { label: 'Other NMB' },
    { label: 'Other abs' },
    { label: 'Anti-emetic Other' },
    { label: 'Steroid Other' },
    { label: 'Other Non-Opioid' },
    { label: 'Local Other' },
    { label: 'Fluids Other' }
];

// Configuration for Type of Anaesthesia headers
const ANAESTHESIA_MAP_CONFIG = [
    { keyword: 'General', label: 'General' },
    { keyword: 'Regional', label: 'Regional' },
    { keyword: 'Local', label: 'Local' },
    { keyword: 'Sedation', label: 'IV Sedation' }
];

export const parseRedcapCSV = (csvText: string): CsvParseResult => {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { success: false, data: [], error: "Empty or invalid CSV." };

  const headers = splitCSVLine(lines[0]);

  // Validate headers before processing
  const headerError = validateCSVHeaders(headers);
  if (headerError) {
      return { success: false, data: [], error: headerError };
  }

  const data: Patient[] = [];

  // --- 1. Map Information Columns ---
  const colIndices: Record<string, number> = {};

  headers.forEach((h, idx) => {
      const header = h.trim();
      if (header === 'Record ID') colIndices['id'] = idx;
      else if (header === 'First Name') colIndices['firstName'] = idx;
      else if (header === 'Last Name') colIndices['lastName'] = idx;
      else if (header === 'Date of birth') colIndices['dob'] = idx;
      else if (header === 'Gender') colIndices['gender'] = idx;
      else if (header === 'City') colIndices['city'] = idx;
      else if (header === 'Hospital where reaction occurred:') colIndices['hospital'] = idx;
      else if (header === 'Procedure:') colIndices['procedure'] = idx;
      else if (header === 'Date of Reaction:') colIndices['date'] = idx;
      else if (header === 'Time of Induction:') colIndices['inductionTime'] = idx;
      else if (header === 'Time Reaction First Noted:') colIndices['reactionTime'] = idx;
      else if (header === 'Referring Doctor (Name)') colIndices['referringDoctor'] = idx;
      else if (header === 'Position:' || (header.includes('Position') && (header.includes('Referring') || header.includes('Doctor')))) colIndices['referringDoctorPosition'] = idx;
      else if (header === 'Provider Number:') colIndices['providerNumber'] = idx;
      else if (header === 'Email Address:') colIndices['referringEmail'] = idx;
      else if (header === 'Phone Number:') colIndices['phoneNumber'] = idx;
      else if (header.includes('Severity of Allergic Reaction')) colIndices['grade'] = idx;
      else if (header.includes('Write a brief summary')) colIndices['summary'] = idx;
      else if (header === 'Comments' && colIndices['comments'] === undefined) colIndices['comments'] = idx;
      else if (header === 'Outcome?') colIndices['outcome'] = idx;
      else if (header === 'What was first symptom noticed?') colIndices['firstSymptom'] = idx;
      else if (header === 'What was predominant symptom?') colIndices['predominantSymptom'] = idx;
  });

  // --- 2. Map Symptoms & Treatments ---
  const symptomMap: {
      label: string,
      boolIndex: number,
      textIndex?: number,
      checkboxIndices?: { label: string, index: number }[]
  }[] = [];

  SYMPTOM_CONFIGS.forEach(conf => {
      const boolIdx = headers.findIndex(h => h.trim() === conf.key);
      const textIdx = conf.detailKey ? headers.findIndex(h => h.trim() === conf.detailKey) : -1;

      const checkboxIndices: { label: string, index: number }[] = [];
      if (conf.detailCheckboxes) {
          conf.detailCheckboxes.forEach(cbLabel => {
              const cbIdx = headers.findIndex(h => h.includes(cbLabel) && (h.includes(conf.key) || h.includes(conf.key.split('/')[0])));
              if (cbIdx !== -1) {
                  checkboxIndices.push({ label: cbLabel, index: cbIdx });
              } else {
                  const looseIdx = headers.findIndex(h => h.includes(cbLabel));
                  if (looseIdx !== -1) checkboxIndices.push({ label: cbLabel, index: looseIdx });
              }
          });
      }

      if (boolIdx !== -1 || textIdx !== -1 || checkboxIndices.length > 0) {
          symptomMap.push({
              label: conf.label,
              boolIndex: boolIdx,
              textIndex: textIdx !== -1 ? textIdx : undefined,
              checkboxIndices: checkboxIndices.length > 0 ? checkboxIndices : undefined
          });
      }
  });

  const treatmentMap: { label: string, index: number }[] = [];
  TREATMENT_CONFIGS.forEach(conf => {
      const idx = headers.findIndex(h => h.includes(conf.key));
      if (idx !== -1) {
          treatmentMap.push({ label: conf.label, index: idx });
      }
  });

  // --- 3. Map Drug Checkboxes & Timings ---
  interface DrugMapping { name: string; checkIndex: number; timeIndex: number; }
  const drugMap: DrugMapping[] = [];

  headers.forEach((h, idx) => {
      const match = h.match(DRUG_CHOICE_REGEX);
      if (match) {
          const drugName = match[1].trim();
          if (
              h.includes('Relevant Conditions') || h.includes('Patient Taking') || h.includes('acknowledge') ||
              h.includes('Type of Anaesthesia') ||
              h.includes('Low oxygen saturations') || h.includes('Low Oxygen Saturations') ||
              h.includes('Flushing') || h.includes('Uticaria') || h.includes('Urticaria') ||
              h.includes('Bronchospasm:') || h.includes('Gastrointestinal Signs:') ||
              h.includes('exposed to agents') ||
              h.includes('Adrenaline Administration Route') ||
              h.includes('further complications') || h.includes('Documents to Chase') ||
              h.startsWith('Muscle Relaxant') || h.startsWith('Penicillin (') ||
              h.startsWith('Cephalospirin') || h.startsWith('Others (')
          ) return;

          let timeIdx = -1;
          const searchTerms = DRUG_TIME_MATCHERS[drugName] || [drugName];

          for (let i = 0; i < headers.length; i++) {
              const targetH = headers[i];
              if (!targetH.includes('Time')) continue;
              const matches = searchTerms.some(term => {
                  const prefix = targetH.split(/[- ]Time/)[0].trim();
                  return prefix.toLowerCase() === term.toLowerCase() || targetH.toLowerCase().startsWith(term.toLowerCase());
              });
              if (matches) {
                  timeIdx = i;
                  break;
              }
          }

          // Fallbacks
          if (timeIdx === -1) {
              if (drugName === 'Cyclizine' || drugName === 'Tropisetron') timeIdx = headers.findIndex(h => h.includes('Cyclizine/Tropisetron'));
              else if (drugName === 'Granisetron') timeIdx = headers.findIndex(h => h.includes('Other/Granisetron'));
              else if (drugName === 'Ibuprofen') timeIdx = headers.findIndex(h => h.includes('Ibuprofen/Other'));
              else if (drugName === 'Methylene Blue' || drugName === 'Patent Blue') timeIdx = headers.findIndex(h => h.includes('Patent Blue/Methylene Blue'));
              else if (drugName === 'Omnipaque' || drugName === 'Visipaque') timeIdx = headers.findIndex(h => h.includes('Omnipaque/Visipaque'));
              else if (drugName === 'Ultravist' || drugName === 'Gadolinium') timeIdx = headers.findIndex(h => h.includes('Ultravist/Gadolinium'));
          }

          drugMap.push({ name: drugName, checkIndex: idx, timeIndex: timeIdx });
      }
  });

  // --- 4. Map "Other" Free Text Columns ---
  const otherDrugColumns = OTHER_DRUG_COLUMNS_CONFIG.map(config => {
      const nameIndex = headers.findIndex(h => h.trim() === config.label);
      let timeIndex = -1;
      if (nameIndex !== -1) {
          for (let i = nameIndex + 1; i < headers.length && i < nameIndex + 5; i++) {
              if (headers[i].includes('Time') && (headers[i].includes('Other') || headers[i].includes(' - Time'))) {
                  timeIndex = i;
                  break;
              }
          }
      }
      return { ...config, nameIndex, timeIndex };
  });

  const genericOtherIndex = headers.findIndex(h => h.includes('Other Drugs (please specify drug and time'));

  // --- 4b. Map "Agent Name" and "Exposure Time" pairs ---
  interface AgentTimePair { nameIndex: number; timeIndex: number; }
  const agentTimePairs: AgentTimePair[] = [];

  headers.forEach((h, idx) => {
      const lowerH = h.toLowerCase();
      if (lowerH.includes('agent name')) {
          let timeIdx = -1;
          for (let offset = 1; offset <= 5; offset++) {
              if (idx + offset < headers.length) {
                  const candidateH = headers[idx + offset].toLowerCase();
                  if (candidateH.includes('exposure time') || (candidateH.includes('time') && !candidateH.includes('agent name'))) {
                      timeIdx = idx + offset;
                      break;
                  }
              }
          }
          if (timeIdx !== -1) {
              agentTimePairs.push({ nameIndex: idx, timeIndex: timeIdx });
          }
      }
  });

  // --- 5. Map Tryptase Columns ---
  // REDCap repeats identical headers: 'Serum Tryptase Time' × 4 and 'Serum Tryptase Result' × 4
  // We collect ALL matching indices to pair them up.
  const tryptaseTimeIndices: number[] = [];
  const tryptaseResultIndices: number[] = [];
  const biochemTryptaseIndices: number[] = [];
  headers.forEach((h, idx) => {
    const t = h.trim();
    if (t === 'Serum Tryptase Time') tryptaseTimeIndices.push(idx);
    else if (t === 'Serum Tryptase Result' || t === 'Serum Tryptase Result ') tryptaseResultIndices.push(idx);
    else if (/Biochemical Results:\s*Tryptase \d+:/.test(t)) biochemTryptaseIndices.push(idx);
  });

  // --- 6. Map Testing Plan Instrument ---
  // The last REDCap instrument has explicit checkboxes for which drugs to test.
  // We distinguish it from reaction-drug columns by finding the first
  // "Muscle Relaxant (choice=…)" header, which only appears in the testing plan.
  const TESTING_PLAN_DRUG_MAPPING: Record<string, string[]> = {
    'Cis-atracurium':  ['Cis-atracurium'],
    'Rocuronium':      ['Rocuronium'],
    'Pancuronium':     ['Pancuronium'],
    'Vecuronium':      ['Vecuronium'],
    'Suxamethonium':   ['Suxamethonium'],
    'Sugammadex':      ['Sugammadex (Alone)', 'Sugammadex (+ Rocuronium)'],
    'Major/Minor':     ['Penicillin Major', 'Penicillin Minor'],
    'Ampicillin':      ['Ampicillin'],
    'Amoxycillin':     ['Amoxycillin'],
    'Cefotaxime':      ['Cefotaxime'],
    'Cefazolin':       ['Cefazolin'],
    'Ceftazidime':     ['Ceftazidime'],
    'Ceftriaxone':     ['Ceftriaxone'],
    'Cefepime':        ['Cefepime'],
    'Midazolam':       ['Midazolam'],
    'Propofol':        ['Propofol'],
    'Lignocaine':      ['Lignocaine'],
    'Mepivacaine':     ['Mepivacaine'],
    'Bupivacaine':     ['Bupivacaine'],
    'Ropivacaine':     ['Ropivacaine'],
    'Alfentanil':      ['Alfentanil'],
    'Fentanyl':        ['Fentanyl'],
    'Morphine':        ['Morphine'],
    'Remifentanil':    ['Remifentanil'],
    'Oxycodone':       ['Oxycodone'],
    'Chlorhexidine':   ['Chlorhexidine'],
    'Povidone Iodine': ['Povidone Iodine'],
    'Latex':           ['Latex'],
    'Paracetamol':     ['Paracetamol'],
    'Parecoxib':       ['Parecoxib'],
    'Patent Blue':     ['Patent Blue'],
    'Methylene Blue':  ['Methylene Blue'],
    'Atropine':        ['Atropine'],
    'Neostigmine':     ['Neostigmine'],
  };

  interface TestingPlanDrugMapping { dreamNames: string[]; columnIndex: number; }
  const testingPlanDrugMap: TestingPlanDrugMapping[] = [];

  const testingPlanCustomIdx = headers.findIndex(h =>
    h.trim().startsWith('Others (not listed)') && h.includes('Please write below')
  );

  interface DocsToChaseMapping { key: 'tryptases' | 'anaestheticChart' | 'other'; columnIndex: number; }
  const docsToChaseMap: DocsToChaseMapping[] = [];
  const docsToChaseOtherTextIdx = headers.findIndex(h => h.trim() === 'Other Documents ');

  const testingPlanStartIdx = headers.findIndex(h => h.trim().startsWith('Muscle Relaxant (choice='));
  if (testingPlanStartIdx !== -1) {
    for (let idx = testingPlanStartIdx; idx < headers.length; idx++) {
      const h = headers[idx].trim();
      const choiceMatch = h.match(DRUG_CHOICE_REGEX);
      if (choiceMatch && !h.includes('Documents to Chase')) {
        const redcapName = choiceMatch[1].trim();
        const dreamNames = TESTING_PLAN_DRUG_MAPPING[redcapName];
        if (dreamNames) {
          testingPlanDrugMap.push({ dreamNames, columnIndex: idx });
        }
      }
      if (h.startsWith('Documents to Chase:')) {
        if (h.includes('Tryptase')) docsToChaseMap.push({ key: 'tryptases', columnIndex: idx });
        else if (h.includes('Anaesthetic Chart')) docsToChaseMap.push({ key: 'anaestheticChart', columnIndex: idx });
        else if (h.includes('Other Documents')) docsToChaseMap.push({ key: 'other', columnIndex: idx });
      }
    }
  }

  // --- 7. Map Anaesthesia Types ---
  const anaesthesiaTypeMap: { label: string, index: number }[] = [];
  headers.forEach((h, idx) => {
      if (h.includes('Type of Anaesthesia')) {
          const match = ANAESTHESIA_MAP_CONFIG.find(conf => h.includes(conf.keyword));
          if (match) {
              anaesthesiaTypeMap.push({ label: match.label, index: idx });
          }
      }
  });


  // --- 8. Process Rows ---
  const parsingErrors: string[] = [];
  const skippedRows: number[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVLine(lines[i]);
    if (row.length < 2) {
        skippedRows.push(i + 1); // +1 for 1-based row number
        continue;
    }

    const getVal = (key: string) => {
        const idx = colIndices[key];
        return (idx !== undefined && row[idx]) ? row[idx].trim() : '';
    };

    const id = getVal('id') || `REC-${i}`;
    const p: Patient = {
        id,
        firstName: getVal('firstName') || 'Unknown',
        lastName: getVal('lastName') || 'Unknown',
        dob: getVal('dob'),
        mrn: id,
        redcapId: id,
        gender: getVal('gender'),
        city: getVal('city'),
        history: {
            date: getVal('date') || new Date().toISOString(),
            grade: getVal('grade'),
            reactionSummary: getVal('summary'),
            comments: getVal('comments'),
            procedure: getVal('procedure') || 'Unknown',
            hospital: getVal('hospital') || 'Unknown',
            anaesthetist: 'Unknown',
            referringDoctor: getVal('referringDoctor'),
            referringDoctorPosition: getVal('referringDoctorPosition'),
            providerNumber: getVal('providerNumber'),
            referringEmail: getVal('referringEmail'),
            referringPhone: getVal('phoneNumber'),
            inductionTime: normalizeTime(getVal('inductionTime')),
            reactionTime: normalizeTime(getVal('reactionTime')),
            procedureOutcome: getVal('outcome'),
            firstSymptom: getVal('firstSymptom'),
            predominantSymptom: getVal('predominantSymptom'),
            medications: [],
            symptoms: [],
            treatment: [],
            suspectedAgents: [],
            anaesthesiaType: []
        }
    };

    // Extract Symptoms
    symptomMap.forEach(s => {
        let isPresent = false;
        const detailParts: string[] = [];

        if (s.boolIndex !== -1) {
            const val = row[s.boolIndex]?.trim().toLowerCase();
            if (['checked', 'yes', 'true', '1'].includes(val)) isPresent = true;
        }

        if (s.checkboxIndices) {
            s.checkboxIndices.forEach(cb => {
                const val = row[cb.index]?.trim().toLowerCase();
                if (['checked', 'yes', 'true', '1'].includes(val)) {
                    detailParts.push(cb.label);
                    isPresent = true;
                }
            });
        }

        if (s.textIndex !== undefined && row[s.textIndex]) {
            const textVal = row[s.textIndex].trim();
            if (textVal) {
                detailParts.push(textVal);
                if (s.boolIndex === -1 || row[s.boolIndex]?.trim().toLowerCase() !== 'unchecked') {
                    isPresent = true;
                }
            }
        }

        if (isPresent) {
            p.history.symptoms.push({
                label: s.label,
                detail: detailParts.length > 0 ? detailParts.join(', ') : undefined
            });
        }
    });

    // Extract Treatments
    treatmentMap.forEach(t => {
        const val = row[t.index]?.trim().toLowerCase();
        if (['checked', 'yes', 'true', '1'].includes(val)) {
            p.history.treatment.push(t.label);
        }
    });

    // Extract Medications helper
    const addMed = (name: string, timeIdx: number) => {
        let entry = name;
        if (timeIdx !== -1 && row[timeIdx]) {
            const time = normalizeTime(row[timeIdx]);
            if (time) entry += ` @ ${time}`;
        }
        p.history.medications?.push(entry);
    };

    drugMap.forEach(d => {
        const checkVal = row[d.checkIndex]?.trim().toLowerCase();
        if (checkVal === 'checked') addMed(d.name, d.timeIndex);
    });

    otherDrugColumns.forEach(d => {
        if (d.nameIndex !== -1 && row[d.nameIndex]) {
            const name = row[d.nameIndex].trim();
            if (name && name.toLowerCase() !== 'unchecked') addMed(name, d.timeIndex);
        }
    });

    if (genericOtherIndex !== -1 && row[genericOtherIndex]) {
        const val = row[genericOtherIndex].trim();
        if (val) p.history.medications?.push(val);
    }

    agentTimePairs.forEach(pair => {
        const name = row[pair.nameIndex]?.trim();
        const timeVal = row[pair.timeIndex]?.trim();
        if (name && name.toLowerCase() !== 'unchecked') {
            let entry = name;
            if (timeVal) {
                const time = normalizeTime(timeVal);
                if (time) entry += ` @ ${time}`;
            }
            p.history.medications?.push(entry);
        }
    });

    // Extract Anaesthesia Types
    anaesthesiaTypeMap.forEach(t => {
        const val = row[t.index]?.trim().toLowerCase();
        if (['checked', 'yes', 'true', '1'].includes(val)) {
            p.history.anaesthesiaType?.push(t.label);
        }
    });

    // Extract Tryptase Samples
    const tryptases: Array<{ time?: string; result: string }> = [];
    const pairCount = Math.min(tryptaseTimeIndices.length, tryptaseResultIndices.length);
    for (let t = 0; t < pairCount; t++) {
      const resultVal = row[tryptaseResultIndices[t]]?.trim();
      if (resultVal) {
        const timeVal = row[tryptaseTimeIndices[t]]?.trim();
        const normalized = timeVal ? normalizeTime(timeVal) : undefined;
        tryptases.push({ time: normalized || undefined, result: resultVal });
      }
    }
    // Fallback: clinic investigation instrument result-only fields
    if (tryptases.length === 0) {
      biochemTryptaseIndices.forEach(idx => {
        const val = row[idx]?.trim();
        if (val) tryptases.push({ result: val });
      });
    }
    if (tryptases.length > 0) p.history.tryptases = tryptases;

    // Extract Testing Plan (explicit REDCap instrument)
    if (testingPlanDrugMap.length > 0) {
      const planDrugs: string[] = [];
      testingPlanDrugMap.forEach(entry => {
        const val = row[entry.columnIndex]?.trim().toLowerCase();
        if (['checked', '1', 'yes'].includes(val)) {
          planDrugs.push(...entry.dreamNames);
        }
      });
      if (planDrugs.length > 0) p.history.testingPlan = planDrugs;

      const customText = testingPlanCustomIdx !== -1 ? row[testingPlanCustomIdx]?.trim() : '';
      if (customText) p.history.testingPlanCustom = customText;

      const docs: { tryptases?: boolean; anaestheticChart?: boolean; other?: boolean; otherText?: string } = {};
      let hasDocs = false;
      docsToChaseMap.forEach(entry => {
        const val = row[entry.columnIndex]?.trim().toLowerCase();
        if (['checked', '1', 'yes'].includes(val)) {
          docs[entry.key] = true;
          hasDocs = true;
        }
      });
      if (docsToChaseOtherTextIdx !== -1 && row[docsToChaseOtherTextIdx]?.trim()) {
        docs.otherText = row[docsToChaseOtherTextIdx].trim();
        hasDocs = true;
      }
      if (hasDocs) p.history.documentsToChase = docs;
    }

    p.history.medications?.sort((a, b) => {
        const timeA = a.includes('@') ? a.split('@')[1].trim() : '99:99';
        const timeB = b.includes('@') ? b.split('@')[1].trim() : '99:99';
        return timeA.localeCompare(timeB);
    });

    data.push(p);
  }

  // Add parsing details to the result
  const details: string[] = [];
  if (skippedRows.length > 0) {
      details.push(`Skipped ${skippedRows.length} empty or malformed row(s): ${skippedRows.slice(0, 5).join(', ')}${skippedRows.length > 5 ? '...' : ''}`);
  }
  if (parsingErrors.length > 0) {
      details.push(...parsingErrors);
  }

  return { success: true, data, details: details.length > 0 ? details : undefined };
};
