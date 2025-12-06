import React, { useRef } from 'react';
import { Screen, Patient } from '../types';
import { Database, ShieldCheck, Upload } from 'lucide-react';
import { parseRedcapCSV } from '../lib/utils';

interface FooterProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
  onUploadPatients?: (patients: Patient[]) => void;
}

const Footer: React.FC<FooterProps> = ({ setScreen, databaseDate, onUploadPatients }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onUploadPatients) {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                const text = event.target?.result as string;
                const result = parseRedcapCSV(text);
                if (result.success) {
                    onUploadPatients(result.data);
                } else {
                    alert(result.error || "Failed to parse CSV.");
                }
              } catch (err) {
                  alert("Error processing file.");
              }
          };
          reader.readAsText(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm no-print">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Branding Section */}
          <div className="text-center md:text-left space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-[#8055f1]" />
              Anaesthetic Allergy Clinic
            </h3>
            <p className="text-sm text-[#441170] dark:text-purple-400 font-medium">
              RPAH Department of Clinical Immunology & Allergy
            </p>
          </div>

          {/* System Meta Section */}
          <div className="flex flex-col items-center md:items-end gap-3 text-sm">
            
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <Database className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Dataset: <span className="font-mono">{databaseDate}</span>
                </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
               <button 
                  onClick={() => setScreen('changelog')} 
                  className="hover:text-[#8055f1] dark:hover:text-purple-300 transition-colors flex items-center gap-1.5"
              >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  App v0.3.15
              </button>

              {onUploadPatients && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="opacity-40 hover:opacity-100 flex items-center gap-1 transition-all text-slate-500 hover:text-[#8055f1] dark:text-slate-400 dark:hover:text-purple-300"
                          title="Update Database from CSV"
                      >
                          <Upload className="w-3 h-3" />
                      </button>
                      <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          accept=".csv" 
                          className="hidden" 
                      />
                    </>
                )}
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;