
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { Patient } from '@/types';
import { Activity, Syringe, FileText, History, Clock, Building2, AlertTriangle, User, Phone, CheckCircle2, AlertCircle, HelpCircle, Info, MessageSquare, MonitorCheck, FlaskConical } from 'lucide-react';
import { formatDate, getGradeVariant, parsePatientTimeline, calculateTimeDifference } from '@shared/utils';

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
    if (!grade) return { label: "Ungraded", description: "No grade recorded" };
    const parts = grade.split(' - ');
    const label = parts[0];
    const description = parts.slice(1).join(' - ');
    return { label, description: description || label };
  };

  const { label: gradeLabel, description: gradeDesc } = splitGrade(history.grade);

  // Use centralized parsing logic
  const { events: sortedEvents, untimedMedications: untimedAdministered } = useMemo(() => 
    parsePatientTimeline(history), 
  [history]);

  const getOutcomeConfig = (outcome?: string) => {
      if (!outcome) return { text: "Not recorded", color: "text-slate-500", icon: HelpCircle };
      const lower = outcome.toLowerCase();
      if (lower.includes('completed') || lower === '2') return { text: "Completed", color: "text-green-600 dark:text-green-400", icon: CheckCircle2 };
      if (lower.includes('abandoned') || lower.includes('adandoned') || lower === '1') return { text: "Abandoned", color: "text-red-600 dark:text-red-400", icon: AlertCircle };
      return { text: outcome, color: "text-slate-600", icon: HelpCircle };
  };

  const outcomeConfig = getOutcomeConfig(history.procedureOutcome);
  const OutcomeIcon = outcomeConfig.icon;

  const doctorName = history.referringDoctor || history.anaesthetist || "Unknown";

  const getGradeBorderColor = (variant: ReturnType<typeof getGradeVariant>): string => {
    switch (variant) {
      case 'grade4': return 'border-l-rose-600';
      case 'grade3': return 'border-l-orange-500';
      case 'grade2': return 'border-l-amber-500';
      case 'grade1': return 'border-l-emerald-600';
      default:       return 'border-l-slate-300 dark:border-l-slate-600';
    }
  };

  const elapsedMinutes = calculateTimeDifference(history.inductionTime, history.reactionTime);
  const elapsedLabel = elapsedMinutes !== null
    ? (elapsedMinutes < 60 ? `+${elapsedMinutes}m` : `+${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`)
    : null;

  return (
    <Card className="shadow-md bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          <div className="bg-primary/15 dark:bg-primary/20 p-1.5 rounded-none">
            <History className="h-4 w-4 text-primary dark:text-primary" />
          </div>
          Reaction History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-6">
        
        {/* Header Information Box */}
        <div className={`mt-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-none border border-slate-100 dark:border-slate-800 border-l-4 ${getGradeBorderColor(getGradeVariant(history.grade))} shadow-sm flex flex-wrap items-center justify-between gap-y-2 gap-x-3`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
            <span className="font-semibold text-slate-900 dark:text-white text-lg tracking-tight">
                {formatDate(history.date)}
            </span>
            <span className="text-slate-200 dark:text-slate-700 text-xl font-light hidden sm:inline">|</span>
            <span className="text-base text-primary dark:text-primary font-semibold uppercase tracking-wide leading-tight break-words">
                {history.procedure}
            </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                {history.tryptase && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 px-2.5 py-1 rounded-none">
                        <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-semibold uppercase tracking-wide text-[10px]">Tryptase:</span>
                        <span>{history.tryptase}</span>
                    </div>
                )}
                {gradeDesc && gradeDesc !== gradeLabel ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Badge variant={getGradeVariant(history.grade)} className="shadow-sm whitespace-nowrap cursor-help">
                                {gradeLabel}
                            </Badge>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 text-left p-3" sideOffset={4}>
                            <p className="font-bold mb-1 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1">{gradeLabel}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{gradeDesc}</p>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Badge variant={getGradeVariant(history.grade)} className="shadow-sm whitespace-nowrap">
                        {gradeLabel}
                    </Badge>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN (Details) */}
            <div className="lg:col-span-7 flex flex-col gap-5">
                
                {/* 1. Suspected Agents */}
                {history.suspectedAgents && history.suspectedAgents.length > 0 && (
                    <div className="space-y-2">
                            <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                            <span className="text-[0.625rem] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Suspected Culprit Agents</span>
                        </div>
                        <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-none border border-red-100 dark:border-red-900/30 flex flex-wrap gap-2 shadow-sm min-h-[44px] items-center">
                            {history.suspectedAgents.map((agent, i) => (
                                <Badge key={i} variant="danger" className="text-xs px-2.5 py-0.5">{agent}</Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Reaction Summary & Comments */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="section-label flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-primary dark:text-primary" /> 
                            Reaction Summary
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-none border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm text-sm">
                            {history.reactionSummary || "No summary provided."}
                        </div>
                    </div>

                    {history.comments && (
                        <div className="space-y-2">
                            <div className="section-label flex items-center gap-2">
                                <MessageSquare className="h-3.5 w-3.5 text-slate-500" /> 
                                Additional Comments
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-none border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 leading-relaxed shadow-sm text-xs italic">
                                {history.comments}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Clinical Features & Treatment (Grid 1x2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2 h-full">
                        <div className="section-label flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-primary dark:text-primary" /> 
                            Clinical Features
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-none border border-slate-100 dark:border-slate-800 flex flex-col gap-3 shadow-sm flex-1">
                            
                            {/* Key Symptom Highlights */}
                            {(history.firstSymptom || history.predominantSymptom) && (
                                <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-1">
                                    {history.firstSymptom && (
                                        <div className="flex flex-col bg-white dark:bg-slate-900 p-2 rounded-none border border-slate-200 dark:border-slate-700 border-l-2 border-l-amber-400 shadow-sm">
                                            <span className="section-label mb-0.5">First Sign</span>
                                            <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm leading-tight">{history.firstSymptom}</span>
                                        </div>
                                    )}
                                    {history.predominantSymptom && (
                                        <div className="flex flex-col bg-white dark:bg-slate-900 p-2 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <span className="section-label mb-0.5">Predominant</span>
                                            <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm leading-tight">{history.predominantSymptom}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-1.5 content-start">
                                {history.symptoms && history.symptoms.length > 0 ? (
                                    history.symptoms.map((s, i) => (
                                        s.detail ? (
                                            <Popover key={i}>
                                                <PopoverTrigger asChild>
                                                    <div className="inline-flex items-center gap-1 rounded-none bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer hover:border-primary/50 hover:text-primary transition-colors">
                                                        {s.label}
                                                        <Info className="w-3 h-3 opacity-50 text-blue-500" />
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64 text-xs p-3" sideOffset={4}>
                                                    {s.detail}
                                                </PopoverContent>
                                            </Popover>
                                        ) : (
                                            <span key={i} className="inline-flex items-center rounded-none bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
                                                {s.label}
                                            </span>
                                        )
                                    ))
                                ) : <span className="text-slate-400 italic text-xs">None recorded</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 h-full">
                        <div className="section-label flex items-center gap-2">
                            <Syringe className="h-3.5 w-3.5 text-primary dark:text-primary" /> 
                            Treatment
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-none border border-slate-100 dark:border-slate-800 shadow-sm flex-1">
                            {history.treatment && history.treatment.length > 0 ? (
                                <ul className="text-slate-700 dark:text-slate-300 text-xs space-y-1.5">
                                    {history.treatment.map((t, i) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{t}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <span className="text-slate-400 italic text-xs">None recorded</span>}
                        </div>
                    </div>
                </div>

                {/* 4. Context Bar */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-none border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 shadow-sm">
                    <div className="space-y-1 flex-1 min-w-0">
                        <span className="section-label flex items-center gap-1.5">
                            <User className="h-3 w-3" /> Referring Doctor
                        </span>
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm break-words leading-snug">
                            {doctorName}
                        </div>
                        <div className="text-[0.625rem] text-slate-500 dark:text-slate-400 flex flex-wrap gap-2 mt-0.5">
                            {history.referringDoctorPosition && (
                                <span className="font-medium text-slate-600 dark:text-slate-300">{history.referringDoctorPosition}</span>
                            )}
                            {(history.referringDoctorPosition && (history.providerNumber || history.referringPhone)) && (
                                <span className="text-slate-200 dark:text-slate-600">|</span>
                            )}
                            {history.providerNumber && <span className="opacity-80">#{history.providerNumber}</span>}
                            {history.referringPhone && <span className="opacity-80 flex items-center gap-0.5"><Phone className="h-2 w-2" /> {history.referringPhone}</span>}
                        </div>
                    </div>

                    <div className="space-y-1 flex-1 min-w-0 sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-4">
                        <span className="section-label flex items-center gap-1.5">
                            <Building2 className="h-3 w-3" /> Hospital
                        </span>
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{history.hospital || "Unknown"}</div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN (Timeline) */}
            <div className="lg:col-span-5 flex flex-col gap-2 h-full">
                    <div className="section-label flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary dark:text-primary" /> 
                    Timeline & Medications
                </div>
                {/* Removed overflow-hidden and overflow-y-auto to allow tooltips to display without clipping */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-none border border-slate-100 dark:border-slate-800 shadow-sm overflow-visible flex-1 flex flex-col">
                    
                    {/* Key Times Header */}
                    <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center gap-4 text-xs shrink-0 rounded-none">
                        <div className="flex items-center gap-1.5">
                            <span className="section-label">Induction:</span>
                            <span className="font-mono font-semibold text-primary dark:text-primary text-xs">
                                {formatTime(history.inductionTime)}
                            </span>
                        </div>
                        {elapsedLabel && (
                            <span className="font-mono text-[10px] font-medium text-slate-400 dark:text-slate-500">{elapsedLabel}</span>
                        )}
                        <div className="flex items-center gap-1.5">
                            <span className="section-label">Reaction:</span>
                            <span className="font-mono font-bold text-red-600 dark:text-red-400 text-xs">
                                {formatTime(history.reactionTime)}
                            </span>
                        </div>
                    </div>

                    {/* Timeline Area - Removed max-height constraints to prevent scrolling and clipping */}
                    <div className="p-4 flex-1">
                        {sortedEvents.length > 0 ? (
                            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-1.5 space-y-4">
                                {sortedEvents.map((event, idx) => (
                                    <div key={idx} className="relative pl-6">
                                        <div className={`absolute top-0.5 rounded-full border-2 shadow-sm z-10
                                            ${event.type === 'reaction'
                                                ? 'h-4 w-4 -left-[8px] bg-red-500 border-white dark:border-slate-900 ring-2 ring-red-200 dark:ring-red-900/50'
                                                : event.type === 'induction'
                                                ? 'h-3.5 w-3.5 -left-[7px] bg-primary border-white dark:border-slate-900'
                                                : 'h-2.5 w-2.5 -left-[5px] bg-slate-300 dark:bg-slate-600 border-white dark:border-slate-900'}`}
                                        />
                                        
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    {event.type === 'induction' ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-semibold text-xs text-primary dark:text-primary">
                                                                {event.label}
                                                            </span>
                                                            <MonitorCheck className="w-3.5 h-3.5 text-primary opacity-70" />
                                                        </div>
                                                    ) : event.type === 'reaction' ? (
                                                        <span className="font-bold text-xs text-red-700 dark:text-red-300">
                                                            {event.label}
                                                        </span>
                                                    ) : (
                                                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                                                            {event.label}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`font-mono text-xs font-bold ${
                                                    event.type === 'reaction' ? 'text-red-600 dark:text-red-400' :
                                                    event.type === 'induction' ? 'text-primary dark:text-primary' :
                                                    'text-slate-400 dark:text-slate-500'
                                                }`}>
                                                    {formatTime(event.time)}
                                                </span>
                                            </div>
                                            {event.type === 'induction' && history.anaesthesiaType && history.anaesthesiaType.length > 0 && (
                                                <div className="text-xs opacity-80 text-slate-500 dark:text-slate-400">{history.anaesthesiaType.join(', ')}</div>
                                            )}
                                            {event.subtext && event.type !== 'reaction' && event.type !== 'induction' && (
                                                <div className="text-xs opacity-80 text-slate-500 dark:text-slate-400">{event.subtext}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic text-center py-4 text-xs">No timed events.</div>
                        )}
                    </div>
                    
                    {/* Untimed Agents Section */}
                    {untimedAdministered.length > 0 && (
                        <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-3 bg-white/50 dark:bg-slate-900/50">
                            <p className="section-label mb-2">Agents with no listed time</p>
                            <div className="flex flex-wrap gap-1.5">
                                {untimedAdministered.map((drug, idx) => (
                                    <Badge 
                                        key={idx} 
                                        variant="secondary"
                                        className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    >
                                        {drug}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Outcome Footer */}
                    <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between shrink-0 rounded-none">
                            <span className="section-label">Outcome</span>
                            <div className={`font-bold text-xs flex items-center gap-1.5 ${outcomeConfig.color}`}>
                            <OutcomeIcon className="h-3.5 w-3.5" />
                            {outcomeConfig.text}
                        </div>
                    </div>

                </div>
            </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(PatientHistory);
