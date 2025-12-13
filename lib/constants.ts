import { CategoryTheme } from '../types';

// Shared Constants and Configuration

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  "Muscle Relaxants": {
    activeBg: "bg-sky-50 dark:bg-sky-900/20",
    activeRing: "ring-sky-100 dark:ring-sky-900/50",
    headerText: "text-sky-700 dark:text-sky-300",
    headerBorder: "border-sky-200 dark:border-sky-800",
    btnSelected: "bg-sky-600 border-sky-600 text-white shadow-sm ring-1 ring-sky-100 dark:ring-sky-900",
    btnHover: "hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 dark:hover:border-sky-400",
    pulse: "bg-sky-600",
    rowBorder: "border-l-sky-600",
    actionText: "text-sky-600 dark:text-sky-400"
  },
  "Penicillins": {
    activeBg: "bg-orange-50 dark:bg-orange-900/20",
    activeRing: "ring-orange-100 dark:ring-orange-900/50",
    headerText: "text-orange-700 dark:text-orange-300",
    headerBorder: "border-orange-200 dark:border-orange-800",
    btnSelected: "bg-orange-500 border-orange-500 text-white shadow-sm ring-1 ring-orange-100 dark:ring-orange-900",
    btnHover: "hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 dark:hover:border-orange-400",
    pulse: "bg-orange-500",
    rowBorder: "border-l-orange-500",
    actionText: "text-orange-600 dark:text-orange-400"
  },
  "Cephalosporins": {
    activeBg: "bg-emerald-50 dark:bg-emerald-900/20",
    activeRing: "ring-emerald-100 dark:ring-emerald-900/50",
    headerText: "text-emerald-700 dark:text-emerald-300",
    headerBorder: "border-emerald-200 dark:border-emerald-800",
    btnSelected: "bg-emerald-600 border-emerald-600 text-white shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-900",
    btnHover: "hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 dark:hover:border-emerald-400",
    pulse: "bg-emerald-600",
    rowBorder: "border-l-emerald-600",
    actionText: "text-emerald-600 dark:text-emerald-400"
  },
  "Hypnotics": {
    activeBg: "bg-indigo-50 dark:bg-indigo-900/20",
    activeRing: "ring-indigo-100 dark:ring-indigo-900/50",
    headerText: "text-indigo-700 dark:text-indigo-300",
    headerBorder: "border-indigo-200 dark:border-indigo-800",
    btnSelected: "bg-indigo-600 border-indigo-600 text-white shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-900",
    btnHover: "hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 dark:hover:border-indigo-400",
    pulse: "bg-indigo-600",
    rowBorder: "border-l-indigo-600",
    actionText: "text-indigo-600 dark:text-indigo-400"
  },
  "Local Anaesthetics": {
    activeBg: "bg-cyan-50 dark:bg-cyan-900/20",
    activeRing: "ring-cyan-100 dark:ring-cyan-900/50",
    headerText: "text-cyan-700 dark:text-cyan-300",
    headerBorder: "border-cyan-200 dark:border-cyan-800",
    btnSelected: "bg-cyan-600 border-cyan-600 text-white shadow-sm ring-1 ring-cyan-100 dark:ring-cyan-900",
    btnHover: "hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 dark:hover:border-cyan-400",
    pulse: "bg-cyan-600",
    rowBorder: "border-l-cyan-600",
    actionText: "text-cyan-600 dark:text-cyan-400"
  },
  "Opioids": {
    activeBg: "bg-rose-50 dark:bg-rose-900/20",
    activeRing: "ring-rose-100 dark:ring-rose-900/50",
    headerText: "text-rose-700 dark:text-rose-300",
    headerBorder: "border-rose-200 dark:border-rose-800",
    btnSelected: "bg-rose-600 border-rose-600 text-white shadow-sm ring-1 ring-rose-100 dark:ring-rose-900",
    btnHover: "hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 dark:hover:border-rose-400",
    pulse: "bg-rose-600",
    rowBorder: "border-l-rose-600",
    actionText: "text-rose-600 dark:text-rose-400"
  },
  "Antiseptics": {
    activeBg: "bg-teal-50 dark:bg-teal-900/20",
    activeRing: "ring-teal-100 dark:ring-teal-900/50",
    headerText: "text-teal-700 dark:text-teal-300",
    headerBorder: "border-teal-200 dark:border-teal-800",
    btnSelected: "bg-teal-600 border-teal-600 text-white shadow-sm ring-1 ring-teal-100 dark:ring-teal-900",
    btnHover: "hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 dark:hover:border-teal-400",
    pulse: "bg-teal-600",
    rowBorder: "border-l-teal-600",
    actionText: "text-teal-600 dark:text-teal-400"
  },
  "Others": {
    activeBg: "bg-slate-100 dark:bg-slate-800",
    activeRing: "ring-slate-200 dark:ring-slate-700",
    headerText: "text-slate-700 dark:text-slate-300",
    headerBorder: "border-slate-300 dark:border-slate-700",
    btnSelected: "bg-slate-600 border-slate-600 text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-500",
    btnHover: "hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:hover:border-slate-500",
    pulse: "bg-slate-600",
    rowBorder: "border-l-slate-600",
    actionText: "text-slate-600 dark:text-slate-400"
  }
};

export const DEFAULT_THEME: CategoryTheme = {
    activeBg: "bg-purple-50/80 dark:bg-purple-900/20",
    activeRing: "ring-purple-100 dark:ring-purple-900/50",
    headerText: "text-[#8055f1] dark:text-purple-300",
    headerBorder: "border-purple-200 dark:border-purple-800",
    btnSelected: "bg-[#8055f1] border-[#8055f1] text-white",
    btnHover: "hover:border-[#8055f1] hover:text-[#8055f1] dark:hover:text-purple-300",
    pulse: "bg-[#8055f1]",
    rowBorder: "border-l-[#8055f1]",
    actionText: "text-[#8055f1] dark:text-purple-400"
};

export const DRUG_CATEGORIES: Record<string, string[]> = {
  "Muscle Relaxants": [
    "Cis-atracurium", "Rocuronium", "Pancuronium", "Vecuronium", "Suxamethonium"
  ],
  "Penicillins": [
    "Major/Minor Determinants", "Ampicillin", "Amoxicillin"
  ],
  "Cephalosporins": [
    "Cefotaxime", "Cefazolin", "Ceftazidime", "Ceftriaxone", "Cefepime"
  ],
  "Hypnotics": [
    "Midazolam", "Propofol"
  ],
  "Local Anaesthetics": [
    "Lignocaine", "Mepivacaine", "Bupivacaine", "Ropivacaine"
  ],
  "Opioids": [
    "Alfentanil", "Fentanyl", "Morphine", "Remifentanil", "Oxycodone"
  ],
  "Antiseptics": [
    "Chlorhexidine", "Povidone Iodine"
  ],
  "Others": [
    "Latex", "Paracetamol", "Patent Blue", "Methylene Blue", "Atropine", "Neostigmine"
  ]
};

export const FLAT_DRUG_OPTIONS = Object.values(DRUG_CATEGORIES).flat();

// App Configuration
export const APP_CONFIG = {
  APP_SUBTITLE: "RPAH Department of Clinical Immunology & Allergy",
  DATABASE_DEFAULT_DATE: "12/12/2025",
  SYMPTOM_OPTIONS: ['Urticaria', 'Angioedema', 'Bronchospasm', 'Hypotension', 'Flushing', 'Desaturation', 'Other'],
  INTERVENTION_OPTIONS: ['None (Observation)', 'Adrenaline', 'Antihistamine', 'Other'],
  LOCAL_STORAGE_KEYS: {
    DISCLAIMER_DISMISSED: 'disclaimerDismissed',
    THEME: 'vite-ui-theme'
  }
} as const;