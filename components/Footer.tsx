
import React, { useRef, useState } from 'react';
import { Screen, Patient } from '../types';
import { Database, Upload, ExternalLink, FileUp } from 'lucide-react';
import { parseRedcapCSV } from '../lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, Button } from './ui';
import toast from 'react-hot-toast';

interface FooterProps {
  setScreen: (screen: Screen) => void;
  databaseDate: string;
  onUploadPatients?: (patients: Patient[]) => void;
}

const Footer: React.FC<FooterProps> = ({ setScreen, databaseDate, onUploadPatients }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onUploadPatients) return;

      // Wrap the reading/parsing in a promise to use toast.promise for better UX
      const uploadPromise = new Promise<{ count: number, data: Patient[] }>((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = (event) => {
              try {
                // Artificial delay to let the user see the "Updating..." state
                setTimeout(() => {
                    const text = event.target?.result as string;
                    const result = parseRedcapCSV(text);
                    
                    if (result.success) {
                        resolve({ count: result.data.length, data: result.data });
                    } else {
                        reject(new Error(result.error || "Failed to parse CSV structure."));
                    }
                }, 800); 
              } catch (err) {
                  reject(new Error("Unexpected error parsing file."));
              }
          };
          
          reader.onerror = () => reject(new Error("Failed to read file from disk."));
          reader.readAsText(file);
      });

      toast.promise(uploadPromise, {
          loading: 'Processing database file...',
          success: (result) => {
              onUploadPatients(result.data);
              // Close the sheet shortly after success to show context
              setTimeout(() => setIsSheetOpen(false), 600);
              return `Database Updated: Loaded ${result.count} records.`;
          },
          error: (err) => {
              return `Update Failed: ${err.message}`;
          },
      });

      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm no-print">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Branding Section */}
          <div className="text-center md:text-left space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight flex items-center justify-center md:justify-start gap-2">
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
                  App v0.3.40
              </button>

              {onUploadPatients && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger>
                            <button 
                                className="opacity-40 hover:opacity-100 flex items-center gap-1 transition-all text-slate-500 hover:text-[#8055f1] dark:text-slate-400 dark:hover:text-purple-300"
                                title="Update Database from CSV"
                            >
                                <Upload className="w-3 h-3" />
                            </button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader className="mb-6">
                                <SheetTitle className="flex items-center gap-2">
                                    <FileUp className="w-5 h-5 text-red-600" />
                                    Update Database
                                </SheetTitle>
                                <SheetDescription>
                                    Import the latest patient data export from REDCap.
                                </SheetDescription>
                            </SheetHeader>
                            
                            <div className="space-y-6">
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4 text-red-600" /> Step 1: Login
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                        Go to <a href="https://redcap.slhd.nsw.gov.au/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-medium">redcap.slhd.nsw.gov.au</a>
                                    </p>
                                    <p className="text-xs text-slate-500 italic">(Requires data export rights)</p>
                                </div>

                                <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <div className="flex gap-3 items-start">
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-[10px] font-bold text-red-600 dark:text-red-300 mt-0.5">
                                            2
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                                            Sidebar: <span className="font-semibold text-slate-900 dark:text-slate-100">Data Exports, Reports, and Stats</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-[10px] font-bold text-red-600 dark:text-red-300 mt-0.5">
                                            3
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                                            Export <span className="font-semibold text-slate-900 dark:text-slate-100">All data</span> as CSV (labels).
                                        </div>
                                    </div>
                                    
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300">
                                        <span className="font-bold">File Pattern:</span> <span className="font-mono">AnaestheticAllergyCl_DATA_LABELS...</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <Button 
                                        className="w-full h-12 text-base shadow-lg hover:shadow-red-500/20 transition-all bg-red-600 hover:bg-red-700 text-white" 
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="w-5 h-5 mr-2" /> Select CSV File
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                      </Sheet>
                      
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
