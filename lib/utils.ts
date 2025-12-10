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

const normalizeTime = (timeStr: string): string => {
    if (!timeStr) return "";
    // Handle "2024-04-24 12:00:50" -> extract 12:00
    const dateTimeMatch = timeStr.match(/\d{4}-\d{2}-\d{2}\s+(\d{1,2}):(\d{2})/);
    if (dateTimeMatch) return `${dateTimeMatch[1].padStart(2, '0')}:${dateTimeMatch[2]}`;

    const cleanStr = timeStr.includes('@') ? timeStr.split('@')[1] : timeStr;
    const isoMatch = cleanStr.match(/\s(\d{1,2})[:.](\d{2})/);
    if (isoMatch) return `${isoMatch[1].padStart(2, '0')}:${isoMatch[2].padStart(2, '0')}`;
    
    // HH:MM or HH.MM
    const match = cleanStr.match(/^(\d{1,2})[:.](\d{2})/);
    if (match) return `${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}`;
    
    // HHMM
    const strictFourDigit = cleanStr.trim().match(/^(\d{2})(\d{2})$/);
    if (strictFourDigit && parseInt(strictFourDigit[1]) < 24 && parseInt(strictFourDigit[2]) < 60) {
         return `${strictFourDigit[1]}:${strictFourDigit[2]}`;
    }
    return "";
};

// Extensive mapping for Drug Headers -> Canonical Names
// Includes both Text Labels (e.g. 'propofol') and Raw Variable Codes (e.g. 'hypnotics___4')
const DRUG_HEADER_MAP: Record<string, string> = {
    // Label-based mappings (partial matches)
    'propofol': 'Propofol', 'midaz': 'Midazolam', 'fent': 'Fentanyl', 'remi': 'Remifentanil',
    'sux': 'Suxamethonium', 'roc': 'Rocuronium', 'vec': 'Vecuronium', 'cis': 'Cisatracurium',
    'atr': 'Atracurium', 'pancuron': 'Pancuronium', 'miva': 'Mivacurium',
    'morphine': 'Morphine', 'oxycodon': 'Oxycodone', 'alfentanil': 'Alfentanil',
    'ketamine': 'Ketamine', 'thiopent': 'Thiopentone',
    'sugamma': 'Sugammadex', 'neostig': 'Neostigmine', 'atropine': 'Atropine', 'glycopyr': 'Glycopyrrolate',
    'cefazolin': 'Cefazolin', 'cephazoli': 'Cefazolin', 'gentamic': 'Gentamicin', 
    'amoxicill': 'Amoxicillin', 'ampicilli': 'Ampicillin', 'benzylpen': 'Benzylpenicillin',
    'cefotaxim': 'Cefotaxime', 'ceftazid': 'Ceftazidime', 'ceftriax': 'Ceftriaxone', 'cephaloth': 'Cephalothin',
    'ciproflox': 'Ciprofloxacin', 'flucoxacil': 'Flucloxacillin', 'meropena': 'Meropenem', 
    'metronida': 'Metronidazole', 'tazocin': 'Tazocin', 'teicoplan': 'Teicoplanin', 'vancomyc': 'Vancomycin',
    'metoclopr': 'Metoclopramide', 'ondanset': 'Ondansetron', 'cyclizine': 'Cyclizine', 'dexametha': 'Dexamethasone', 'dexmetha': 'Dexamethasone',
    'chlorhex': 'Chlorhexidine', 'betadine': 'Betadine',
    'lignocain': 'Lignocaine', 'bupivacai': 'Bupivacaine', 'ropivacai': 'Ropivacaine', 'mepivacai': 'Mepivacaine', 'prilocain': 'Prilocaine',
    'parecoxib': 'Parecoxib', 'paracetam': 'Paracetamol', 'tramadol': 'Tramadol', 'ibuprofen': 'Ibuprofen',
    'albumin': 'Albumin', 'patent blu': 'Patent Blue', 'ultravist': 'Ultravist', 'omnipaqu': 'Omnipaque', 'iodinated': 'Contrast',
    'heparin': 'Heparin', 'protamine': 'Protamine', 'tirofiban': 'Tirofiban', 'txa': 'Tranexamic Acid',
    'latex': 'Latex', 'gelofusine': 'Gelofusine',

    // Raw Variable Code mappings (Exact matches required)
    'hypnotics___4': 'Propofol',
    'hypnotics___2': 'Midazolam',
    'hypnotics___1': 'Thiopentone',
    'opioids___2': 'Fentanyl',
    'opioids___5': 'Remifentanil',
    'opioids___3': 'Alfentanil',
    'opioids___4': 'Morphine',
    'opioids___7': 'Oxycodone',
    'nmba___1': 'Suxamethonium',
    'nmba___2': 'Rocuronium',
    'nmba___3': 'Vecuronium',
    'nmba___4': 'Atracurium',
    'nmba___5': 'Cisatracurium',
    'nmba___6': 'Mivacurium',
    'nmba___7': 'Pancuronium',
    'nmba_reversal___1': 'Sugammadex',
    'nmba_reversal___2': 'Neostigmine',
    'iv_abs___1': 'Cefazolin',
    'iv_abs___10': 'Gentamicin',
    'iv_abs___14': 'Metronidazole',
    'iv_abs___17': 'Vancomycin',
    'iv_abs___16': 'Teicoplanin',
    'antiemetic___1': 'Dexamethasone',
    'antiemetic___2': 'Ondansetron',
    'local___5': 'Lignocaine',
    'dyes___1': 'Patent Blue',
    'dyes___2': 'Methylene Blue',
    'agents___1': 'Rocuronium (Suspected)', 
    'agents___2': 'Cefazolin (Suspected)',
    'agents___3': 'Chlorhexidine (Suspected)',
    'agents___4': 'Patent Blue (Suspected)',
    'agents___5': 'Suxamethonium (Suspected)',
    'agents___6': 'Atracurium (Suspected)',
    'agents___7': 'Vecuronium (Suspected)'
};

const SYMPTOM_MATCHERS = [
    { key: 'Hypotension', terms: ['hypotensi'] },
    { key: 'Tachycardia', terms: ['tachycar'] },
    { key: 'Bradycardia', terms: ['bradycar'] },
    { key: 'Cardiac Arrest', terms: ['cardiac a', 'arrest'] },
    { key: 'Bronchospasm', terms: ['bronchos'] },
    { key: 'Desaturation', terms: ['low oxyge', 'desat'] },
    { key: 'Flushing', terms: ['flushing'] },
    { key: 'Urticaria', terms: ['urticaria', 'uticaria'] },
    { key: 'Angioedema', terms: ['angioeder', 'swelling', 'oedema'] },
    { key: 'Rash', terms: ['rash'] },
    { key: 'Arrhythmia', terms: ['arrhythmi'] },
    { key: 'Cough', terms: ['cough'] },
    { key: 'Gastrointestinal', terms: ['gastrointe', 'vomiting'] }
];

const TREATMENT_MATCHERS = [
    { key: 'Adrenaline', terms: ['adrenalin'] },
    { key: 'Fluids', terms: ['iv fluids f', 'fluids'] },
    { key: 'CPR', terms: ['cardiac c', 'compressions'] },
    { key: 'Cardioversion', terms: ['cardiover'] },
    { key: 'Vasopressors', terms: ['vasopress', 'metaraminol', 'ephedrine'] },
    { key: 'Steroids', terms: ['steroids', 'hydrocortisone'] },
    { key: 'Antihistamines', terms: ['antihistan'] },
    { key: 'Bronchodilators', terms: ['salbutamol'] }
];

export const parseRedcapCSV = (csvText: string): CsvParseResult => {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { success: false, data: [], error: "Empty or invalid CSV." };
  
  const headers = splitCSVLine(lines[0]);
  const data: Patient[] = [];

  // Dynamic Header Mapping
  const colMap = new Map<number, { type: 'drug'|'symptom'|'treatment'|'suspected'|'info', key: string, isTime?: boolean }>();

  // Helper to check for specific substrings in headers
  const hContains = (h: string, match: string) => h.toLowerCase().includes(match.toLowerCase());

  headers.forEach((h, idx) => {
     const header = h.toLowerCase().trim();
     
     // 1. Info Columns (Robust Matching including Raw Headers)
     if (h === 'record_id' || hContains(header, 'record_id') || header === 'id') { colMap.set(idx, { type: 'info', key: 'id' }); return; }
     if (h === 'first_name' || hContains(header, 'first name') || hContains(header, 'firstname')) { colMap.set(idx, { type: 'info', key: 'first_name' }); return; }
     if (h === 'last_name' || hContains(header, 'last name') || hContains(header, 'surname') || hContains(header, 'lastname')) { colMap.set(idx, { type: 'info', key: 'last_name' }); return; }
     if (hContains(header, 'dob') || hContains(header, 'date of birth')) { colMap.set(idx, { type: 'info', key: 'dob' }); return; }
     if (hContains(header, 'gender') || hContains(header, 'sex')) { colMap.set(idx, { type: 'info', key: 'gender' }); return; }
     if (hContains(header, 'city') || hContains(header, 'suburb')) { colMap.set(idx, { type: 'info', key: 'city' }); return; }
     if (hContains(header, 'hospital') || hContains(header, 'location')) { colMap.set(idx, { type: 'info', key: 'hospital' }); return; }
     
     // Dates & Times
     if (h === 'datereaction' || hContains(header, 'date of re') || hContains(header, 'date_reaction')) { colMap.set(idx, { type: 'info', key: 'date' }); return; }
     if (h === 'time_induction' || hContains(header, 'time of in') || hContains(header, 'induction_time')) { colMap.set(idx, { type: 'info', key: 'induction_time' }); return; }
     if (h === 'time_reaction' || hContains(header, 'time reac') || hContains(header, 'reaction_time')) { colMap.set(idx, { type: 'info', key: 'reaction_time' }); return; }
     
     if (hContains(header, 'procedure')) { colMap.set(idx, { type: 'info', key: 'procedure' }); return; }
     
     // Robust Anaesthetist Matching
     // Prioritize specific REDCap variable 'namecompleter' which is often the Anaesthetist name in this dataset
     if (h === 'namecompleter' || hContains(header, 'namecompleter') || hContains(header, 'anaesthetist') || hContains(header, 'completer')) { 
         colMap.set(idx, { type: 'info', key: 'anaesthetist' }); 
         return; 
     }
     
     if (hContains(header, 'grade') || hContains(header, 'severity')) { colMap.set(idx, { type: 'info', key: 'grade' }); return; }
     if (hContains(header, 'summary') || hContains(header, 'comment') || hContains(header, 'description')) { colMap.set(idx, { type: 'info', key: 'summary' }); return; }
     if (hContains(header, 'outcome') || hContains(header, 'abandoned')) { colMap.set(idx, { type: 'info', key: 'outcome' }); return; }

     // 2. Suspected Agents
     if (hContains(header, 'agent nam') || hContains(header, 'suspected agent') || h === 'other_drugs_given' || h === 'other_drugs') {
         colMap.set(idx, { type: 'suspected', key: 'Suspected Agent' });
         return;
     }

     // 3. Symptoms
     for (const s of SYMPTOM_MATCHERS) {
         if (s.terms.some(t => hContains(header, t))) {
             colMap.set(idx, { type: 'symptom', key: s.key });
             return;
         }
     }

     // 4. Treatments
     for (const t of TREATMENT_MATCHERS) {
         if (t.terms.some(m => hContains(header, m))) {
             colMap.set(idx, { type: 'treatment', key: t.key });
             return;
         }
     }

     // 5. Drugs
     // Look for specific timing indicators in the header
     const isTime = hContains(header, 'time') || hContains(header, 'date') || hContains(header, 'start') || hContains(header, '@') || hContains(header, '- tir');
     
     // Check for exact matches in the raw code map (e.g. hypnotics___4)
     if (DRUG_HEADER_MAP[header]) {
         colMap.set(idx, { type: 'drug', key: DRUG_HEADER_MAP[header], isTime: false }); // Checkboxes are untimed by default
         return;
     }

     for (const [alias, canonical] of Object.entries(DRUG_HEADER_MAP)) {
         if (hContains(header, alias)) {
             colMap.set(idx, { type: 'drug', key: canonical, isTime });
             return;
         }
     }
  });

  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVLine(lines[i]);
    if (row.length < 2) continue; // Skip empty rows
    
    // Find ID first
    const idEntry = Array.from(colMap.entries()).find(([_, meta]) => meta.key === 'id');
    const id = idEntry && row[idEntry[0]] ? row[idEntry[0]] : `REC-${i}`; // Fallback ID if missing

    const p: any = { 
        id, 
        history: { 
            symptoms: [], 
            treatment: [], 
            suspectedAgents: [], 
            medications: [], // Unified list
            preInductionDrugs: [], 
            postInductionDrugs: [],
            grade: 'Ungraded', 
            procedureOutcome: 'Unknown',
            reactionSummary: '',
            procedure: 'Unknown',
            anaesthetist: 'Unknown',
            hospital: 'Unknown',
            date: new Date().toISOString() // Fallback date
        } 
    };
    
    // Temp storage
    const foundDrugs: { name: string, time?: string }[] = [];
    const suspected: string[] = [];

    // Check for Name Columns
    const firstNameEntry = Array.from(colMap.entries()).find(([_, meta]) => meta.key === 'first_name');
    const lastNameEntry = Array.from(colMap.entries()).find(([_, meta]) => meta.key === 'last_name');
    
    p.firstName = firstNameEntry && row[firstNameEntry[0]] ? row[firstNameEntry[0]] : 'Patient';
    p.lastName = lastNameEntry && row[lastNameEntry[0]] ? row[lastNameEntry[0]] : id;

    // Parsing Row
    colMap.forEach((meta, idx) => {
        const value = row[idx]?.trim();
        if (!value) return;

        if (meta.type === 'info') {
            if (meta.key === 'grade') {
                 if (value === '1') p.history.grade = 'Grade I';
                 else if (value === '2') p.history.grade = 'Grade II';
                 else if (value === '3') p.history.grade = 'Grade III';
                 else if (value === '4') p.history.grade = 'Grade IV';
                 else p.history.grade = value;
            } else if (meta.key === 'outcome') {
                 if (value === '1' || value.toLowerCase().includes('abandon')) p.history.procedureOutcome = 'Abandoned';
                 else if (value === '2' || value.toLowerCase().includes('complet')) p.history.procedureOutcome = 'Completed';
                 else p.history.procedureOutcome = value;
            } else if (meta.key === 'gender') {
                 p.gender = value === '0' ? 'Female' : value === '1' ? 'Male' : value;
            } else if (meta.key.includes('time')) {
                 p.history[meta.key === 'induction_time' ? 'inductionTime' : 'reactionTime'] = normalizeTime(value);
            } else if (meta.key === 'summary') {
                 p.history.reactionSummary = value;
            } else if (meta.key === 'date') {
                 // Try to normalize date format if needed
                 p.history.date = value;
            } else if (meta.key === 'dob') {
                 p.dob = value;
            } else if (meta.key === 'city') {
                 p.city = value;
            } else if (meta.key === 'hospital') {
                 p.history.hospital = value;
            } else if (meta.key === 'procedure') {
                 p.history.procedure = value;
            } else if (meta.key === 'anaesthetist') {
                 p.history.anaesthetist = value;
            }
        } else if (meta.type === 'suspected') {
            if (value && value !== '0' && !suspected.includes(value)) suspected.push(value);
        } else if (meta.type === 'symptom') {
            if (value === '1' || value.toLowerCase().includes('checked') || value.toLowerCase() === 'yes') {
                if (!p.history.symptoms.includes(meta.key)) p.history.symptoms.push(meta.key);
            }
        } else if (meta.type === 'treatment') {
            if (value === '1' || value.toLowerCase().includes('checked') || value.toLowerCase() === 'yes') {
                if (!p.history.treatment.includes(meta.key)) p.history.treatment.push(meta.key);
            }
        } else if (meta.type === 'drug') {
            // Drug Parsing
            // If it's a suspected agent column (mapped via agents___X), add to suspected list instead of medications
            if (meta.key.includes('(Suspected)')) {
                if (value === '1' || value.toLowerCase() === 'yes') {
                    const agentName = meta.key.replace(' (Suspected)', '');
                    if (!suspected.includes(agentName)) suspected.push(agentName);
                }
            } else {
                if (meta.isTime) {
                    const normTime = normalizeTime(value);
                    if (normTime) {
                        foundDrugs.push({ name: meta.key, time: normTime });
                    }
                } else {
                    if (value === '1' || value.toLowerCase().includes('checked') || value.toLowerCase() === 'yes') {
                        foundDrugs.push({ name: meta.key }); // Untimed
                    }
                }
            }
        }
    });

    // Post-process drugs for timeline - Unified List
    const uniqueDrugs = new Map<string, string | undefined>();
    foundDrugs.forEach(d => {
        // Prefer entries with time
        if (!uniqueDrugs.has(d.name) || (d.time && !uniqueDrugs.get(d.name))) {
            uniqueDrugs.set(d.name, d.time);
        }
    });

    uniqueDrugs.forEach((time, name) => {
        const entry = time ? `${name} @ ${time}` : name;
        p.history.medications.push(entry);
    });

    p.history.medications.sort();
    p.history.suspectedAgents = suspected.length > 0 ? suspected : [];
    
    // Fallbacks
    if (!p.mrn) p.mrn = id;
    
    data.push(p as Patient);
  }

  return { success: true, data };
};