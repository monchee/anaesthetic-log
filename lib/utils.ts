
import { DrugTestRow, LogFormData, Patient } from '../types';
import { FLAT_DRUG_OPTIONS } from './constants';

// --- Helper Functions ---

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
    if (g.includes("GRADE IV") || g.includes("CARDIAC ARREST") || g === "4") return "grade4";
    if (g.includes("GRADE III") || g.includes("LIFE THREATENING") || g === "3") return "grade3";
    if (g.includes("GRADE II") || g.includes("MODERATE") || g === "2") return "grade2";
    if (g.includes("GRADE I") || g.includes("CUTANEOUS") || g === "1") return "grade1";
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

const normalizeTime = (timeStr: string): string => {
    if (!timeStr) return "";
    const cleanStr = timeStr.trim();
    
    // Check for HH:MM:SS
    let match = cleanStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
    if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
    
    // Check for HHMM
    match = cleanStr.match(/^(\d{2})(\d{2})$/);
    if (match) {
        const h = parseInt(match[1]);
        const m = parseInt(match[2]);
        if (h < 24 && m < 60) return `${match[1]}:${match[2]}`;
    }

    return cleanStr; // Return as is if we can't strictly parse, to preserve data
};

// Map Drug Names (from 'choice=...') to possible Time Column prefixes/substrings
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
    'Cephazolin': ['Cephazolin', 'Cefazolin'],
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

export const parseRedcapCSV = (csvText: string): CsvParseResult => {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { success: false, data: [], error: "Empty or invalid CSV." };
  
  const headers = splitCSVLine(lines[0]);
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
      else if (header === 'Provider Number:') colIndices['providerNumber'] = idx;
      else if (header === 'Email Address:') colIndices['referringEmail'] = idx;
      else if (header === 'Phone Number:') colIndices['referringPhone'] = idx;
      else if (header.includes('Severity of Allergic Reaction')) colIndices['grade'] = idx;
      else if (header.includes('Write a brief summary')) colIndices['summary'] = idx;
      else if (header.includes('Comment')) colIndices['comments'] = idx;
      else if (header === 'Outcome?') colIndices['outcome'] = idx;
      else if (header === 'What was first symptom noticed?') colIndices['firstSymptom'] = idx;
      else if (header === 'What was predominant symptom?') colIndices['predominantSymptom'] = idx;
  });

  // --- 2. Map Symptoms & Treatments ---
  interface SymptomMapConfig {
      key: string;
      label: string;
      detailKey?: string;
      detailCheckboxes?: string[];
  }

  const symptomConfigs: SymptomMapConfig[] = [
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

  const symptomMap: { 
      label: string, 
      boolIndex: number, 
      textIndex?: number, 
      checkboxIndices?: { label: string, index: number }[] 
  }[] = [];

  // Config for Treatments
  const treatmentConfigs = [
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

  const treatmentMap: { label: string, index: number }[] = [];

  symptomConfigs.forEach(conf => {
      const boolIdx = headers.findIndex(h => h.trim() === conf.key);
      const textIdx = conf.detailKey ? headers.findIndex(h => h.trim() === conf.detailKey) : -1;
      
      const checkboxIndices: { label: string, index: number }[] = [];
      if (conf.detailCheckboxes) {
          conf.detailCheckboxes.forEach(cbLabel => {
              // Look for header that contains the label, usually in the format like "Bronchospasm (choice=Mild Wheeze)" or just "Mild Wheeze"
              const cbIdx = headers.findIndex(h => h.includes(cbLabel) && (h.includes(conf.key) || h.includes(conf.key.split('/')[0])));
              if (cbIdx !== -1) {
                  checkboxIndices.push({ label: cbLabel, index: cbIdx });
              } else {
                  // Fallback: search just by label if unique enough
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

  treatmentConfigs.forEach(conf => {
      const idx = headers.findIndex(h => h.includes(conf.key));
      if (idx !== -1) {
          treatmentMap.push({ label: conf.label, index: idx });
      }
  });

  // --- 3. Map Drug Checkboxes & Timings ---
  interface DrugMapping {
      name: string;
      checkIndex: number;
      timeIndex: number;
  }
  
  const drugMap: DrugMapping[] = [];

  headers.forEach((h, idx) => {
      const match = h.match(/\(choice=(.+)\)/);
      if (match) {
          const drugName = match[1].trim();
          if (h.includes('Relevant Conditions') || h.includes('Patient Taking') || h.includes('acknowledge')) return;

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

          // Fallbacks for shared time columns
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
  const otherDrugColumns: { nameIndex: number, timeIndex: number, label: string }[] = [
      { label: 'Other Opioid', nameIndex: -1, timeIndex: -1 },
      { label: 'Other NMB', nameIndex: -1, timeIndex: -1 },
      { label: 'Other abs', nameIndex: -1, timeIndex: -1 },
      { label: 'Anti-emetic Other', nameIndex: -1, timeIndex: -1 },
      { label: 'Steroid Other', nameIndex: -1, timeIndex: -1 },
      { label: 'Other Non-Opioid', nameIndex: -1, timeIndex: -1 },
      { label: 'Local Other', nameIndex: -1, timeIndex: -1 },
      { label: 'Fluids Other', nameIndex: -1, timeIndex: -1 }
  ];

  otherDrugColumns.forEach(config => {
      config.nameIndex = headers.findIndex(h => h.trim() === config.label);
      if (config.nameIndex !== -1) {
          for (let i = config.nameIndex + 1; i < headers.length && i < config.nameIndex + 5; i++) {
              if (headers[i].includes('Time') && (headers[i].includes('Other') || headers[i].includes(' - Time'))) {
                  config.timeIndex = i;
                  break;
              }
          }
      }
  });

  const genericOtherIndex = headers.findIndex(h => h.includes('Other Drugs (please specify drug and time'));

  // --- 4b. Map "Agent Name" and "Exposure Time" pairs (New Request) ---
  interface AgentTimePair {
      nameIndex: number;
      timeIndex: number;
  }
  const agentTimePairs: AgentTimePair[] = [];

  headers.forEach((h, idx) => {
      const lowerH = h.toLowerCase();
      // Look for headers that contain "Agent Name" but usually not "Suspected" (which are typically results)
      // and match them with a nearby "Exposure Time"
      if (lowerH.includes('agent name')) {
          let timeIdx = -1;
          // Check up to 5 columns ahead for corresponding time
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

  // --- 5. Process Rows ---
  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVLine(lines[i]);
    if (row.length < 2) continue;

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
            providerNumber: getVal('providerNumber'),
            referringEmail: getVal('referringEmail'),
            referringPhone: getVal('referringPhone'),
            inductionTime: normalizeTime(getVal('inductionTime')),
            reactionTime: normalizeTime(getVal('reactionTime')),
            procedureOutcome: getVal('outcome'),
            firstSymptom: getVal('firstSymptom'),
            predominantSymptom: getVal('predominantSymptom'),
            medications: [],
            symptoms: [],
            treatment: [],
            suspectedAgents: []
        }
    };

    // Extract Symptoms
    symptomMap.forEach(s => {
        let isPresent = false;
        let detailParts: string[] = [];

        // Check boolean column
        if (s.boolIndex !== -1) {
            const val = row[s.boolIndex]?.trim().toLowerCase();
            if (['checked', 'yes', 'true', '1'].includes(val)) {
                isPresent = true;
            }
        }

        // Check checkbox detail columns
        if (s.checkboxIndices) {
            s.checkboxIndices.forEach(cb => {
                const val = row[cb.index]?.trim().toLowerCase();
                if (['checked', 'yes', 'true', '1'].includes(val)) {
                    detailParts.push(cb.label);
                    isPresent = true; // Implicit presence if detail is checked
                }
            });
        }

        // Check text detail column
        if (s.textIndex !== undefined && row[s.textIndex]) {
            const textVal = row[s.textIndex].trim();
            if (textVal) {
                detailParts.push(textVal);
                // If we have text detail, imply presence if not already checked (often the case with REDCap branching logic)
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

    // Extract Medications
    drugMap.forEach(d => {
        const checkVal = row[d.checkIndex]?.trim().toLowerCase();
        if (checkVal === 'checked') {
            let entry = d.name;
            if (d.timeIndex !== -1 && row[d.timeIndex]) {
                const time = normalizeTime(row[d.timeIndex]);
                if (time) entry += ` @ ${time}`;
            }
            p.history.medications?.push(entry);
        }
    });

    otherDrugColumns.forEach(d => {
        if (d.nameIndex !== -1 && row[d.nameIndex]) {
            const name = row[d.nameIndex].trim();
            if (name && name.toLowerCase() !== 'unchecked') {
                let entry = name;
                if (d.timeIndex !== -1 && row[d.timeIndex]) {
                    const time = normalizeTime(row[d.timeIndex]);
                    if (time) entry += ` @ ${time}`;
                }
                p.history.medications?.push(entry);
            }
        }
    });

    // Process generic other free text
    if (genericOtherIndex !== -1 && row[genericOtherIndex]) {
        const val = row[genericOtherIndex].trim();
        if (val) p.history.medications?.push(val);
    }

    // Process Agent/Time pairs
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

    p.history.medications?.sort((a, b) => {
        const timeA = a.includes('@') ? a.split('@')[1].trim() : '99:99';
        const timeB = b.includes('@') ? b.split('@')[1].trim() : '99:99';
        return timeA.localeCompare(timeB);
    });

    data.push(p);
  }

  return { success: true, data };
};
