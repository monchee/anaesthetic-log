import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, AccordionItem, Badge } from './ui';
import { Patient } from '../types';
import { Activity, Syringe, FileText, AlertCircle, History, Stethoscope, Clock } from 'lucide-react';
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

  return (
    <Card className="border-t-4 border-[#8055f1] shadow-md bg-white">
      <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-[#441170] flex items-center gap-2">
          <div className="bg-[#e6e1fd] p-1.5 rounded-md">
            <History className="h-4 w-4 text-[#8055f1]" />
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
              <div className="ml-auto">
                 <Badge variant={getGradeColor(history.grade)} className="shadow-sm">{history.grade}</Badge>
              </div>
            </div>
          }
          defaultOpen={true}
          className="px-6 border-b-0" 
        >
          <div className="space-y-6 pt-2 pb-6 text-sm text-slate-700">
            
            {/* Suspected Agents - Alert Box Style */}
            {history.suspectedAgents && history.suspectedAgents.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm mb-6">
                    <div className="flex items-center gap-2 min-w-fit">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="font-bold text-red-900 uppercase text-xs tracking-wider">Suspected Agents</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {history.suspectedAgents.map((agent, i) => (
                            <span key={i} className="font-semibold text-red-800 text-sm bg-white px-3 py-1 rounded border border-red-100 shadow-sm">
                                {agent}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* Summary Section - Full Width */}
                <div className="col-span-1 lg:col-span-2">
                    <div className="space-y-2 h-full">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-[#8055f1]" /> 
                            Reaction Summary
                        </h4>
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-slate-700 leading-relaxed shadow-sm">
                            {history.reactionSummary || "No summary provided."}
                        </div>
                    </div>
                </div>

                {/* Timeline - Left Column */}
                <div className="flex flex-col gap-2 h-full">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-[#8055f1]" /> 
                        Timeline
                    </h4>
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 flex flex-col justify-center gap-4 text-xs shadow-sm flex-1">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                            <span className="text-slate-500 font-medium uppercase tracking-wide">Induction</span>
                            <span className="text-slate-900 font-bold font-mono text-sm">{formatTime(history.inductionTime)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-slate-500 font-medium uppercase tracking-wide">Reaction Onset</span>
                            <span className="text-slate-900 font-bold font-mono text-sm">{formatTime(history.reactionTime)}</span>
                        </div>
                    </div>
                </div>

                {/* Clinical Features - Right Column (Even Height) */}
                <div className="flex flex-col gap-2 h-full">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-[#8055f1]" /> 
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

                {/* Treatment - Full Width with Extra Top Margin */}
                <div className="col-span-1 lg:col-span-2 mt-6">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                            <Syringe className="h-4 w-4 text-[#8055f1]" /> 
                            Treatment
                        </h4>
                        <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 shadow-sm">
                            {history.treatment && history.treatment.length > 0 ? (
                                <ul className="list-disc list-inside text-slate-700 text-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                                    {history.treatment.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                            ) : <span className="text-slate-400 italic text-sm">None recorded</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Metadata */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-6 border-t border-slate-100 mt-6 text-xs text-slate-500">
               <div className="flex items-center gap-2">
                 <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                 <span className="font-medium text-slate-700">Anaesthetist:</span> {history.anaesthetist || "Unknown"}
               </div>
               {history.hospital && (
                   <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                        <span className="font-medium">Hospital:</span> {history.hospital}
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