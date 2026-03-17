import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Patient } from '../types';
import { formatDate } from '../lib/utils';
import { Search, ChevronDown, Check, UserPlus } from 'lucide-react';

interface PatientSelectorProps {
  onSelectPatient: (patient: Patient) => void;
  selectedPatientId?: string;
  patients: Patient[];
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ onSelectPatient, selectedPatientId, patients }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Memoize sorted patients to avoid recalculating on every render
  // Handle non-numeric IDs gracefully
  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
        const idA = parseInt(a.id);
        const idB = parseInt(b.id);
        if (isNaN(idA) || isNaN(idB)) {
            return a.id.localeCompare(b.id);
        }
        return idA - idB;
    });
  }, [patients]);

  // Memoize filtered patients based on search term
  const filteredPatients = useMemo(() => {
      const lowerSearch = searchTerm.toLowerCase();
      return sortedPatients.filter(p => {
        const searchString = `${p.id} ${p.firstName} ${p.lastName} ${formatDate(p.dob)}`.toLowerCase();
        return searchString.includes(lowerSearch);
      });
  }, [sortedPatients, searchTerm]);

  const selectedPatient = sortedPatients.find(p => p.id === selectedPatientId);
  const isManualSelection = selectedPatientId === 'manual';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleManualEntry = () => {
    const manualPatient: Patient = {
        id: 'manual',
        firstName: '',
        lastName: '',
        dob: '',
        mrn: '',
        gender: '',
        city: '',
        history: {
            date: new Date().toISOString(),
            grade: 'Ungraded',
            reactionSummary: 'Manual entry - no history.',
            symptoms: [],
            treatment: [],
            suspectedAgents: [],
            procedure: 'N/A',
            anaesthetist: '',
            inductionTime: '',
            reactionTime: ''
        }
    };
    handleSelect(manualPatient);
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block" id="patient-selector-label">
        Select Patient from Database
      </span>

      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby="patient-selector-label"
          className="flex min-h-10 h-auto w-full items-center justify-between rounded-none border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white cursor-pointer hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-300 transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`mr-2 whitespace-normal text-left leading-tight ${selectedPatient || isManualSelection ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}>
            {isManualSelection
                ? "[New] Manual Entry"
                : selectedPatient
                    ? `[ID: ${selectedPatient.id}] ${selectedPatient.lastName}, ${selectedPatient.firstName} (DOB: ${formatDate(selectedPatient.dob)})`
                    : "Search or select patient..."
            }
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 dark:text-slate-400 shrink-0" />
        </button>

        {isOpen && (
          <div role="listbox" aria-label="Patient list" className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-none border border-slate-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-100 dark:bg-slate-900 dark:border-slate-800 dark:shadow-xl">
            {/* Sticky Search Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-2 py-1.5">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        aria-label="Filter patients by ID or name"
                        className="w-full rounded-none border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-slate-500"
                        placeholder="Filter by ID or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            {/* Manual Entry Option - Static List Item */}
            <div
                role="option"
                aria-selected={isManualSelection}
                className="cursor-pointer select-none py-2 px-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 transition-colors"
                onClick={handleManualEntry}
            >
                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-none text-slate-500 dark:text-slate-400">
                    <UserPlus className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-primary">New Patient (Manual Entry)</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">Create a record without database ID</span>
                </div>
                {isManualSelection && (
                    <div className="ml-auto text-primary">
                        <Check className="h-4 w-4" />
                    </div>
                )}
            </div>
            
            {filteredPatients.length === 0 ? (
                <div className="px-2 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No matching records found.
                </div>
            ) : (
                filteredPatients.map((patient) => (
                <div
                    key={patient.id}
                    role="option"
                    aria-selected={selectedPatientId === patient.id}
                    className={`relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-50 dark:border-slate-800/50 transition-colors last:border-0 ${
                        selectedPatientId === patient.id ? "bg-slate-50 font-medium dark:bg-slate-800/50" : ""
                    }`}
                    onClick={() => handleSelect(patient)}
                >
                    <div className="flex flex-col gap-0.5">
                        <span className="block whitespace-normal leading-tight">
                            <span className="text-slate-500 dark:text-slate-500 mr-2 font-mono text-xs">[{patient.id}]</span>
                            <span className="font-medium text-slate-900 dark:text-slate-100">{patient.lastName}, {patient.firstName}</span>
                        </span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400 pl-8">
                            DOB: {formatDate(patient.dob)}
                        </span>
                    </div>
                    
                    {selectedPatientId === patient.id && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                            <Check className="h-4 w-4" />
                        </span>
                    )}
                </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PatientSelector);