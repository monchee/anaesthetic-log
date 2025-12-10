import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, AccordionItem, Badge } from './ui';
import { Patient } from '../types';
import { Activity, Syringe, FileText, History, Clock, Building2, AlertTriangle } from 'lucide-react';
import { formatDate, getGradeVariant } from '../lib/utils';

interface PatientHistoryProps {
  patient: Patient;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ patient }) => {
  const { history } = patient;

  const formatTime = (time?: string) => {
    if (!time) return "--:--";
    const parts = time.split(':');
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

  const splitGrade = (grade: string) => {
    if (!grade) return { label: "Ungraded", description: "" };
    const parts = grade.split(' - ');
    const label = parts[0];
    const description = parts.slice(1).join(' - ');
    return { label, description };
  };

  const { label: gradeLabel, description: gradeDesc } = splitGrade(history.grade);

  // --- Construct Timeline Events ---
  interface TimelineEvent {
      time: string;
      type: 'med' | 'induction' | 'reaction' | 'info';
      label: string;
      subtext?: string;
  }

  const events: TimelineEvent[] = [];
  const untimedAdministered: string[] = [];

  const processDrug = (d: string) => {
      if (d.includes('@')) {
          const parts = d.split('@');
          const drug = parts[0].trim();
          const time = parts[1]?.trim() || '';
          if (time) {
             events.push({ time, type: 'med', label: drug });
          } else {
             untimedAdministered.push(drug);
          }
      } else {
          untimedAdministered.push(d);
      }
  };

  // Consolidate drugs from new unified array AND legacy pre/post arrays (for mock data compatibility)
  const allMedications = [
      ...(history.medications || []),
      ...(history.preInductionDrugs || []),
      ...(history.postInductionDrugs || [])
  ];

  // Deduplicate strings
  const uniqueMedications = [...new Set(allMedications)];

  uniqueMedications.forEach(d => processDrug(d));
  
  if (history.inductionTime) events.push({ time: history.inductionTime, type: 'induction', label: 'Anaesthetic Induction' });
  if (history.reactionTime) events.push({ time: history.reactionTime, type: 'reaction', label: 'Reaction Onset', subtext: history.grade });

  const sortedEvents = events.sort((a, b) => a.time.localeCompare(b.time));

  // Determine Outcome Style
  const getOutcomeStyle = (outcome?: string) => {
      if (!outcome) return "text-slate-400 dark:text-slate-500 font-normal italic";
      const lower = outcome.toLowerCase();
      if (lower.includes('completed') || lower === '2') return "text-green-600 dark:text-green-400 font-bold";
      if (lower.includes('abandoned') || lower === '1') return "text-red-600 dark:text-red-400 font-bold";
      return "text-slate-600 dark:text-slate-300 font-medium";
  };

  const formatOutcomeText = (outcome?: string) => {
      if (!outcome) return "Not recorded";
      const lower = outcome.toLowerCase();
      if (lower === '1' || lower.includes('abandoned')) return "Abandoned";
      if (lower === '2' || lower.includes('completed')) return "Completed";
      return outcome;
  };

  return (
    <Card className="border-t-4 border-brand shadow-md bg-white dark:bg-slate-900">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <CardTitle className="text-brand-dark dark:text-purple-300 flex items-center gap-2">
          <div className="bg-brand-light dark:bg-purple-900/40 p-1.5 rounded-md">
            <History className="h-4 w-4 text-brand dark:text-purple-300" />
          </div>
          Reaction History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <AccordionItem 
          title={
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full pr-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 w-full">
                <div className="flex items-center gap-3 shrink-0">
                    <span className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight whitespace-nowrap">
                        {formatDate(history.date)}
                    </span>
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700 text-xl sm:text-2xl font-light">|</span>
                </div>
                <span className="text-sm sm:text-base text-[#441170] dark:text-purple-300 font-bold uppercase tracking-wide leading-tight break-words whitespace-normal text-left">
                    {history.procedure}
                </span>
              </div>
              <div className="flex items-center self-start sm:self-center shrink-0 mt-1 sm:mt-0">
                 <Badge variant={getGradeVariant(history.grade)} className="shadow-sm cursor-help whitespace-nowrap">
                    {gradeLabel}
                 </Badge>
              </div>
            </div>
          }
          defaultOpen={true}
          className="border-b-0" 
        >
          <div className="space-y-6 pt-2 pb-6 px-6 text-sm text-slate-700 dark:text-slate-300">
            
            {/* 1. Suspected Agents Banner */}
            {history.suspectedAgents && history.suspectedAgents.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-md">
                    <h4 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-2 text-sm mb-1">
                        <AlertTriangle className="h-4 w-4" /> Suspected Culprit Agents
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {history.suspectedAgents.map((agent, i) => (
                            <Badge key={i} variant="danger" className="text-sm px-2 py-0.5">{agent}</Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Reaction Summary & Context */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-brand dark:text-purple-400" /> 
                        Reaction Summary
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm min-h-[100px]">
                        {history.reactionSummary || "No summary provided."}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-brand dark:text-purple-400" /> 
                        Case Context
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800 space-y-3 shadow-sm flex-1">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Anaesthetist</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{history.anaesthetist || "Unknown"}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Hospital</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{history.hospital || "Unknown"}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Operation/Procedure Outcome</span>
                            <span className={getOutcomeStyle(history.procedureOutcome)}>
                                {formatOutcomeText(history.procedureOutcome)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Timeline & Medications */}
            <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-brand dark:text-purple-400" /> 
                    Anaesthetic Timeline & Medications
                </h4>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    
                    <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap gap-6 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-bold uppercase text-slate-500 dark:text-slate-400">Induction:</span>
                            <span className="font-mono font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                {formatTime(history.inductionTime)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold uppercase text-slate-500 dark:text-slate-400">Reaction:</span>
                            <span className="font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/30">
                                {formatTime(history.reactionTime)}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {sortedEvents.length > 0 ? (
                            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
                                {sortedEvents.map((event, idx) => (
                                    <div key={idx} className="relative pl-6">
                                        <div className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 shadow-sm z-10 
                                            ${event.type === 'reaction' ? 'bg-red-500 border-white dark:border-slate-900' : 
                                              event.type === 'induction' ? 'bg-purple-500 border-white dark:border-slate-900' :
                                              'bg-slate-300 dark:bg-slate-600 border-white dark:border-slate-900'}`} 
                                        />
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                            <div className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 pt-1 w-12 shrink-0">
                                                {formatTime(event.time)}
                                            </div>
                                            <div className={`flex-1 p-3 rounded-md border text-sm ${
                                                event.type === 'reaction' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' :
                                                event.type === 'induction' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900/30' :
                                                'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                            }`}>
                                                <div className={`font-semibold ${event.type === 'reaction' ? 'text-red-700 dark:text-red-300' : 'text-slate-800 dark:text-slate-200'}`}>
                                                    {event.label}
                                                </div>
                                                {event.subtext && (
                                                    <div className="text-xs opacity-80 mt-0.5">{event.subtext}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic text-center py-4">No timeline events recorded</div>
                        )}

                        {untimedAdministered.length > 0 && (
                            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">Other Administered Agents (Time Unspecified)</span>
                                <div className="flex flex-wrap gap-2">
                                    {untimedAdministered.map((med, i) => (
                                        <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                            {med}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Clinical Features & Treatment (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 h-full">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-brand dark:text-purple-400" /> 
                        Clinical Features
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 content-start shadow-sm flex-1">
                        {history.symptoms && history.symptoms.length > 0 ? (
                            history.symptoms.map((s, i) => (
                                <span key={i} className="inline-flex items-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                                {s}
                                </span>
                            ))
                        ) : <span className="text-slate-400 italic text-xs">None recorded</span>}
                    </div>
                </div>

                <div className="flex flex-col gap-2 h-full">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2 text-sm">
                        <Syringe className="h-4 w-4 text-brand dark:text-purple-400" /> 
                        Treatment
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm flex-1">
                        {history.treatment && history.treatment.length > 0 ? (
                            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 text-xs space-y-2">
                                {history.treatment.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                        ) : <span className="text-slate-400 italic text-xs">None recorded</span>}
                    </div>
                </div>
            </div>

          </div>
        </AccordionItem>
      </CardContent>
    </Card>
  );
};

export default PatientHistory;