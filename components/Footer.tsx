import React from 'react';
import { Screen } from '../types';

interface FooterProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
}

const Footer: React.FC<FooterProps> = ({ setScreen, databaseDate }) => (
  <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 pb-8 flex flex-col items-center gap-1 no-print dark:border-slate-800 dark:text-slate-500">
    <p className="font-medium text-[#441170] dark:text-purple-400">RPAH Clinical Immunology & Allergy</p>
    <p className="italic opacity-80">Dataset updated: {databaseDate}</p>
    <button 
        onClick={() => setScreen('changelog')} 
        className="hover:text-[#8055f1] hover:underline transition-colors focus:outline-none dark:hover:text-purple-300"
    >
        Anaesthetic Allergy Testing Log v0.3.6
    </button>
  </div>
);

export default Footer;