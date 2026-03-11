
import React from 'react';
import { Screen, Patient } from '../types';
import { Database } from 'lucide-react';

interface FooterProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
  onUploadPatients?: (patients: Patient[]) => void;
}

const Footer: React.FC<FooterProps> = ({ setScreen, databaseDate }) => {
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
    <footer role="contentinfo" aria-label="Application footer" className="border-t border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm no-print">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col gap-3">
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
            {navLinks.map((link) => (
              <button
                key={link.screen}
                onClick={() => setScreen(link.screen)}
                className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
            {legalLinks.map((link) => (
              <button
                key={link.screen}
                onClick={() => setScreen(link.screen)}
                className="text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="text-center sm:text-left">
              <span className="font-semibold text-primary">RPAH Anaesthetic Allergy Clinic</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <Database className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Dataset: <span className="font-mono">{databaseDate || '13/12/2025'}</span>
                </span>
              </div>

              <button
                onClick={() => setScreen(Screen.CHANGELOG)}
                className="hover:text-primary dark:hover:text-primary transition-colors font-semibold"
              >
                v0.14.0
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

