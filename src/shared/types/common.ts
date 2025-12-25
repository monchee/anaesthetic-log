export enum Screen {
  LOG = 'log',
  SUMMARY = 'summary',
  PATIENT_SUMMARY = 'patient-summary',
  DASHBOARD = 'dashboard',
  CHANGELOG = 'changelog',
  TESTING = 'testing',
  PRINT_PLAN = 'print-plan',
  ABOUT = 'about',
  FAQ = 'faq',
  DRUG_REFERENCE = 'drug-reference',
  CONTACT = 'contact',
  RESOURCES = 'resources'
}

export interface CategoryTheme {
  activeBg: string;
  activeRing: string;
  headerText: string;
  headerBorder: string;
  btnSelected: string;
  btnHover: string;
  pulse: string;
  rowBorder: string;
  actionText: string;
}
