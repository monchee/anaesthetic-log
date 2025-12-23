
import React from 'react';
import { Screen, Patient } from '../types';
import { Database } from 'lucide-react';

interface FooterProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
  onUploadPatients?: (patients: Patient[]) => void;
}

const Footer: React.FC<FooterProps> = ({ setScreen, databaseDate }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm no-print">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="text-center sm:text-left">
            <span className="font-medium">RPAH Anaesthetic Allergy Clinic</span>
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
              className="hover:text-[#8055f1] dark:hover:text-purple-300 transition-colors font-medium"
            >
              v0.7.0
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
