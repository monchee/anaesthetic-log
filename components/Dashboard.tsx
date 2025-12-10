import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from './ui';
import { Users, AlertTriangle, Activity, Search, Thermometer, Clock, Upload, ChevronLeft, BarChart3, PieChart, ChevronDown, ChevronUp, X, CheckCircle2, ChevronRight, Ban, FileText } from 'lucide-react';
import { formatDate, parseRedcapCSV, getGradeVariant, isSkinTestPositive } from '../lib/utils';
import { Screen, Patient, LogFormData } from '../types';

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

// Hook for counting up numbers with cleanup
const useCountUp = (end: number, duration = 1500) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // Ease out quart
      const ease = 1 - Math.pow(1 - progress, 4);
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

const Dashboard: React.FC<DashboardProps> = ({ setScreen, existingPatients, recentLogs, drugOptions, drugCategories, onViewLog, onSelectPatient, onUploadPatients, databaseDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string, details?: string[] } | null>(null);
  const [animateCharts, setAnimateCharts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 10;

  // Trigger chart animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimateCharts(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // --- Analytics Calculation ---
  const analytics = useMemo(() => {
    const totalPatients = existingPatients.length + recentLogs.length;
    let grade3PlusCount = 0;
    let abandonedCount = 0;
    
    // Initialize stats for ALL standard drugs so they appear in the table (even with 0 count)
    const drugStats: Record<string, { spt: number, idt100: number, idt10: number, idtNeat: number, challenge: number, total: number }> = {};
    
    drugOptions.forEach(drug => {
        drugStats[drug] = { spt: 0, idt100: 0, idt10: 0, idtNeat: 0, challenge: 0, total: 0 };
    });
    // Ensure 'Other' exists
    drugStats['Other'] = { spt: 0, idt100: 0, idt10: 0, idtNeat: 0, challenge: 0, total: 0 };

    const symptomCounts: Record<string, number> = {};
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
      
      if (p.history.procedureOutcome === 'Abandoned') {
          abandonedCount++;
      }
      
      if (grade.includes("IV") || grade.includes("Cardiac Arrest")) gradeCounts.IV++;
      else if (grade.includes("III")) gradeCounts.III++;
      else if (grade.includes("II")) gradeCounts.II++;
      else if (grade.includes("I ") || grade === "Grade I") gradeCounts.I++;
      else gradeCounts.Ungraded++;

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

      (p.history.symptoms || []).forEach(sym => {
         const normalized = sym.trim();
         if (normalized) {
            symptomCounts[normalized] = (symptomCounts[normalized] || 0) + 1;
         }
      });
    });

    // 2. Process Newly Added Logs
    recentLogs.forEach(log => {
        if (log.outcome === 'UNSUCCESS') {
             if (log.interventionType === 'Adrenaline') {
                 gradeCounts.III++;
                 grade3PlusCount++;
             } else {
                 gradeCounts.I++;
             }
        } else {
            gradeCounts.Ungraded++;
        }

        if (log.proceedToChallenge && log.outcome === 'UNSUCCESS') {
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
                    // Note: Here we might double count if same drug tested multiple times in same patient log, but panel usually unique
                    drugStats[key].total += 1; 
                    if (test.sptWheal && parseInt(test.sptWheal) >= 3) drugStats[key].spt++;
                    if (test.idt100 && parseInt(test.idt100) >= 3) drugStats[key].idt100++;
                    if (test.idt10 && parseInt(test.idt10) >= 3) drugStats[key].idt10++;
                    if (test.idtNeat && parseInt(test.idtNeat) >= 3) drugStats[key].idtNeat++;
                }
            }
        });
    });

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
        
    const mostCommonSymptomEntry = Object.entries(symptomCounts).sort(([, a], [, b]) => b - a)[0];

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
      mostCommonAgent: mostCommonAgentEntry?.[1].total > 0 ? mostCommonAgentEntry?.[0] : 'N/A',
      mostCommonAgentCount: mostCommonAgentEntry?.[1]?.total || 0,
      mostCommonSymptom: mostCommonSymptomEntry?.[0] || 'N/A',
      statsByCategory,
      gradeCounts,
      topAgentsByCount
    };
  }, [existingPatients, recentLogs, drugOptions, drugCategories]);

  // Animated numbers
  const animatedTotalPatients = useCountUp(analytics.totalPatients);
  const animatedSevereCount = useCountUp(analytics.grade3PlusCount);
  const animatedAbandonedCount = useCountUp(analytics.abandonedCount);

  // Rate of severe reactions
  const severeRate = analytics.totalPatients > 0 
    ? ((analytics.grade3PlusCount / analytics.totalPatients) * 100).toFixed(1) 
    : "0";

  // Rate of abandoned procedures (Use existing patients as denominator since history comes from there)
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
                    setUploadStatus({ 
                        type: 'success', 
                        message: `Successfully loaded ${result.data.length} records into the database.` 
                    });
                } else {
                    setUploadStatus({ 
                        type: 'error', 
                        message: result.error || "Failed to parse CSV file.",
                        details: result.details
                    });
                }
              } catch (err) {
                  setUploadStatus({ 
                      type: 'error', 
                      message: "An unexpected error occurred while processing the file." 
                  });
              }
          };
          reader.readAsText(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Filtering & Pagination ---
  const filteredPatients = existingPatients.filter(p => 
    (p.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.mrn || '').includes(searchTerm) ||
    (p.history.suspectedAgents || []).some(a => (a || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, existingPatients]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter" style={{ animationDelay: '0ms' }}>
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
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-red-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter" style={{ animationDelay: '100ms' }}>
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
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter" style={{ animationDelay: '200ms' }}>
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

             {/* Top Symptom */}
             <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none shadow-md bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-slate-900/50 animate-enter" style={{ animationDelay: '300ms' }}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-24 h-24 text-blue-500" />
                </div>
                <CardContent className="pb-6 px-6 pt-6">
                     <div className="flex items-center gap-4 mb-4">
                         <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Symptom</span>
                    </div>
                     <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight truncate" title={analytics.mostCommonSymptom}>
                            {analytics.mostCommonSymptom}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                             Most frequently reported
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* --- Charts Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-enter" style={{ animationDelay: '400ms' }}>
            
            {/* Reaction Grade Distribution */}
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
        <Card className="w-full shadow-sm border-t-4 border-t-green-500 animate-enter" style={{ animationDelay: '500ms' }}>
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
                                                log.outcome === 'SUCCESS' 
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

        {/* Positive Skin Test Breakdown Table (Grouped by Category + Accordion) */}
        <Card className="w-full shadow-sm animate-enter" style={{ animationDelay: '600ms' }}>
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
                                                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 pl-10 border-l-4 border-l-transparent hover:border-l-[#8055f1] transition-all">{item.name}</td>
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
        <Card className="w-full shadow-sm animate-enter" style={{ animationDelay: '700ms' }}>
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
                             <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                                className="shrink-0"
                            >
                                <Upload className="w-3 h-3 mr-1" /> Update DB
                            </Button>
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
                        onClick={() => setUploadStatus(null)}
                        className="shrink-0 hover:bg-black/5 rounded p-1 transition-colors"
                    >
                        <X className="w-4 h-4 opacity-50" />
                    </button>
                </div>
            )}
            
            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-32">Date</th>
                            <th className="px-4 py-3">Patient</th>
                            <th className="px-4 py-3">Hospital</th>
                            <th className="px-4 py-3 text-center w-32">Grade</th>
                            <th className="px-4 py-3">Suspected Agent(s)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                        {paginatedPatients.length > 0 ? (
                            paginatedPatients.map((p) => {
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
                                            {p.lastName}, {p.firstName}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                            {p.history.hospital || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={getGradeVariant(p.history.grade || 'Ungraded')} className="whitespace-nowrap text-[10px]">
                                                {(p.history.grade || 'Ungraded').split(' -')[0]}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 max-w-[300px] text-slate-600 dark:text-slate-400">
                                            <div className="flex flex-wrap gap-1">
                                                {(p.history.suspectedAgents || []).map((agent, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                                                        {agent}
                                                    </span>
                                                ))}
                                                {(p.history.suspectedAgents || []).length === 0 && '-'}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">
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
                    paginatedPatients.map(p => (
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
                                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                                        {formatDate(p.history.date)} • {p.history.hospital || 'Unknown Hospital'}
                                    </div>
                                </div>
                                <Badge variant={getGradeVariant(p.history.grade || 'Ungraded')} className="whitespace-nowrap text-[10px] shrink-0">
                                    {(p.history.grade || 'Ungraded').split(' -')[0]}
                                </Badge>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wide">Suspected Agents</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {(p.history.suspectedAgents || []).length > 0 ? (
                                        p.history.suspectedAgents.map((agent, i) => (
                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {agent}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 italic text-xs">None recorded</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
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