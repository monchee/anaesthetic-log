import { CategoryTheme } from '../types';
import { getDrugsByCategory } from '../data/drugMasterlist';

// Shared Constants and Configuration

export const SKIN_TEST_POSITIVE_THRESHOLD = 3;

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  "Muscle Relaxants": {
    activeBg: "bg-category-muscle-relaxants-bg",
    activeRing: "ring-category-muscle-relaxants-ring",
    headerText: "text-category-muscle-relaxants-text",
    headerBorder: "border-category-muscle-relaxants-border",
    btnSelected: "bg-category-muscle-relaxants-solid border-category-muscle-relaxants-solid text-category-muscle-relaxants-solid-foreground shadow-sm ring-1 ring-category-muscle-relaxants-ring",
    btnHover: "hover:border-category-muscle-relaxants-border hover:text-category-muscle-relaxants-text",
    pulse: "bg-category-muscle-relaxants-pulse",
    rowBorder: "border-l-category-muscle-relaxants-solid",
    actionText: "text-category-muscle-relaxants-action"
  },
  "Penicillins": {
    activeBg: "bg-category-penicillins-bg",
    activeRing: "ring-category-penicillins-ring",
    headerText: "text-category-penicillins-text",
    headerBorder: "border-category-penicillins-border",
    btnSelected: "bg-category-penicillins-solid border-category-penicillins-solid text-category-penicillins-solid-foreground shadow-sm ring-1 ring-category-penicillins-ring",
    btnHover: "hover:border-category-penicillins-border hover:text-category-penicillins-text",
    pulse: "bg-category-penicillins-pulse",
    rowBorder: "border-l-category-penicillins-solid",
    actionText: "text-category-penicillins-action"
  },
  "Cephalosporins": {
    activeBg: "bg-category-cephalosporins-bg",
    activeRing: "ring-category-cephalosporins-ring",
    headerText: "text-category-cephalosporins-text",
    headerBorder: "border-category-cephalosporins-border",
    btnSelected: "bg-category-cephalosporins-solid border-category-cephalosporins-solid text-category-cephalosporins-solid-foreground shadow-sm ring-1 ring-category-cephalosporins-ring",
    btnHover: "hover:border-category-cephalosporins-border hover:text-category-cephalosporins-text",
    pulse: "bg-category-cephalosporins-pulse",
    rowBorder: "border-l-category-cephalosporins-solid",
    actionText: "text-category-cephalosporins-action"
  },
  "Hypnotics": {
    activeBg: "bg-category-hypnotics-bg",
    activeRing: "ring-category-hypnotics-ring",
    headerText: "text-category-hypnotics-text",
    headerBorder: "border-category-hypnotics-border",
    btnSelected: "bg-category-hypnotics-solid border-category-hypnotics-solid text-category-hypnotics-solid-foreground shadow-sm ring-1 ring-category-hypnotics-ring",
    btnHover: "hover:border-category-hypnotics-border hover:text-category-hypnotics-text",
    pulse: "bg-category-hypnotics-pulse",
    rowBorder: "border-l-category-hypnotics-solid",
    actionText: "text-category-hypnotics-action"
  },
  "Local Anaesthetics": {
    activeBg: "bg-category-local-anaesthetics-bg",
    activeRing: "ring-category-local-anaesthetics-ring",
    headerText: "text-category-local-anaesthetics-text",
    headerBorder: "border-category-local-anaesthetics-border",
    btnSelected: "bg-category-local-anaesthetics-solid border-category-local-anaesthetics-solid text-category-local-anaesthetics-solid-foreground shadow-sm ring-1 ring-category-local-anaesthetics-ring",
    btnHover: "hover:border-category-local-anaesthetics-border hover:text-category-local-anaesthetics-text",
    pulse: "bg-category-local-anaesthetics-pulse",
    rowBorder: "border-l-category-local-anaesthetics-solid",
    actionText: "text-category-local-anaesthetics-action"
  },
  "Opioids": {
    activeBg: "bg-category-opioids-bg",
    activeRing: "ring-category-opioids-ring",
    headerText: "text-category-opioids-text",
    headerBorder: "border-category-opioids-border",
    btnSelected: "bg-category-opioids-solid border-category-opioids-solid text-category-opioids-solid-foreground shadow-sm ring-1 ring-category-opioids-ring",
    btnHover: "hover:border-category-opioids-border hover:text-category-opioids-text",
    pulse: "bg-category-opioids-pulse",
    rowBorder: "border-l-category-opioids-solid",
    actionText: "text-category-opioids-action"
  },
  "Antiseptics": {
    activeBg: "bg-category-antiseptics-bg",
    activeRing: "ring-category-antiseptics-ring",
    headerText: "text-category-antiseptics-text",
    headerBorder: "border-category-antiseptics-border",
    btnSelected: "bg-category-antiseptics-solid border-category-antiseptics-solid text-category-antiseptics-solid-foreground shadow-sm ring-1 ring-category-antiseptics-ring",
    btnHover: "hover:border-category-antiseptics-border hover:text-category-antiseptics-text",
    pulse: "bg-category-antiseptics-pulse",
    rowBorder: "border-l-category-antiseptics-solid",
    actionText: "text-category-antiseptics-action"
  },
  "Others": {
    activeBg: "bg-category-others-bg",
    activeRing: "ring-category-others-ring",
    headerText: "text-category-others-text",
    headerBorder: "border-category-others-border",
    btnSelected: "bg-category-others-solid border-category-others-solid text-category-others-solid-foreground shadow-sm ring-1 ring-category-others-ring",
    btnHover: "hover:border-category-others-border hover:text-category-others-text",
    pulse: "bg-category-others-pulse",
    rowBorder: "border-l-category-others-solid",
    actionText: "text-category-others-action"
  },
  "Reversal Agents": {
    activeBg: "bg-category-reversal-agents-bg",
    activeRing: "ring-category-reversal-agents-ring",
    headerText: "text-category-reversal-agents-text",
    headerBorder: "border-category-reversal-agents-border",
    btnSelected: "bg-category-reversal-agents-solid border-category-reversal-agents-solid text-category-reversal-agents-solid-foreground shadow-sm ring-1 ring-category-reversal-agents-ring",
    btnHover: "hover:border-category-reversal-agents-border hover:text-category-reversal-agents-text",
    pulse: "bg-category-reversal-agents-pulse",
    rowBorder: "border-l-category-reversal-agents-solid",
    actionText: "text-category-reversal-agents-action"
  },
  "Proton Pump Inhibitors": {
    activeBg: "bg-category-proton-pump-inhibitors-bg",
    activeRing: "ring-category-proton-pump-inhibitors-ring",
    headerText: "text-category-proton-pump-inhibitors-text",
    headerBorder: "border-category-proton-pump-inhibitors-border",
    btnSelected: "bg-category-proton-pump-inhibitors-solid border-category-proton-pump-inhibitors-solid text-category-proton-pump-inhibitors-solid-foreground shadow-sm ring-1 ring-category-proton-pump-inhibitors-ring",
    btnHover: "hover:border-category-proton-pump-inhibitors-border hover:text-category-proton-pump-inhibitors-text",
    pulse: "bg-category-proton-pump-inhibitors-pulse",
    rowBorder: "border-l-category-proton-pump-inhibitors-solid",
    actionText: "text-category-proton-pump-inhibitors-action"
  }
};

export const DEFAULT_THEME: CategoryTheme = {
  activeBg: "bg-category-default-bg",
  activeRing: "ring-category-default-ring",
  headerText: "text-category-default-text",
  headerBorder: "border-category-default-border",
  btnSelected: "bg-category-default-solid border-category-default-solid text-category-default-solid-foreground shadow-sm ring-1 ring-category-default-ring",
  btnHover: "hover:border-category-default-border hover:text-category-default-text",
  pulse: "bg-category-default-pulse",
  rowBorder: "border-l-category-default-solid",
  actionText: "text-category-default-action"
};

export const DRUG_CATEGORIES: Record<string, string[]> = getDrugsByCategory();

export const FLAT_DRUG_OPTIONS = Object.values(DRUG_CATEGORIES).flat();

export const DEFAULT_SELECTED_DRUGS: string[] = ["Chlorhexidine", "Latex"];

// App Configuration
export const APP_CONFIG = {
  APP_SUBTITLE: "Drug Reaction Evaluation & Anaesthetic Management",
  DATABASE_DEFAULT_DATE: "18/03/2026",
  SYMPTOM_OPTIONS: ['Urticaria', 'Angioedema', 'Bronchospasm', 'Hypotension', 'Flushing', 'Desaturation', 'Other'],
  INTERVENTION_OPTIONS: ['None (Observation)', 'Adrenaline', 'Antihistamine', 'Other'],
  LOCAL_STORAGE_KEYS: {
    DISCLAIMER_DISMISSED: 'disclaimerDismissed',
    THEME: 'vite-ui-theme'
  }
} as const;
