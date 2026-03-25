import type { DrugProtocol, IDTStep, ChallengeStep } from '@features/testing/types';

// Compact helpers for readability
const s = (ratio: string, concentration: string): IDTStep => ({ ratio, concentration });
const c = (step: number, dose: string, volume: string, cumulative: string): ChallengeStep => ({ step, dose, volume, cumulative });

export const DRUG_MASTERLIST: DrugProtocol[] = [
  // ── MUSCLE RELAXANTS ──────────────────────────────────────────────────────
  {
    drugName: 'Cis-atracurium', category: 'Muscle Relaxants', testType: 'skin',
    presentation: '5mg/2.5mL', sptNeatConcentration: 'Neat (2mg/mL)',
    idtSteps: [s('1:1,000', '0.002mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Rocuronium', category: 'Muscle Relaxants', testType: 'skin',
    presentation: '50mg/5mL', sptNeatConcentration: 'Neat (10mg/mL)',
    idtSteps: [s('1:1,000', '0.01mg/mL'), s('1:100', '0.1mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Pancuronium', category: 'Muscle Relaxants', testType: 'skin',
    presentation: '4mg/2mL', sptNeatConcentration: 'Neat (2mg/mL)',
    idtSteps: [s('1:1,000', '0.002mg/mL'), s('1:100', '0.02mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Vecuronium', category: 'Muscle Relaxants', testType: 'skin',
    presentation: '10mg', sptNeatConcentration: 'Neat (4mg/mL)',
    idtSteps: [s('1:1,000', '0.004mg/mL'), s('1:100', '0.04mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Suxamethonium', category: 'Muscle Relaxants', testType: 'skin',
    presentation: '100mg/2mL', sptNeatConcentration: '1:5 (10mg/mL)',
    idtSteps: [s('1:50,000', '0.001mg/mL'), s('1:5,000', '0.01mg/mL'), s('1:500', '0.1mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },

  // ── REVERSAL AGENTS ───────────────────────────────────────────────────────
  {
    drugName: 'Sugammadex', category: 'Reversal Agents', testType: 'skin',
    presentation: '200mg/2mL', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:1,000', '0.1mg/mL'), s('1:100', '1mg/mL')],
    challengeSteps: [], protocolLabel: 'Alone',
  },
  {
    drugName: 'Sugammadex', category: 'Reversal Agents', testType: 'skin',
    presentation: 'Mix with Rocuronium 1:1', sptNeatConcentration: 'Neat (100mg/10mg/mL)',
    idtSteps: [s('1:1,000', '0.1mg/0.01mg/mL'), s('1:100', '1mg/0.1mg/mL')],
    challengeSteps: [], protocolLabel: '+ Rocuronium',
  },

  // ── PENICILLINS ───────────────────────────────────────────────────────────
  {
    drugName: 'Penicillin Major', category: 'Penicillins', testType: 'skin',
    presentation: 'PPL', sptNeatConcentration: 'Neat (0.04mg/20.00mg/mL)',
    idtSteps: [s('1:10', '0.004mg/2mg'), s('Neat', '0.04mg/20.00mg')],
    challengeSteps: [], protocolLabel: 'PPL',
  },
  {
    drugName: 'Penicillin Minor', category: 'Penicillins', testType: 'skin',
    presentation: 'MD (Sodium Benzylpenilloate/Mannitol)', sptNeatConcentration: 'Neat (0.50mg/20.00mg/mL)',
    idtSteps: [s('1:10', '0.05mg/2.00mg'), s('Neat', '0.50mg/20.00mg')],
    challengeSteps: [], protocolLabel: 'MD',
  },
  {
    drugName: 'Ampicillin', category: 'Penicillins', testType: 'skin',
    presentation: '1g', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:100', '1mg/mL'), s('1:10', '10mg/mL'), s('1:50', '2mg/0.2mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1 (Neat)',
  },
  {
    drugName: 'Ampicillin', category: 'Penicillins', testType: 'skin',
    presentation: '1g', sptNeatConcentration: '1:5 (20mg/mL)',
    idtSteps: [s('1:10', '10mg/mL'), s('1:5', '20mg/mL'), s('1:100', '0.06mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2 (1:5)',
  },
  {
    drugName: 'Ampicillin', category: 'Penicillins', testType: 'control',
    presentation: '1g', sptNeatConcentration: '1:5 (20mg/mL)',
    idtSteps: [s('1:10', '10mg/mL'), s('1:5', '20mg/mL'), s('1:100', '0.02mg/mL')],
    challengeSteps: [], protocolLabel: 'Control',
  },
  {
    drugName: 'Amoxycillin', category: 'Penicillins', testType: 'skin',
    presentation: '1g', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:100', '1mg/mL'), s('1:10', '10mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1 (Neat)',
  },
  {
    drugName: 'Amoxycillin', category: 'Penicillins', testType: 'skin',
    presentation: '1g', sptNeatConcentration: '1:5 (20mg/mL)',
    idtSteps: [s('1:10', '10mg/mL'), s('1:5', '20mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2 (1:5)',
  },
  {
    drugName: 'Benzylpenicillin', category: 'Penicillins', testType: 'skin',
    presentation: '600mg', sptNeatConcentration: 'Neat (6mg/mL)',
    idtSteps: [s('1:100', '0.06mg/mL'), s('1:10', '0.6mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1',
  },
  {
    drugName: 'Benzylpenicillin', category: 'Penicillins', testType: 'skin',
    presentation: '600mg', sptNeatConcentration: 'Neat (6mg/mL)',
    idtSteps: [s('1:100', '0.06mg/mL'), s('1:10', '0.6mg/mL'), s('1:50', '2mg/0.2mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2',
  },
  {
    drugName: 'Benzylpenicillin', category: 'Penicillins', testType: 'control',
    presentation: '600mg', sptNeatConcentration: 'Neat (6mg/mL)',
    idtSteps: [s('1:100', '0.06mg/mL'), s('1:10', '0.6mg/mL')],
    challengeSteps: [], protocolLabel: 'Control',
  },
  {
    drugName: 'Augmentin', category: 'Penicillins', testType: 'skin',
    presentation: '2000mg/200mg', sptNeatConcentration: '1:5 (20mg/2mg/mL)',
    idtSteps: [s('1:50', '2mg/0.2mg/mL'), s('1:5', '20mg/2mg/mL'), s('1:100', '0.06mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1',
  },
  {
    drugName: 'Augmentin', category: 'Penicillins', testType: 'skin',
    presentation: '2000mg/200mg', sptNeatConcentration: '1:5 (20mg/2mg/mL)',
    idtSteps: [s('1:50', '2mg/0.2mg/mL'), s('1:5', '20mg/2mg/mL'), s('1:100', '0.2mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2',
  },
  {
    drugName: 'Cephalexin', category: 'Penicillins', testType: 'skin',
    presentation: '2mg/mL', sptNeatConcentration: 'Neat (2mg/mL)',
    idtSteps: [s('1:100', '0.02mg/mL'), s('1:10', '0.2mg/mL'), s('Neat', '2mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Tazocin', category: 'Penicillins', testType: 'skin',
    presentation: '4g/500mg', sptNeatConcentration: '1:10 (20/2mg/mL)',
    idtSteps: [s('1:100', '2/0.2mg/mL'), s('1:10', '20/2mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Methoxybenzylpenicillin', category: 'Penicillins', testType: 'skin',
    presentation: '', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [], protocolLabel: '',
  },

  // ── CEPHALOSPORINS ────────────────────────────────────────────────────────
  {
    drugName: 'Cefazolin', category: 'Cephalosporins', testType: 'skin',
    presentation: '1g', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:100', '1mg/mL'), s('1:10', '10mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Cefepime', category: 'Cephalosporins', testType: 'skin',
    presentation: '1g', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:100', '1mg/mL'), s('1:10', '10mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Cefotaxime', category: 'Cephalosporins', testType: 'skin',
    presentation: '1g', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:100', '1mg/mL'), s('1:10', '10mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Ceftazidime', category: 'Cephalosporins', testType: 'skin',
    presentation: '2g', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:100', '1mg/mL'), s('1:10', '10mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Ceftriaxone', category: 'Cephalosporins', testType: 'skin',
    presentation: '1g', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:100', '1mg/mL'), s('1:10', '10mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Cefuroxime', category: 'Cephalosporins', testType: 'skin',
    presentation: '750mg', sptNeatConcentration: 'Neat (29mg/mL)',
    idtSteps: [s('1:100', '0.29mg/mL'), s('1:10', '2.9mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },

  // ── HYPNOTICS ─────────────────────────────────────────────────────────────
  {
    drugName: 'Midazolam', category: 'Hypnotics', testType: 'skin',
    presentation: '1mg/mL', sptNeatConcentration: 'Neat (1mg/mL)',
    idtSteps: [s('1:100', '0.01mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Propofol', category: 'Hypnotics', testType: 'skin',
    presentation: '10mg/mL', sptNeatConcentration: 'Neat (10mg/mL)',
    idtSteps: [s('1:1,000', '0.01mg/mL'), s('1:100', '0.1mg/mL'), s('1:10', '1mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1',
  },
  {
    drugName: 'Propofol', category: 'Hypnotics', testType: 'skin',
    presentation: '10mg/mL', sptNeatConcentration: 'Neat (10mg/mL)',
    idtSteps: [s('1:1,000', '0.01mg/mL'), s('1:100', '0.1mg/mL'), s('1:10', '1mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2',
  },
  {
    drugName: 'Ketamine', category: 'Hypnotics', testType: 'skin',
    presentation: '100mg/mL', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:1,000', '0.1mg/mL'), s('1:100', '1mg/mL'), s('1:10', '10mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1',
  },
  {
    drugName: 'Ketamine', category: 'Hypnotics', testType: 'skin',
    presentation: '100mg/mL', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:1,000', '0.1mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2',
  },
  {
    drugName: 'Thiopental', category: 'Hypnotics', testType: 'skin',
    presentation: '25mg/mL', sptNeatConcentration: 'Neat (25mg/mL)',
    idtSteps: [s('1:1,000', '0.025mg/mL'), s('1:100', '0.25mg/mL'), s('1:10', '2.5mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1',
  },
  {
    drugName: 'Thiopental', category: 'Hypnotics', testType: 'skin',
    presentation: '25mg/mL', sptNeatConcentration: 'Neat (25mg/mL)',
    idtSteps: [s('1:1,000', '0.025mg/mL'), s('1:100', '0.25mg/mL'), s('1:10', '2.5mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2',
  },

  // ── LOCAL ANAESTHETICS ────────────────────────────────────────────────────
  {
    drugName: 'Lignocaine', category: 'Local Anaesthetics', testType: 'skin',
    presentation: '50mg/5mL', sptNeatConcentration: 'Neat (10mg/mL)',
    idtSteps: [s('1:1,000', '0.01mg/mL'), s('1:100', '0.1mg/mL'), s('1:10', '1mg/mL'), s('Neat', '10mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Mepivacaine', category: 'Local Anaesthetics', testType: 'skin',
    presentation: '66mg/2.2mL', sptNeatConcentration: 'Neat (10mg/mL)',
    idtSteps: [s('1:1,000', '0.01mg/mL'), s('1:100', '0.1mg/mL'), s('1:10', '1mg/mL'), s('Neat', '10mg/mL')],
    challengeSteps: [], protocolLabel: 'Epidural',
  },
  {
    drugName: 'Bupivacaine', category: 'Local Anaesthetics', testType: 'skin',
    presentation: '50mg/20mL (Epidural)', sptNeatConcentration: 'Neat (2.5mg/mL)',
    idtSteps: [s('1:1,000', '0.0025mg/mL'), s('1:100', '0.025mg/mL'), s('1:10', '0.25mg/mL'), s('Neat', '2.5mg/mL')],
    challengeSteps: [], protocolLabel: 'Epidural',
  },
  {
    drugName: 'Ropivacaine', category: 'Local Anaesthetics', testType: 'skin',
    presentation: '40mg/20mL', sptNeatConcentration: 'Neat (2mg/mL)',
    idtSteps: [s('1:1,000', '0.002mg/mL'), s('1:100', '0.02mg/mL'), s('1:10', '0.2mg/mL'), s('Neat', '2mg/mL')],
    challengeSteps: [], protocolLabel: 'Epidural Protocol 1',
  },
  {
    drugName: 'Ropivacaine', category: 'Local Anaesthetics', testType: 'skin',
    presentation: '40mg/20mL', sptNeatConcentration: 'Neat (2mg/mL)',
    idtSteps: [s('1:10', '0.2mg/mL'), s('Neat', '2mg/mL')],
    challengeSteps: [], protocolLabel: 'Epidural Protocol 2',
  },

  // ── OPIOIDS ───────────────────────────────────────────────────────────────
  {
    drugName: 'Alfentanil', category: 'Opioids', testType: 'skin',
    presentation: '1mg/2mL', sptNeatConcentration: 'Neat (0.5mg/mL)',
    idtSteps: [s('1:100', '0.005mg/mL'), s('1:10', '0.05mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Fentanyl', category: 'Opioids', testType: 'skin',
    presentation: '100mcg/2mL', sptNeatConcentration: 'Neat (0.05mg/mL)',
    idtSteps: [s('1:100', '0.0005mg/mL'), s('1:10', '0.005mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Morphine', category: 'Opioids', testType: 'skin',
    presentation: '10mg/mL', sptNeatConcentration: '1:10 (1mg/mL)',
    idtSteps: [s('1:100,000', '0.0001mg/mL'), s('1:100', '0.0005mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1',
  },
  {
    drugName: 'Morphine', category: 'Opioids', testType: 'skin',
    presentation: '10mg/mL', sptNeatConcentration: '1:10 (1mg/mL)',
    idtSteps: [s('1:100,000', '0.0001mg/mL'), s('1:1,000', '0.01mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2',
  },
  {
    drugName: 'Remifentanil', category: 'Opioids', testType: 'skin',
    presentation: '1mg', sptNeatConcentration: 'Neat (0.05mg/mL)',
    idtSteps: [s('1:100', '0.0005mg/mL'), s('1:10', '0.005mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1',
  },
  {
    drugName: 'Remifentanil', category: 'Opioids', testType: 'skin',
    presentation: '1mg', sptNeatConcentration: 'Neat (0.05mg/mL)',
    idtSteps: [s('1:100', '0.0005mg/mL'), s('1:10', '0.005mg/mL'), s('1:1,000', '0.01mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2',
  },
  {
    drugName: 'Oxycodone', category: 'Opioids', testType: 'skin',
    presentation: '10mg/mL', sptNeatConcentration: 'Neat (10mg/mL)',
    idtSteps: [s('1:1,000', '0.01mg/mL'), s('1:100', '0.1mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },

  // ── ANTISEPTICS ───────────────────────────────────────────────────────────
  {
    drugName: 'Chlorhexidine', category: 'Antiseptics', testType: 'skin',
    presentation: '0.02%', sptNeatConcentration: 'Neat (0.2mg/mL)',
    idtSteps: [s('1:100', '0.002mg/mL')],
    challengeSteps: [], protocolLabel: '0.02%',
  },
  {
    drugName: 'Povidone Iodine', category: 'Antiseptics', testType: 'skin',
    presentation: '10% w/v', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:10,000', '0.01mg/mL'), s('1:1,000', '0.1mg/mL'), s('1:100', '1mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1',
  },
  {
    drugName: 'Povidone Iodine', category: 'Antiseptics', testType: 'skin',
    presentation: '10% w/v', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:10,000', '0.01mg/mL'), s('1:1,000', '0.1mg/mL'), s('1:100', '1mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2',
  },

  // ── PROTON PUMP INHIBITORS ────────────────────────────────────────────────
  {
    drugName: 'Esomeprazole', category: 'Proton Pump Inhibitors', testType: 'skin',
    presentation: '20mg', sptNeatConcentration: 'Neat (20mg/mL)',
    idtSteps: [],
    challengeSteps: [], protocolLabel: '',
  },
  {
    drugName: 'Lansoprazole', category: 'Proton Pump Inhibitors', testType: 'skin',
    presentation: '30mg', sptNeatConcentration: 'Neat (30mg/mL)',
    idtSteps: [],
    challengeSteps: [], protocolLabel: '',
  },
  {
    drugName: 'Omeprazole', category: 'Proton Pump Inhibitors', testType: 'skin',
    presentation: '20mg', sptNeatConcentration: 'Neat (20mg/mL)',
    idtSteps: [],
    challengeSteps: [], protocolLabel: '',
  },
  {
    drugName: 'Pantoprazole', category: 'Proton Pump Inhibitors', testType: 'skin',
    presentation: '40mg', sptNeatConcentration: 'Neat (40mg/mL)',
    idtSteps: [s('1:1,000', '0.04mg/mL'), s('1:100', '0.4mg/mL'), s('1:10', '4mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Rabeprazole', category: 'Proton Pump Inhibitors', testType: 'skin',
    presentation: '40mg', sptNeatConcentration: 'Neat (40mg/mL)',
    idtSteps: [],
    challengeSteps: [], protocolLabel: '',
  },

  // ── OTHERS (skin testing) ─────────────────────────────────────────────────
  {
    drugName: 'Actrapid (Insulin)', category: 'Others', testType: 'skin',
    presentation: '100units/mL', sptNeatConcentration: 'Neat (100 U/mL)',
    idtSteps: [s('1:20', '5U/mL')],
    challengeSteps: [], protocolLabel: 'S/C',
  },
  {
    drugName: 'Azithromycin', category: 'Others', testType: 'skin',
    presentation: '500mg', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:10,000', '0.01mg/mL'), s('1:1,000', '0.1mg/mL'), s('1:10', '15mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Betamethasone', category: 'Others', testType: 'experimental',
    presentation: '5.7mg/mL', sptNeatConcentration: 'Neat (5.7mg/mL)',
    idtSteps: [s('1:100', '0.057mg/mL'), s('1:15', '0.38mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Cefuroxime Suspension', category: 'Others', testType: 'skin',
    presentation: '125mg/5mL', sptNeatConcentration: 'Neat (25mg/mL)',
    idtSteps: [s('1:100', '0.29mg/mL')],
    challengeSteps: [], protocolLabel: 'Suspension',
  },
  {
    drugName: 'Ciprofloxacin', category: 'Others', testType: 'skin',
    presentation: '200mg/100mL', sptNeatConcentration: 'Neat (2mg/mL)',
    idtSteps: [s('1:100', '0.04mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Clindamycin', category: 'Others', testType: 'skin',
    presentation: '300mg/2mL', sptNeatConcentration: 'Neat (150mg/mL)',
    idtSteps: [s('1:10', '15mg/mL'), s('1:1,000', '0.005mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Dalteparin', category: 'Others', testType: 'skin',
    presentation: '10000U/mL', sptNeatConcentration: 'Neat (10000U/mL)',
    idtSteps: [s('1:1,000', '10U/mL'), s('1:100', '100U/mL'), s('1:10', '1000U/mL')],
    challengeSteps: [], protocolLabel: 'SC',
  },
  {
    drugName: 'Dexamethasone', category: 'Others', testType: 'skin',
    presentation: '4mg/mL', sptNeatConcentration: 'Neat (4mg/mL)',
    idtSteps: [s('1:100', '0.04mg/mL'), s('1:10', '0.4mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Doxycycline', category: 'Others', testType: 'skin',
    presentation: '100mg', sptNeatConcentration: 'Neat (10mg/mL)',
    idtSteps: [s('1:10,000', '0.001mg/mL'), s('1:1,000', '0.01mg/mL'), s('1:100', '0.05mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1',
  },
  {
    drugName: 'Doxycycline', category: 'Others', testType: 'skin',
    presentation: '100mg', sptNeatConcentration: 'Neat (10mg/mL)',
    idtSteps: [s('1:10,000', '0.001mg/mL'), s('1:1,000', '0.01mg/mL'), s('1:100', '0.02mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2',
  },
  {
    drugName: 'Droperidol', category: 'Others', testType: 'skin',
    presentation: '10mg/2mL', sptNeatConcentration: 'Neat (5mg/mL)',
    idtSteps: [s('1:1,000', '0.005mg/mL'), s('1:100', '0.05mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Enoxaparin', category: 'Others', testType: 'skin',
    presentation: '100mg/mL', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:1,000', '0.1mg/mL'), s('1:100', '1mg/mL'), s('1:10', '10mg/mL')],
    challengeSteps: [], protocolLabel: 'SC',
  },
  {
    drugName: 'Fluconazole', category: 'Others', testType: 'skin',
    presentation: '100mg/50mL', sptNeatConcentration: '1:10 (0.2mg/mL)',
    idtSteps: [s('1:1,000', '0.002mg/mL'), s('1:100', '0.02mg/mL'), s('1:10', '0.2mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Glycopyrronium', category: 'Others', testType: 'experimental',
    presentation: '200mcg/1mL', sptNeatConcentration: 'Neat (0.2mg/mL)',
    idtSteps: [s('1:1,000', '0.0002mg/mL'), s('1:100', '0.057mg/mL')],
    challengeSteps: [], protocolLabel: '',
  },
  {
    drugName: 'Granisetron', category: 'Others', testType: 'skin',
    presentation: '3mg/3mL', sptNeatConcentration: 'Neat (1mg/mL)',
    idtSteps: [s('1:100', '0.01mg/mL'), s('1:1,000', '0.001mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Heparin', category: 'Others', testType: 'skin',
    presentation: '5000U/mL', sptNeatConcentration: 'Neat (5000U/mL)',
    idtSteps: [s('1:1,000', '5U/mL'), s('1:100', '50U/mL'), s('1:10', '500U/mL')],
    challengeSteps: [], protocolLabel: 'SC',
  },
  {
    drugName: 'Humulin NPH (Insulin)', category: 'Others', testType: 'skin',
    presentation: '100units/mL', sptNeatConcentration: 'Neat (100 U/mL)',
    idtSteps: [s('1:20', '5U/mL')],
    challengeSteps: [], protocolLabel: 'S/C',
  },
  {
    drugName: 'Humulin R (Insulin)', category: 'Others', testType: 'skin',
    presentation: '100units/mL', sptNeatConcentration: 'Neat (100 U/mL)',
    idtSteps: [s('1:20', '5U/mL')],
    challengeSteps: [], protocolLabel: 'S/C',
  },
  {
    drugName: 'Hydrocortisone', category: 'Others', testType: 'experimental',
    presentation: '50mg/mL', sptNeatConcentration: 'Neat (50mg/mL)',
    idtSteps: [s('1:100', '0.50mg/mL'), s('1:10', '5mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Latex', category: 'Others', testType: 'skin',
    presentation: '', sptNeatConcentration: 'Neat',
    idtSteps: [],
    challengeSteps: [], protocolLabel: '',
  },
  {
    drugName: 'Levofloxacin', category: 'Others', testType: 'skin',
    presentation: '500mg', sptNeatConcentration: 'Neat (5mg/mL)',
    idtSteps: [s('1:100', '0.05mg/mL')],
    challengeSteps: [], protocolLabel: 'Tablet',
  },
  {
    drugName: 'Levonorgestrel', category: 'Others', testType: 'skin',
    presentation: '750mcg tablet', sptNeatConcentration: 'Neat',
    idtSteps: [s('1:100', '0.05mg/mL')],
    challengeSteps: [], protocolLabel: 'Oral',
  },
  {
    drugName: 'Medroxyprogesterone', category: 'Others', testType: 'skin',
    presentation: '150mg/1mL', sptNeatConcentration: '1:3 (50mg/mL)',
    idtSteps: [s('1:100', '0.05mg/mL'), s('1:10', '5mg/mL')],
    challengeSteps: [], protocolLabel: 'Inj',
  },
  {
    drugName: 'Metacresol', category: 'Others', testType: 'skin',
    presentation: '1034mg/mL', sptNeatConcentration: '1.5mg/mL',
    idtSteps: [s('1:20', '0.075mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 1',
  },
  {
    drugName: 'Metacresol', category: 'Others', testType: 'skin',
    presentation: '1034mg/mL', sptNeatConcentration: '3mg/mL',
    idtSteps: [s('1:20', '0.15mg/mL')],
    challengeSteps: [], protocolLabel: 'Protocol 2',
  },
  {
    drugName: 'Methylprednisolone', category: 'Others', testType: 'experimental',
    presentation: '1g', sptNeatConcentration: 'Neat (20mg/mL)',
    idtSteps: [s('1:100', '0.2mg/mL'), s('1:10', '2mg/mL'), s('1:1,000', '0.04mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Metoclopramide', category: 'Others', testType: 'skin',
    presentation: '10mg/2mL', sptNeatConcentration: 'Neat (5mg/mL)',
    idtSteps: [s('1:1,000', '0.005mg/mL'), s('1:100', '0.05mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Metronidazole', category: 'Others', testType: 'skin',
    presentation: '500mg/100mL', sptNeatConcentration: 'Neat (5mg/mL)',
    idtSteps: [s('1:100', '0.05mg/mL'), s('1:1,000', '0.025mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Neostigmine', category: 'Others', testType: 'experimental',
    presentation: '2.5mg/1mL', sptNeatConcentration: 'Neat (2.5mg/mL)',
    idtSteps: [s('1:1,000', '0.0025mg/mL'), s('1:100', '0.025mg/mL')],
    challengeSteps: [], protocolLabel: 'Inj',
  },
  {
    drugName: 'Novorapid (Insulin)', category: 'Others', testType: 'skin',
    presentation: '100units/mL', sptNeatConcentration: 'Neat (100 U/mL)',
    idtSteps: [s('1:20', '5U/mL')],
    challengeSteps: [], protocolLabel: 'S/C',
  },
  {
    drugName: 'Omnipaque', category: 'Others', testType: 'skin',
    presentation: '350mg I/mL', sptNeatConcentration: 'Neat',
    idtSteps: [s('1:100', ''), s('1:10', '')],
    challengeSteps: [], protocolLabel: 'IV Contrast',
  },
  {
    drugName: 'Ondansetron', category: 'Others', testType: 'skin',
    presentation: '4mg/2mL', sptNeatConcentration: 'Neat (2mg/mL)',
    idtSteps: [s('1:1,000', '0.002mg/mL'), s('1:100', '0.02mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Optisulin (Insulin)', category: 'Others', testType: 'skin',
    presentation: '100units/mL', sptNeatConcentration: 'Neat (100 U/mL)',
    idtSteps: [s('1:20', '5U/mL')],
    challengeSteps: [], protocolLabel: 'S/C',
  },
  {
    drugName: 'Paracetamol', category: 'Others', testType: 'skin',
    presentation: '1000mg/100mL', sptNeatConcentration: 'Neat (10mg/mL)',
    idtSteps: [s('1:100', '0.1mg/mL'), s('1:10', '1mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Parecoxib', category: 'Others', testType: 'skin',
    presentation: '40mg', sptNeatConcentration: 'Neat (8mg/mL)',
    idtSteps: [s('1:100', '0.08mg/mL'), s('1:1,000', '0.1mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Patent Blue', category: 'Others', testType: 'skin',
    presentation: '50mg/2mL', sptNeatConcentration: 'Neat (25mg/mL)',
    idtSteps: [s('1:1,000', '0.025mg/mL'), s('1:100', '0.25mg/mL')],
    challengeSteps: [], protocolLabel: 'SC',
  },
  {
    drugName: 'Protamine', category: 'Others', testType: 'skin',
    presentation: '50mg/5mL', sptNeatConcentration: 'Neat (10mg/mL)',
    idtSteps: [s('1:1,000', '0.01mg/mL'), s('0.1:20', '0.05mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Protaphane (Insulin)', category: 'Others', testType: 'skin',
    presentation: '100units/mL', sptNeatConcentration: 'Neat (100 U/mL)',
    idtSteps: [s('1:20', '5U/mL')],
    challengeSteps: [], protocolLabel: 'S/C',
  },
  {
    drugName: 'Tranexamic Acid', category: 'Others', testType: 'skin',
    presentation: '500mg/5mL', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:100', '1mg/mL'), s('1:10', '10mg/mL'), s('1:10,000', '0.01mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Tramadol', category: 'Others', testType: 'experimental',
    presentation: '100mg/2mL', sptNeatConcentration: 'Neat (50mg/mL)',
    idtSteps: [s('1:100', '0.5mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Triamcinolone', category: 'Others', testType: 'experimental',
    presentation: '40mg/mL', sptNeatConcentration: '1:10 (4mg/mL)',
    idtSteps: [s('1:1,000', '0.04mg/mL'), s('1:100', '0.4mg/mL'), s('1:10', '4mg/mL')],
    challengeSteps: [], protocolLabel: 'Inj',
  },
  {
    drugName: 'Ultravist', category: 'Others', testType: 'skin',
    presentation: '46.76g/75mL', sptNeatConcentration: 'Neat',
    idtSteps: [s('1:100', ''), s('1:10', '')],
    challengeSteps: [], protocolLabel: 'IV Contrast',
  },
  {
    drugName: 'Ultravist', category: 'Others', testType: 'control',
    presentation: '46.76g/75mL', sptNeatConcentration: 'Neat',
    idtSteps: [s('1:100', ''), s('1:10', '')],
    challengeSteps: [], protocolLabel: 'Control',
  },
  {
    drugName: 'Urografin', category: 'Others', testType: 'skin',
    presentation: '', sptNeatConcentration: 'Neat',
    idtSteps: [s('1:100', ''), s('1:10', '')],
    challengeSteps: [], protocolLabel: 'IV Contrast',
  },
  {
    drugName: 'Vancomycin', category: 'Others', testType: 'skin',
    presentation: '1g', sptNeatConcentration: 'Neat (100mg/mL)',
    idtSteps: [s('1:1,000,000', '0.0001mg/mL'), s('1:100', '0.4mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  {
    drugName: 'Visipaque', category: 'Others', testType: 'skin',
    presentation: '320mg I/mL', sptNeatConcentration: 'Neat',
    idtSteps: [s('1:100', ''), s('1:10', '')],
    challengeSteps: [], protocolLabel: 'IV Contrast',
  },
  {
    drugName: 'Xylocaine', category: 'Others', testType: 'skin',
    presentation: '50mg/5mL', sptNeatConcentration: 'Neat (10mg/mL)',
    idtSteps: [s('1:1,000', '0.01mg/mL'), s('1:100', '0.1mg/mL'), s('1:10', '1mg/mL'), s('Neat', '10mg/mL')],
    challengeSteps: [], protocolLabel: 'IV',
  },
  // Methylene Blue — not in CSV, keep for backwards compat
  {
    drugName: 'Methylene Blue', category: 'Others', testType: 'skin',
    presentation: '', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [], protocolLabel: '',
  },
  // IV Contrast (generic) — not in CSV, keep for backwards compat
  {
    drugName: 'IV Contrast', category: 'Others', testType: 'skin',
    presentation: '', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [], protocolLabel: '',
  },
  // Atropine — not in CSV, keep for backwards compat
  {
    drugName: 'Atropine', category: 'Others', testType: 'skin',
    presentation: '', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [], protocolLabel: '',
  },

  // ── CHALLENGE / DESENSITISATION ───────────────────────────────────────────
  {
    drugName: 'Amoxycillin Suspension', category: 'Others', testType: 'challenge',
    presentation: '125mg/5mL', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [
      c(1, '25mg', '1.0 mL', '25mg'), c(2, '50mg', '2.0 mL', '75mg'),
      c(3, '100mg', '4.0 mL', '175mg'), c(4, '250mg', '10 mL', '425mg'),
    ],
    protocolLabel: 'Oral Graded Challenge',
  },
  {
    drugName: 'Amoxycillin/Clavulanic Acid', category: 'Others', testType: 'challenge',
    presentation: '125mg/31.25mg per 5mL', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [
      c(1, '25mg/6.25mg', '1 mL', '25mg/6.25mg'), c(2, '125mg/31.25mg', '5 mL', '150mg/37.5mg'),
      c(3, '250mg/62.5mg', '10 mL', '400mg/100mg'), c(4, '500mg/125mg', '20 mL', '900mg/225mg'),
    ],
    protocolLabel: 'Oral Graded Challenge',
  },
  {
    drugName: 'Cefazolin', category: 'Cephalosporins', testType: 'challenge',
    presentation: '1g', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [
      c(1, '100mg', '10 mL', '100mg'), c(2, '200mg', '20 mL', '300mg'),
      c(3, '300mg', '30 mL', '600mg'), c(4, '400mg', '40 mL', '1000mg'),
    ],
    protocolLabel: 'IV Challenge',
  },
  {
    drugName: 'Cephalexin', category: 'Penicillins', testType: 'challenge',
    presentation: '125mg/5mL suspension', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [
      c(1, '25mg', '1.0 mL', '25mg'), c(2, '50mg', '2.0 mL', '75mg'),
      c(3, '100mg', '4.0 mL', '175mg'), c(4, '250mg', '10 mL', '425mg'),
    ],
    protocolLabel: 'Oral Graded Challenge',
  },
  {
    drugName: 'Ciprofloxacin', category: 'Others', testType: 'challenge',
    presentation: 'Oral suspension', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [
      c(1, '50mg', '1 mL', '50mg'), c(2, '125mg', '2.5 mL', '175mg'),
      c(3, '250mg', '5 mL', '425mg'), c(4, '500mg', '10 mL', '925mg'),
    ],
    protocolLabel: 'Oral Graded Challenge',
  },
  {
    drugName: 'Doxycycline', category: 'Others', testType: 'challenge',
    presentation: 'Oral', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [
      c(1, '10mg', '', ''), c(2, '25mg', '', ''), c(3, '75mg', '', ''),
    ],
    protocolLabel: 'Oral Graded Challenge',
  },
  {
    drugName: 'Flucloxacillin', category: 'Penicillins', testType: 'challenge',
    presentation: '125mg/5mL suspension', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [
      c(1, '50mg', '2 mL', '50mg'), c(2, '125mg', '5 mL', '175mg'), c(3, '325mg', '13 mL', '500mg'),
    ],
    protocolLabel: 'Oral Graded Challenge',
  },
  {
    drugName: 'Lignocaine', category: 'Local Anaesthetics', testType: 'challenge',
    presentation: '1% 50mg/5mL', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [c(1, '10mg', '1 mL', '')],
    protocolLabel: 'Challenge',
  },
  {
    drugName: 'Meloxicam', category: 'Others', testType: 'challenge',
    presentation: 'Tablet', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [c(1, '2.5mg', '2.5 mL', '2.5mg'), c(2, '5mg', '5 mL', '7.5mg')],
    protocolLabel: 'Graded Challenge',
  },
  {
    drugName: 'Trimethoprim/Sulfamethoxazole', category: 'Others', testType: 'challenge',
    presentation: '40mg/200mg per 5mL suspension', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [
      c(1, '16mg/80mg', '2.0 mL', '16mg/80mg'), c(2, '64mg/320mg', '8.0 mL', '80mg/400mg'),
      c(3, '80mg/400mg', '10.0 mL', '160mg/800mg'),
    ],
    protocolLabel: 'Oral Graded Challenge',
  },
  {
    drugName: 'Trimethoprim', category: 'Others', testType: 'challenge',
    presentation: 'Suspension', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [
      c(1, '20mg', '2 mL', '20mg'), c(2, '100mg', '10 mL', '120mg'), c(3, '200mg', '20 mL', '320mg'),
    ],
    protocolLabel: 'Oral Graded Challenge',
  },
  {
    drugName: 'Voltaren (Diclofenac)', category: 'Others', testType: 'challenge',
    presentation: 'Tablet', sptNeatConcentration: '',
    idtSteps: [],
    challengeSteps: [c(1, '25mg', '1 tablet', '25mg'), c(2, '50mg', '1 tablet', '75mg'), c(3, '100mg', '2 tablets', '175mg')],
    protocolLabel: 'Graded Challenge',
  },
];

// ── Category ordering ──────────────────────────────────────────────────────
export const MASTERLIST_CATEGORIES: string[] = [
  'Muscle Relaxants',
  'Reversal Agents',
  'Penicillins',
  'Cephalosporins',
  'Hypnotics',
  'Local Anaesthetics',
  'Opioids',
  'Antiseptics',
  'Proton Pump Inhibitors',
  'Others',
];

// ── Helpers ────────────────────────────────────────────────────────────────

export function getProtocolsForDrug(drugName: string): DrugProtocol[] {
  return DRUG_MASTERLIST.filter(p => p.drugName === drugName);
}

export function getSkinProtocolsForDrug(drugName: string): DrugProtocol[] {
  return DRUG_MASTERLIST.filter(
    p => p.drugName === drugName && (p.testType === 'skin' || p.testType === 'control' || p.testType === 'experimental')
  );
}

/**
 * Returns unique drug names per category for the SPT/IDT selection panel.
 * Challenge-only drugs are excluded.
 */
export function getDrugsByCategory(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const protocol of DRUG_MASTERLIST) {
    if (protocol.testType === 'challenge') continue;
    const { category, drugName } = protocol;
    if (!result[category]) result[category] = [];
    if (!result[category].includes(drugName)) {
      result[category].push(drugName);
    }
  }
  // Sort drugs alphabetically within each category
  for (const cat of Object.keys(result)) {
    result[cat].sort();
  }
  return result;
}

/**
 * Returns unique drug names with challenge protocols, grouped by category.
 * Used by TestingPlanGenerator for challenge section.
 */
export function getChallengeDrugsByCategory(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const protocol of DRUG_MASTERLIST) {
    if (protocol.testType !== 'challenge') continue;
    const { category, drugName } = protocol;
    if (!result[category]) result[category] = [];
    if (!result[category].includes(drugName)) {
      result[category].push(drugName);
    }
  }
  return result;
}
