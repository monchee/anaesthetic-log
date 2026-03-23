import React from 'react';
import { ScrollText, Info, HelpCircle, FlaskConical, Mail, BookOpen, Shield, ShieldCheck, FileCheck, Cpu, AlertTriangle } from 'lucide-react';
import { Screen } from '@shared/types';

interface InfoPageRoute {
  screen: Screen;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  component: React.LazyExoticComponent<React.ComponentType<{ setScreen: (s: Screen) => void }>>;
}

export const INFO_PAGE_ROUTES: InfoPageRoute[] = [
  {
    screen: Screen.CHANGELOG,
    title: 'Application Changelog',
    subtitle: 'Version history and release notes',
    icon: <ScrollText className="w-5 h-5" />,
    component: React.lazy(() => import('@features/info-pages/components/Changelog')),
  },
  {
    screen: Screen.ABOUT,
    title: 'About',
    subtitle: 'About this application and the clinic',
    icon: <Info className="w-5 h-5" />,
    component: React.lazy(() => import('@features/info-pages/components/AboutPage')),
  },
  {
    screen: Screen.FAQ,
    title: 'FAQ',
    subtitle: 'Frequently asked questions',
    icon: <HelpCircle className="w-5 h-5" />,
    component: React.lazy(() => import('@features/info-pages/components/FAQPage')),
  },
  {
    screen: Screen.DRUG_REFERENCE,
    title: 'Drug Reference',
    subtitle: 'Anaesthetic agents and allergy risk reference',
    icon: <FlaskConical className="w-5 h-5" />,
    component: React.lazy(() => import('@features/info-pages/components/DrugReferencePage')),
  },
  {
    screen: Screen.CONTACT,
    title: 'Contact',
    subtitle: 'Get in touch with the team',
    icon: <Mail className="w-5 h-5" />,
    component: React.lazy(() => import('@features/info-pages/components/ContactPage')),
  },
  {
    screen: Screen.RESOURCES,
    title: 'Resources',
    subtitle: 'External links and clinical references',
    icon: <BookOpen className="w-5 h-5" />,
    component: React.lazy(() => import('@features/info-pages/components/ResourcesPage')),
  },
  {
    screen: Screen.PRIVACY_POLICY,
    title: 'Privacy Policy',
    subtitle: 'How we protect your health information',
    icon: <Shield className="w-5 h-5" />,
    component: React.lazy(() => import('@features/info-pages/components/PrivacyPolicyPage')),
  },
  {
    screen: Screen.CLINICAL_GOVERNANCE,
    title: 'Clinical Governance',
    subtitle: 'Our commitment to clinical safety and quality',
    icon: <ShieldCheck className="w-5 h-5" />,
    component: React.lazy(() => import('@features/info-pages/components/ClinicalGovernancePage')),
  },
  {
    screen: Screen.TERMS_OF_USE,
    title: 'Terms of Use',
    subtitle: 'Legal terms for using this application',
    icon: <FileCheck className="w-5 h-5" />,
    component: React.lazy(() => import('@features/info-pages/components/TermsOfUsePage')),
  },
  {
    screen: Screen.TECHNICAL_DOCUMENTATION,
    title: 'Technical Documentation',
    subtitle: 'Architecture, security, and technical specifications',
    icon: <Cpu className="w-5 h-5" />,
    component: React.lazy(() => import('@features/info-pages/components/TechnicalDocumentationPage')),
  },
  {
    screen: Screen.DISCLAIMER,
    title: 'Disclaimer',
    subtitle: 'Important medical and legal information',
    icon: <AlertTriangle className="w-5 h-5" />,
    component: React.lazy(() => import('@features/info-pages/components/DisclaimerPage')),
  },
];

export function findInfoPageRoute(screen: Screen) {
  return INFO_PAGE_ROUTES.find(r => r.screen === screen);
}
