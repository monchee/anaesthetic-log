
import React from 'react';
import { Screen, Patient } from '@/types';
import { Database } from 'lucide-react';

// @ts-expect-error - __APP_VERSION__ is injected by Vite during build
const APP_VERSION = __APP_VERSION__;

interface FooterProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
  onUploadPatients?: (patients: Patient[]) => void;
  isCustomData?: boolean;
}

const Footer: React.FC<FooterProps> = ({ setScreen, databaseDate, isCustomData = false }) => {
  const navLinks = [
    { label: 'About', screen: Screen.ABOUT },
    { label: 'FAQ', screen: Screen.FAQ },
    { label: 'Drugs', screen: Screen.DRUG_REFERENCE },
    { label: 'Contact', screen: Screen.CONTACT },
    { label: 'Resources', screen: Screen.RESOURCES },
  ];

  const legalLinks = [
    { label: 'Privacy', screen: Screen.PRIVACY_POLICY },
    { label: 'Governance', screen: Screen.CLINICAL_GOVERNANCE },
    { label: 'Terms', screen: Screen.TERMS_OF_USE },
    { label: 'Technical', screen: Screen.TECHNICAL_DOCUMENTATION },
    { label: 'Disclaimer', screen: Screen.DISCLAIMER },
  ];

  return (
    <footer role="contentinfo" aria-label="Application footer" className="border-t border-border bg-background/30 dark:bg-card/30 backdrop-blur-sm no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4">
        <div className="flex flex-col gap-3">
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs">
            {navLinks.map((link) => (
              <button
                key={link.screen}
                onClick={() => setScreen(link.screen)}
                className="text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs">
            {legalLinks.map((link) => (
              <button
                key={link.screen}
                onClick={() => setScreen(link.screen)}
                className="text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
            <div className="text-center sm:text-left">
              <span className="font-semibold text-primary">RPAH Anaesthetic Allergy Clinic</span>
              <span className="text-muted-foreground mx-1.5">·</span>
              <span className="italic text-muted-foreground">Safe sleep, clear answers</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-card px-3 py-1.5 rounded-none border border-border">
                <Database className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">
                  Dataset: <span className="font-mono">{isCustomData ? databaseDate : 'Demo'}</span>
                </span>
              </div>

              <button
                onClick={() => setScreen(Screen.CHANGELOG)}
                className="hover:text-primary dark:hover:text-primary transition-colors font-semibold"
              >
                v{APP_VERSION}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

