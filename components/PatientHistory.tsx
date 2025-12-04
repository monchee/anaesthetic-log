import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, AccordionItem, Badge } from './ui';
import { Patient } from '../types';
import { Activity, Syringe, FileText, AlertCircle, History, Stethoscope, Clock, Pill, Building2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '../lib/utils';

interface PatientHistoryProps {
  patient: Patient;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ patient }) => {
  const { history } = patient;

  const getGradeColor = (grade: string) => {
    if (grade.includes("IV") || grade.includes("III") || grade.includes("Cardiac Arrest")) return "danger";
    if (grade.includes("II")) return "warning";
    return "default"; 
  };

  // Helper to strip seconds from time string (e.g. "12:00:00" -> "12:00")
  const formatTime = (time?: string) => {
    if (!time) return "Not recorded";
    const parts = time.split(':');
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

  // Helper to split grade
  const splitGrade = (grade: string) => {
    if (!grade) return { label: "Ungraded", description: "" };
    const parts = grade.split(' - ');
    const label = parts[0];
    const description = parts.slice(1).join(' - ');
    return { label, description };
  };

  const { label: gradeLabel, description: gradeDesc } = splitGrade(history.grade);

  return (
    <Card className="border-t-4 border-brand shadow-md bg-white">
      <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-brand-dark flex items-center gap-2">
          <div className="bg-brand-light p-1.5 rounded-md">
            <History className="h-4 w-4 text-brand" />
          </div>
          Reaction History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <AccordionItem 
          title={
            <div className="flex flex-wrap items-center gap-3 w-full pr-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 text-base">{formatDate(history.date)}</span>
                <span className="text-slate-300 text-2xl font-light">|</span>
                <span className="text-sm text-slate-600 font-medium truncate max-w-[200px] sm:max-w-md">{history.procedure}</span>
              </div>
              <div className="ml-auto flex items-center">
                 <div className="group relative">
                    <Badge variant={getGradeColor(history.grade)} className="shadow-sm cursor-help">
                        {gradeLabel}
                    </Badge>
                    {gradeDesc && (
                        <div className="absolute bottom-full mb-2 right-0 w-64 bg-slate-800 text-slate-50 text-xs rounded p-3 z-50 hidden group-hover:block shadow-xl border border-slate-700 pointer-events-none text-left leading-relaxed">
                            <p className="font-semibold mb-1 text-slate-300 uppercase text-[10px] tracking-wider">Grade Definition</p>
                            {gradeDesc}
                            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                    )}
                 </div>
              </div>
            </div>
          }
          defaultOpen={true}
          className="px-6 border-b-0" 
        >
          <div className="space-y-6 pt-2 pb-6 text-sm text-slate-700">
            
            {/* Reaction Summary */}
            <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-brand" /> 
                    Reaction Summary
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 leading-relaxed shadow-sm">
                    {history.reactionSummary || "No summary provided."}
                </div>
            </div>

            {/* 2x2 Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Timeline (Top Left) */}
                <div className="flex flex-col gap-2 h-full">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-brand" /> 
                        Timeline
                    </h4>
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 flex flex-col gap-4 text-xs shadow-sm flex-1">
                        
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3 pt-1">
                            <span className="text-slate-500 font-medium uppercase tracking-wide">Induction</span>
                            <span className="text-slate-900 font-bold font-mono text-sm">{formatTime(history.inductionTime)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-slate-500 font-medium uppercase tracking-wide">Reaction Onset</span>
                            <span className="text-slate-900 font-bold font-mono text-sm">{formatTime(history.reactionTime)}</span>
                        </div>
                        
                    </div>
                </div>

                {/* 2. Clinical Features (Top Right) */}
                <div className="flex flex-col gap-2 h-full">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-brand" /> 
                        Clinical Features
                    </h4>
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 flex flex-wrap gap-2 content-start shadow-sm flex-1">
                        {history.symptoms && history.symptoms.length > 0 ? (
                            history.symptoms.map((s, i) => (
                                <span key={i} className="inline-flex items-center rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                                {s}
                                </span>
                            ))
                        ) : <span className="text-slate-400 italic text-xs">None recorded</span>}
                    </div>
                </div>

                {/* 3. Medications (Bottom Left) */}
                <div className="flex flex-col gap-2 h-full">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                        <Pill className="h-4 w-4 text-brand" /> 
                        Suspected Agents & Meds
                    </h4>
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 flex flex-col gap-5 shadow-sm flex-1">
                        
                        {/* Pre-induction Meds */}
                        <div>
                           <div className="text-red-900/70 text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-1 border-b border-red-100 pb-1">
                                Pre-induction
                           </div>
                           {history.preInductionDrugs && history.preInductionDrugs.length > 0 ? (
                               <ul className="space-y-1.5">
                                   {history.preInductionDrugs.map((drug, idx) => (
                                       <li key={idx} className="flex justify-between items-center bg-red-50 border border-red-100 rounded px-2 py-1.5 text-red-900">
                                           {/* Handle "Drug @ Time" format if present */}
                                           {drug.includes('@') ? (
                                                <>
                                                    <span className="font-medium">{drug.split('@')[0].trim()}</span>
                                                    <span className="font-mono text-red-800/70 text-[10px] bg-white/50 px-1 rounded border border-red-100">{drug.split('@')[1].trim()}</span>
                                                </>
                                           ) : (
                                               <span className="font-medium">{drug}</span>
                                           )}
                                       </li>
                                   ))}
                               </ul>
                           ) : (
                               <span className="text-slate-400 italic pl-1">None recorded</span>
                           )}
                        </div>

                        {/* Post-induction */}
                        <div>
                            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2 border-b border-slate-200 pb-1">
                                Post-induction
                            </div>
                            {history.suspectedAgents && history.suspectedAgents.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {history.suspectedAgents.map((agent, i) => (
                                        <span key={i} className="font-semibold text-danger-800 text-xs bg-white px-2 py-1 rounded border border-danger/20 shadow-sm">
                                            {agent}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-slate-400 italic text-xs">None recorded</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Treatment (Bottom Right) */}
                <div className="flex flex-col gap-2 h-full">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                        <Syringe className="h-4 w-4 text-brand" /> 
                        Treatment
                    </h4>
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 shadow-sm flex-1">
                        {history.treatment && history.treatment.length > 0 ? (
                            <ul className="list-disc list-inside text-slate-700 text-xs space-y-2">
                                {history.treatment.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                        ) : <span className="text-slate-400 italic text-xs">None recorded</span>}
                    </div>
                </div>

            </div>

             {/* Outcome Block */}
             <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    {history.procedureOutcome === 'Abandoned' ? (
                        <div className="p-1.5 rounded-full shrink-0 bg-red-100 text-red-600">
                            <XCircle className="w-4 h-4" />
                        </div>
                    ) : (
                         <div className="p-1.5 rounded-full shrink-0 bg-green-100 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outcome:</span>
                        <span className={`font-semibold ${history.procedureOutcome === 'Abandoned' ? 'text-red-700' : 'text-green-700'}`}>
                            {history.procedureOutcome ? `Procedure ${history.procedureOutcome}` : "Outcome not recorded"}
                        </span>
                    </div>
            </div>

            {/* Footer Metadata */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-6 border-t border-slate-100 mt-6 text-xs text-slate-500">
               <div className="flex items-center gap-2">
                 <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                 <span className="font-medium text-slate-700">Anaesthetist:</span> {history.anaesthetist || "Unknown"}
               </div>
               {history.hospital && (
                   <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">Hospital:</span> {history.hospital}
                   </div>
               )}
            </div>
          </div>
        </AccordionItem>
      </CardContent>
    </Card>
  );
};

export default PatientHistory;