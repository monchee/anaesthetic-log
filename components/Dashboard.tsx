
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui';
import { Users, AlertTriangle, Search, Thermometer, Clock, Upload, ChevronLeft, BarChart3, PieChart, ChevronDown, ChevronUp, X, CheckCircle2, ChevronRight, Ban, FileText, ExternalLink, FileUp, Timer } from 'lucide-react';
import { formatDate, parseRedcapCSV, getGradeVariant, isSkinTestPositive, parsePatientTimeline, calculateTimeDifference } from '../lib/utils';
import { Screen, Patient, LogFormData, TestOutcome } from '../types';
import toast from 'react-hot-toast';

interface DashboardProps {
  setScreen: (screen: Screen) => void;
  existingPatients: Patient[];
  recentLogs: LogFormData[];
  drugOptions: string[];
  drugCategories: Record<string, string[]>;
  onViewLog: (log: LogFormData) => void;
  onSelectPatient: (patient: Patient) => void;
  onUploadPatients: (patients: Patient[]) => void;
  databaseDate: string;
}

// Hook for counting up numbers with cleanup - reduced duration for less aggressive animation
const useCountUp = (end: number, duration = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // Ease out cubic - smoother than quart
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration]);

  return count;
};

const Dashboard: React.FC<DashboardProps> = ({ existingPatients, recentLogs, drugOptions, drugCategories, onViewLog, onSelectPatient, onUploadPatients, databaseDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string, details?: string[] } | null>(null);
  const [animateCharts, setAnimateCharts] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 10;

  // Trigger chart animations on mount - reduced delay for less aggressive animation
  useEffect(() => {
    const timer = setTimeout(() => setAnimateCharts(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // --- Analytics Calculation ---
  const analytics = useMemo(() => {
    const totalPatients = existingPatients.length + recentLogs.length;
    let grade3PlusCount = 0;
    let abandonedCount = 0;
    
    // Time Analytics
    let totalReactionTime = 0;
    let reactionTimeCount = 0;

    // Initialize stats for ALL standard drugs so they appear in the table (even with 0 count)
    const drugStats: Record<string, { spt: number, idt100: number, idt10: number, idtNeat: number, challenge: number, total: number }> = {};
    
    drugOptions.forEach(drug => {
        drugStats[drug] = { spt: 0, idt100: 0, idt10: 0, idtNeat: 0, challenge: 0, total: 0 };
    });
    // Ensure 'Other' exists
    drugStats['Other'] = { spt: 0, idt100: 0, idt10: 0, idtNeat: 0, challenge: 0, total: 0 };

    const gradeCounts = { I: 0, II: 0, III: 0, IV: 0, Ungraded: 0 };

    // Helper to normalize and count agent usage
    const normalizeAgent = (agentName: string) => {
        const normalized = agentName.trim();
        if (!normalized) return null;
        
        let key = 'Other';
        if (Object.prototype.hasOwnProperty.call(drugStats, normalized)) {
            key = normalized;
        }
        return key;
    };

    // 1. Process Existing Static Patients
    existingPatients.forEach(p => {
      const grade = p.history.grade || 'Ungraded';
      if (grade.includes("III") || grade.includes("IV") || grade.includes("Cardiac Arrest")) {
        grade3PlusCount++;
      }
      
      // Robust check for abandoned procedures
      const outcome = (p.history.procedureOutcome || '').toLowerCase();
      if (outcome.includes('abandoned') || outcome.includes('adandoned') || outcome === '1') {
          abandonedCount++;
      }
      
      if (grade.includes("IV") || grade.includes("Cardiac Arrest")) gradeCounts.IV++;
      else if (grade.includes("III")) gradeCounts.III++;
      else if (grade.includes("II")) gradeCounts.II++;
      else if (grade.includes("I ") || grade === "Grade I") gradeCounts.I++;
      else gradeCounts.Ungraded++;

      // Time Calculation
      const timeDiff = calculateTimeDifference(p.history.inductionTime, p.history.reactionTime);
      // Only include if positive difference and less than 4 hours (240 mins) to filter out outliers/delayed reactions for this average
      if (timeDiff !== null && timeDiff >= 0 && timeDiff <= 240) {
          totalReactionTime += timeDiff;
          reactionTimeCount++;
      }

      // Use Set to track unique agents for THIS patient to avoid double counting
      const uniqueAgentsForPatient = new Set<string>();

      (p.history.suspectedAgents || []).forEach(agent => {
          const key = normalizeAgent(agent);
          if (key) uniqueAgentsForPatient.add(key);
      });
      
      // Consolidate drugs from multiple possible fields
      const allDrugs = [
          ...(p.history.medications || []),
          ...(p.history.preInductionDrugs || []),
          ...(p.history.postInductionDrugs || [])
      ];

      allDrugs.forEach(str => {
          const key = normalizeAgent(str.split('@')[0].trim());
          if (key) uniqueAgentsForPatient.add(key);
      });

      // Increment totals based on unique set
      uniqueAgentsForPatient.forEach(key => {
          drugStats[key].total += 1;
      });
    });

    // 2. Process Newly Added Logs
    recentLogs.forEach(log => {
        if (log.outcome === TestOutcome.UNSUCCESS) {
             if (log.interventionType === 'Adrenaline') {
                 gradeCounts.III++;
                 grade3PlusCount++;
             } else {
                 gradeCounts.I++;
             }
        } else {
            gradeCounts.Ungraded++;
        }

        if (log.reactionTime && !isNaN(parseInt(log.reactionTime))) {
             totalReactionTime += parseInt(log.reactionTime);
             reactionTimeCount++;
        }

        if (log.proceedToChallenge && log.outcome === TestOutcome.UNSUCCESS) {
             const drugName = log.challengeDrug === 'Other' ? (log.challengeDrugCustom || 'Other') : log.challengeDrug;
             const key = normalizeAgent(drugName);
             if (key) {
                 drugStats[key].total += 1;
                 drugStats[key].challenge += 1;
             }
        }

        log.testPanel.forEach(test => {
            const drugName = test.drugName === 'Other' ? (test.customName || 'Other') : test.drugName;
            
            if (isSkinTestPositive(test)) {
                const key = normalizeAgent(drugName);
                if (key) {
                    drugStats[key].total += 1; 
                    if (test.sptWheal && parseInt(test.sptWheal) >= 3) drugStats[key].spt++;
                    if (test.idt100 && parseInt(test.idt100) >= 3) drugStats[key].idt100++;
                    if (test.idt10 && parseInt(test.idt10) >= 3) drugStats[key].idt10++;
                    if (test.idtNeat && parseInt(test.idtNeat) >= 3) drugStats[key].idtNeat++;
                }
            }
        });
    });

    const avgReactionTime = reactionTimeCount > 0 ? Math.round(totalReactionTime / reactionTimeCount) : 0;

    const topAgentsByCount = Object.entries(drugStats)
        .filter(([name, stats]) => stats.total > 0 && name !== 'Other')
        .map(([name, stats]) => ({ name, count: stats.total }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    if (topAgentsByCount.length < 5 && drugStats['Other'].total > 0) {
        topAgentsByCount.push({ name: 'Other', count: drugStats['Other'].total });
    }

    const mostCommonAgentEntry = Object.entries(drugStats)
        .sort(([, a], [, b]) => b.total - a.total)[0];

    const statsByCategory = Object.entries(drugCategories).map(([category, drugs]) => {
        const categoryStats = (drugs as string[]).map(drugName => ({
            name: drugName,
            ...drugStats[drugName]
        }));
        return { category, stats: categoryStats };
    });
    
    if (drugStats['Other'].total > 0) {
        const othersCatIndex = statsByCategory.findIndex(c => c.category === 'Others');
        const otherItem = { name: 'Other (Unlisted)', ...drugStats['Other'] };
        if (othersCatIndex >= 0) {
            statsByCategory[othersCatIndex].stats.push(otherItem);
        } else {
            statsByCategory.push({ category: 'Others', stats: [otherItem] });
        }
    }

    return {
      totalPatients,
      grade3PlusCount,
      abandonedCount,
      avgReactionTime,
      mostCommonAgent: mostCommonAgentEntry?.[1].total > 0 ? mostCommonAgentEntry?.[0] : 'N/A',
      mostCommonAgentCount: mostCommonAgentEntry?.[1]?.total || 0,
      statsByCategory,
      gradeCounts,
      topAgentsByCount
    };
  }, [existingPatients, recentLogs, drugOptions, drugCategories]);

  // Animated numbers
  const animatedTotalPatients = useCountUp(analytics.totalPatients);
  const animatedSevereCount = useCountUp(analytics.grade3PlusCount);
  const animatedAbandonedCount = useCountUp(analytics.abandonedCount);
  const animatedAvgTime = useCountUp(analytics.avgReactionTime);

  // Rate of severe reactions
  const severeRate = analytics.totalPatients > 0 
    ? ((analytics.grade3PlusCount / analytics.totalPatients) * 100).toFixed(1) 
    : "0";

  // Rate of abandoned procedures
  const abandonedRate = existingPatients.length > 0 
    ? ((analytics.abandonedCount / existingPatients.length) * 100).toFixed(1)
    : "0";

  // --- Handle File Upload ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setUploadStatus(null);
      
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                const text = event.target?.result as string;
                const result = parseRedcapCSV(text);
                
                if (result.success) {
                    onUploadPatients(result.data);
                    toast.success(
                        <div className="flex flex-col gap-1">
                            <span className="font-bold">Database updated</span>
                            <span className="text-sm font-normal">Successfully loaded {result.data.length} records from CSV.</span>
                        </div>
                    );
                    setIsSheetOpen(false);
                } else {
                    toast.error(
                        <div className="flex flex-col gap-1">
                             <span className="font-bold">Failed to parse CSV</span>
                             <span className="text-sm font-normal">{result.error || "Please check the file format."}</span>
                        </div>
                    );
                }
              } catch {
                  toast.error(
                    <div className="flex flex-col gap-1">
                         <span className="font-bold">Error processing file</span>
                         <span className="text-sm font-normal">An unexpected error occurred.</span>
                    </div>
                  );
              }
          };
          reader.readAsText(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Filtering & Pagination ---
  const filteredPatients = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return existingPatients.filter(p => 
      (p.firstName || '').toLowerCase().includes(lowerSearch) ||
      (p.lastName || '').toLowerCase().includes(lowerSearch) ||
      (p.mrn || '').includes(lowerSearch) ||
      (p.history.suspectedAgents || []).some(a => (a || '').toLowerCase().includes(lowerSearch))
    );
  }, [existingPatients, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, existingPatients]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = useMemo(() => {
    return filteredPatients.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredPatients, currentPage, ITEMS_PER_PAGE]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
        prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const allCategories = useMemo(() => analytics.statsByCategory.map(c => c.category), [analytics.statsByCategory]);
  const areAllExpanded = allCategories.length > 0 && expandedCategories.length === allCategories.length;

  const toggleAllCategories = () => {
    if (areAllExpanded) {
        setExpandedCategories([]);
    } else {
        setExpandedCategories(allCategories);
    }
  };

  return (
    <div className="space-y-8">
        
        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Records */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter-subtle">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-24 h-24 text-[#8055f1]" />
                        </div>
                        <CardContent className="pb-6 px-6 pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-[#f0ebff] dark:bg-[#441170]/30 rounded-xl text-[#8055f1] dark:text-purple-300 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Database</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                                    {animatedTotalPatients}
                                </h3>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                     <CheckCircle2 className="w-3 h-3 text-green-500" /> Active Records
                                </p>
                            </div>
                        </CardContent>
                    </Card>

            {/* Severe Reactions */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-red-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter-subtle">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <AlertTriangle className="w-24 h-24 text-red-500" />
                        </div>
                        <CardContent className="pb-6 px-6 pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                 <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Anaphylaxis</span>
                            </div>
                             <div className="space-y-1">
                                <div className="flex items-end gap-2">
                                     <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                                        {animatedSevereCount}
                                    </h3>
                                    <span className="text-sm font-medium text-red-600 dark:text-red-400 mb-1 bg-red-50 dark:bg-red-900/30 px-1.5 rounded">
                                        {severeRate}%
                                    </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                             Grade III / IV Reactions
                        </p>
                        {/* Progress bar visual */}
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                            <div 
                                className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: animateCharts ? `${Math.min(parseFloat(severeRate), 100)}%` : '0%' }}
                            ></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Procedures Abandoned */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter-subtle">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Ban className="w-24 h-24 text-amber-500" />
                </div>
                <CardContent className="pb-6 px-6 pt-6">
                     <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <Ban className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Procedures Abandoned</span>
                    </div>
                     <div className="space-y-1">
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                                {animatedAbandonedCount}
                            </h3>
                            <span className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1 bg-amber-50 dark:bg-amber-900/30 px-1.5 rounded">
                                {abandonedRate}%
                            </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                             Due to reaction severity
                        </p>
                         {/* Progress bar visual */}
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                            <div 
                                className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: animateCharts ? `${Math.min(parseFloat(abandonedRate), 100)}%` : '0%' }}
                            ></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

             {/* Avg Reaction Onset */}
             <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-cyan-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter-subtle">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Timer className="w-24 h-24 text-cyan-600" />
                </div>
                <CardContent className="pb-6 px-6 pt-6">
                     <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl text-cyan-600 dark:text-cyan-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <Timer className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Reaction Onset</span>
                    </div>
                     <div className="space-y-1">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-baseline gap-1">
                            {animatedAvgTime} <span className="text-lg font-medium text-slate-500 dark:text-slate-400">min</span>
                        </h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                             From induction to first sign
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* ... (Charts Section) ... */}
        {/* Reaction Grade Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-enter-subtle">
            <Card className="shadow-sm h-full">
                <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <CardTitle className="text-lg text-[#441170] dark:text-purple-300 flex items-center gap-2">
                        <PieChart className="w-5 h-5" /> Reaction Severity Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex h-12 w-full rounded-lg overflow-hidden mb-6 bg-slate-50 dark:bg-slate-800/50">
                        {analytics.gradeCounts.I > 0 && (
                            <div 
                                style={{ width: animateCharts ? `${(analytics.gradeCounts.I / analytics.totalPatients) * 100}%` : '0%' }} 
                                className="bg-blue-400 dark:bg-blue-500 h-full transition-all duration-1000 ease-out" 
                                title={`Grade I: ${analytics.gradeCounts.I}`} 
                            />
                        )}
                        {analytics.gradeCounts.II > 0 && (
                            <div 
                                style={{ width: animateCharts ? `${(analytics.gradeCounts.II / analytics.totalPatients) * 100}%` : '0%' }} 
                                className="bg-amber-400 dark:bg-amber-500 h-full transition-all duration-1000 ease-out delay-100" 
                                title={`Grade II: ${analytics.gradeCounts.II}`} 
                            />
                        )}
                        {analytics.gradeCounts.III > 0 && (
                            <div 
                                style={{ width: animateCharts ? `${(analytics.gradeCounts.III / analytics.totalPatients) * 100}%` : '0%' }} 
                                className="bg-orange-500 dark:bg-orange-600 h-full transition-all duration-1000 ease-out delay-200" 
                                title={`Grade III: ${analytics.gradeCounts.III}`} 
                            />
                        )}
                        {analytics.gradeCounts.IV > 0 && (
                            <div 
                                style={{ width: animateCharts ? `${(analytics.gradeCounts.IV / analytics.totalPatients) * 100}%` : '0%' }} 
                                className="bg-red-600 dark:bg-red-600 h-full transition-all duration-1000 ease-out delay-300" 
                                title={`Grade IV: ${analytics.gradeCounts.IV}`} 
                            />
                        )}
                        {analytics.gradeCounts.Ungraded > 0 && (
                            <div 
                                style={{ width: animateCharts ? `${(analytics.gradeCounts.Ungraded / analytics.totalPatients) * 100}%` : '0%' }} 
                                className="bg-slate-200 dark:bg-slate-700 h-full transition-all duration-1000 ease-out delay-400" 
                                title={`Ungraded: ${analytics.gradeCounts.Ungraded}`} 
                            />
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                         {/* Legend Items */}
                        <div className="flex items-center gap-2 group cursor-default">
                            <span className="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-500 group-hover:scale-125 transition-transform"></span>
                            <span className="text-slate-600 dark:text-slate-400">Grade I: <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.gradeCounts.I}</span></span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-default">
                            <span className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500 group-hover:scale-125 transition-transform"></span>
                            <span className="text-slate-600 dark:text-slate-400">Grade II: <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.gradeCounts.II}</span></span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-default">
                            <span className="w-3 h-3 rounded-full bg-orange-500 dark:bg-orange-600 group-hover:scale-125 transition-transform"></span>
                            <span className="text-slate-600 dark:text-slate-400">Grade III: <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.gradeCounts.III}</span></span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-default">
                            <span className="w-3 h-3 rounded-full bg-red-600 group-hover:scale-125 transition-transform"></span>
                            <span className="text-slate-600 dark:text-slate-400">Grade IV: <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.gradeCounts.IV}</span></span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-default">
                            <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:scale-125 transition-transform"></span>
                            <span className="text-slate-600 dark:text-slate-400">Ungraded: <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.gradeCounts.Ungraded}</span></span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Suspected Agents Chart */}
            <Card className="shadow-sm h-full">
                <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <CardTitle className="text-lg text-[#441170] dark:text-purple-300 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" /> Top 5 Suspected Agents
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {analytics.topAgentsByCount.length > 0 ? (
                        analytics.topAgentsByCount.map((agent, idx) => {
                            const max = analytics.topAgentsByCount[0]?.count || 1;
                            const percentage = (agent.count / max) * 100;
                            return (
                                <div key={idx} className="space-y-1 group">
                                    <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span>{agent.name}</span>
                                        <span>{agent.count}</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#8055f1] dark:bg-purple-500 rounded-full transition-all duration-1000 ease-out group-hover:bg-[#6b42d1] dark:group-hover:bg-purple-400" 
                                            style={{ 
                                                width: animateCharts ? `${percentage}%` : '0%',
                                                transitionDelay: `${idx * 100}ms`
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-slate-400 italic">
                            No positive agents recorded yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>


        {/* Recent Skin Testing Activity Card */}
        <Card className="w-full shadow-sm border-t-4 border-t-green-500 animate-enter-subtle">
            <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 bg-green-50/50 dark:bg-green-900/10">
                <CardTitle className="text-lg text-green-800 dark:text-green-400 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Recent Skin Testing Activity
                </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Patient</th>
                            <th className="px-4 py-3">Results (SPT/IDT)</th>
                            <th className="px-4 py-3">Challenge Outcome</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                        {recentLogs.length > 0 ? (
                            recentLogs.map((log, idx) => {
                                const positives: string[] = [];
                                const negatives: string[] = [];

                                log.testPanel.forEach(t => {
                                    if (isSkinTestPositive(t)) {
                                        positives.push(t.drugName);
                                    } else {
                                        negatives.push(t.drugName);
                                    }
                                });
                                
                                return (
                                    <tr 
                                        key={idx} 
                                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors group"
                                        onClick={() => onViewLog(log)}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">{formatDate(log.visitDate)}</td>
                                        <td className="px-4 py-3 font-medium text-[#441170] dark:text-purple-300 group-hover:text-[#6b42d1] dark:group-hover:text-purple-200">{log.lastName}, {log.firstName}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1 items-center">
                                                {positives.map(p => <Badge key={p} variant="danger" className="text-[10px] px-1.5 py-0 h-5">{p}</Badge>)}
                                                {negatives.map(n => <span key={n} className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{n}</span>)}
                                                {positives.length === 0 && negatives.length === 0 && <span className="text-slate-400 italic text-xs">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {log.proceedToChallenge ? (
                                                log.outcome === TestOutcome.SUCCESS 
                                                ? <Badge variant="success" className="text-[10px]">Negative Challenge</Badge> 
                                                : <Badge variant="danger" className="text-[10px]">Positive Challenge</Badge>
                                            ) : <span className="text-slate-500 dark:text-slate-400">No Challenge</span>}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                                    No recent activity recorded in this session.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>

        {/* Positive Skin Test Breakdown Table */}
        <Card className="w-full shadow-sm animate-enter-subtle">
            <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg text-[#441170] dark:text-purple-300 flex items-center gap-2">
                            <Thermometer className="w-5 h-5" /> Positive Skin Test Breakdown
                        </CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Number of positive patient reactions by drug (SPT/IDT &gt; 3mm or Positive Challenge).</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={toggleAllCategories} className="shrink-0 h-8">
                        {areAllExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4 mr-1.5" /> Collapse All
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4 mr-1.5" /> Expand All
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <div className="overflow-x-auto max-h-[800px]">
                <table className="min-w-full text-sm relative border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 text-left bg-slate-50 dark:bg-slate-900 w-1/3">Drug</th>
                            <th className="px-4 py-3 text-center bg-slate-50 dark:bg-slate-900">SPT</th>
                            <th className="px-4 py-3 text-center bg-slate-50 dark:bg-slate-900">IDT 1:100</th>
                            <th className="px-4 py-3 text-center bg-slate-50 dark:bg-slate-900">IDT 1:10</th>
                            <th className="px-4 py-3 text-center bg-slate-50 dark:bg-slate-900">IDT Neat</th>
                            <th className="px-4 py-3 text-center bg-slate-50 dark:bg-slate-900">Challenge Pos</th>
                            <th className="px-4 py-3 text-center bg-slate-100/50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-800">Total Cases</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-950">
                        {analytics.statsByCategory.length > 0 ? (
                            analytics.statsByCategory.map((categoryGroup, cIdx) => {
                                const isExpanded = expandedCategories.includes(categoryGroup.category);
                                const totalCategoryPositives = categoryGroup.stats.reduce((acc, curr) => acc + curr.total, 0);

                                return (
                                    <React.Fragment key={cIdx}>
                                        <tr 
                                            className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 cursor-pointer transition-colors"
                                            onClick={() => toggleCategory(categoryGroup.category)}
                                        >
                                            <td colSpan={6} className="px-4 py-2.5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-[#441170] dark:text-purple-300 uppercase tracking-wide">
                                                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                                    {categoryGroup.category}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-center border-l border-slate-200 dark:border-slate-800">
                                                {totalCategoryPositives > 0 ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                                                        {totalCategoryPositives}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                        {isExpanded && categoryGroup.stats.map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors border-b border-slate-50 dark:border-slate-900 animate-in fade-in slide-in-from-top-1">
                                                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 pl-10 border-l-4 border-l-[#8055f1] hover:border-l-[#8055f1] transition-all">{item.name}</td>
                                                <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">{item.spt || '-'}</td>
                                                <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">{item.idt100 || '-'}</td>
                                                <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">{item.idt10 || '-'}</td>
                                                <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">{item.idtNeat || '-'}</td>
                                                <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">{item.challenge || '-'}</td>
                                                <td className="px-4 py-3 text-center font-bold text-slate-900 dark:text-slate-100 bg-slate-50/30 dark:bg-slate-900/30 border-l border-slate-100 dark:border-slate-800">
                                                    {item.total || <span className="text-slate-300 dark:text-slate-600 font-normal">-</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">
                                    No data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>

        {/* Patient Database Table (Full Width) - Paginated */}
        <Card className="w-full shadow-sm animate-enter-subtle">
            <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex flex-col gap-4">
                    {/* Header Top Row: Title + Update Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                             <CardTitle className="text-lg text-[#441170] dark:text-purple-300 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> REDCap Record Database
                             </CardTitle>
                             <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span>Updated {databaseDate}</span>
                             </div>
                        </div>
                        
                        {/* Action Buttons & Search */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
                             
                             <div className="flex gap-2">
                                 <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                    <SheetTrigger>
                                        <Button variant="outline" size="sm" className="shrink-0 h-9">
                                            <Upload className="w-3 h-3 mr-1.5" /> Update DB
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <SheetHeader className="mb-6">
                                            <SheetTitle className="flex items-center gap-2">
                                                <FileUp className="w-5 h-5 text-red-600" />
                                                Update Database
                                            </SheetTitle>
                                            <SheetDescription>
                                                Instructions for exporting patient data from REDCap and importing it here.
                                            </SheetDescription>
                                        </SheetHeader>
                                        
                                        <div className="space-y-6">
                                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                                    <ExternalLink className="w-4 h-4 text-red-600" /> Step 1: Login
                                                </h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                    Go to <a href="https://redcap.slhd.nsw.gov.au/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-medium">redcap.slhd.nsw.gov.au</a> and log in with your credentials.
                                                </p>
                                                <p className="text-xs text-slate-500 italic">(You must have data export rights)</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex gap-3">
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-300">
                                                        2
                                                    </div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                                        Click on <span className="font-semibold text-slate-900 dark:text-slate-100">Data Exports, Reports, and Stats</span> on the sidebar.
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-300">
                                                        3
                                                    </div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                                        Find the <span className="font-semibold text-slate-900 dark:text-slate-100">All data (all records and fields)</span> row.
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-300">
                                                        4
                                                    </div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                                        Click on <span className="font-semibold text-slate-900 dark:text-slate-100">Export Data</span>.
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-300">
                                                        5
                                                    </div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                                        Choose <span className="font-semibold text-slate-900 dark:text-slate-100">CSV / Microsoft Excel (labels)</span> as the export format.
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-300">
                                                        6
                                                    </div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                                        Click <span className="font-semibold text-slate-900 dark:text-slate-100">Export Data</span> and download the file.
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300">
                                                    Filename format should resemble:<br/>
                                                    <span className="font-mono">AnaestheticAllergyCl_DATA_LABELS_YYYY-MM-DD_time.csv</span>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                                <Button 
                                                    className="w-full h-12 text-base shadow-lg hover:shadow-red-500/20 transition-all bg-red-600 hover:bg-red-700 text-white" 
                                                    size="lg"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Upload className="w-4 h-4 mr-2" /> Select CSV File
                                                </Button>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                             </div>

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                accept=".csv" 
                                className="hidden" 
                            />
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input 
                                    placeholder="Search by Name, MRN..." 
                                    className="pl-9 h-9 bg-white" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            {/* Upload Status Banner */}
            {uploadStatus && (
                <div className={`p-4 mx-6 mt-4 mb-2 rounded-md flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${
                    uploadStatus.type === 'error' 
                    ? 'bg-red-50 text-red-900 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-900/50' 
                    : 'bg-green-50 text-green-900 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-900/50'
                }`}>
                    <div className="shrink-0 mt-0.5">
                        {uploadStatus.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="font-semibold">{uploadStatus.message}</p>
                        {uploadStatus.details && (
                            <ul className="list-disc list-inside opacity-90 text-xs space-y-0.5 ml-1">
                                {uploadStatus.details.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                        )}
                    </div>
                    <button 
                        className="opacity-50 hover:opacity-100" 
                        onClick={() => setUploadStatus(null)}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            
            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-28">Date</th>
                            <th className="px-4 py-3 w-48">Patient</th>
                            <th className="px-4 py-3">Procedure</th> {/* Flexible width */}
                            <th className="px-4 py-3 w-48">Timeline</th>
                            <th className="px-4 py-3 text-center w-28">Grade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                        {paginatedPatients.length > 0 ? (
                            paginatedPatients.map((p) => {
                                const { events: timelineEvents } = parsePatientTimeline(p.history);
                                return (
                                    <tr 
                                        key={p.id} 
                                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
                                        onClick={() => onSelectPatient(p)}
                                        title="Click to view patient details"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-xs">
                                            {formatDate(p.history.date)}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[#441170] dark:text-purple-300 group-hover:text-[#6b42d1] dark:group-hover:text-purple-200">
                                            <div className="truncate max-w-[180px]" title={`${p.lastName}, ${p.firstName}`}>
                                                {p.lastName}, {p.firstName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                            <div className="line-clamp-1 max-w-xs" title={p.history.procedure}>
                                                {p.history.procedure || <span className="italic text-slate-400">Unknown</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {timelineEvents.map((e, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`
                                                            h-2.5 w-2.5 rounded-full cursor-help inline-block
                                                            ${e.type === 'reaction' ? 'bg-red-500' : ''}
                                                            ${e.type === 'induction' ? 'bg-purple-500' : ''}
                                                            ${e.type === 'med' ? 'bg-slate-400' : ''}
                                                        `}
                                                        title={`${e.time} - ${e.label}`}
                                                    />
                                                ))}
                                                {timelineEvents.length === 0 && <span className="text-slate-300 text-xs">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge
                                                variant={getGradeVariant(p.history.grade || 'Ungraded')}
                                                className="whitespace-nowrap text-[10px] cursor-help"
                                                title={p.history.grade || 'Ungraded'}
                                            >
                                                {(p.history.grade || 'Ungraded').split(' -')[0]}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                                    No matching records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Card List) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedPatients.length > 0 ? (
                    paginatedPatients.map(p => {
                        const { events: timelineEvents } = parsePatientTimeline(p.history);
                        return (
                            <div 
                                key={p.id} 
                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer active:bg-slate-100 dark:active:bg-slate-800"
                                onClick={() => onSelectPatient(p)}
                            >
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    <div>
                                        <div className="font-bold text-[#441170] dark:text-purple-300">
                                            {p.lastName}, {p.firstName}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">
                                            {formatDate(p.history.date)}
                                        </div>
                                    </div>
                                    <Badge variant={getGradeVariant(p.history.grade || 'Ungraded')} className="whitespace-nowrap text-[10px] shrink-0">
                                        {(p.history.grade || 'Ungraded').split(' -')[0]}
                                    </Badge>
                                </div>
                                
                                <div className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-1 italic">
                                    {p.history.procedure || 'Unknown Procedure'}
                                </div>

                                <div className="flex items-center gap-1.5 mt-3">
                                    {timelineEvents.map((e, idx) => (
                                        <div 
                                            key={idx}
                                            className={`
                                                h-2 w-2 rounded-full
                                                ${e.type === 'reaction' ? 'bg-red-500' : ''}
                                                ${e.type === 'induction' ? 'bg-purple-500' : ''}
                                                ${e.type === 'med' ? 'bg-slate-300 dark:bg-slate-600' : ''}
                                            `}
                                        />
                                    ))}
                                    {timelineEvents.length === 0 && <span className="text-xs text-slate-400">No timed events</span>}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center text-slate-500 italic text-sm">
                        No matching records found.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {filteredPatients.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)} of {filteredPatients.length} records
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                        Page {currentPage} of {Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="h-8 px-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 px-2 hidden sm:block">
                            Page {currentPage} of {Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage * ITEMS_PER_PAGE >= filteredPatients.length}
                            className="h-8 px-2"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    </div>
  );
};

export default Dashboard;
