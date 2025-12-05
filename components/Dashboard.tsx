import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from './ui';
import { Users, AlertTriangle, Activity, Search, Syringe, FileText, Thermometer, Clock, Upload, ChevronLeft, ChevronRight, BarChart3, PieChart, ChevronDown, ChevronUp, X, CheckCircle2, ChevronRight as ChevronRightIcon } from 'lucide-react';
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

const Dashboard: React.FC<DashboardProps> = ({ setScreen, existingPatients, recentLogs, drugOptions, drugCategories, onViewLog, onSelectPatient, onUploadPatients, databaseDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string, details?: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 10;

  // --- Analytics Calculation ---
  const analytics = useMemo(() => {
    const totalPatients = existingPatients.length + recentLogs.length;
    let grade3PlusCount = 0;
    
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
    const trackAgent = (agentName: string, isChallenge = false) => {
        const normalized = agentName.trim();
        if (!normalized) return null;
        
        // Check if agent is in our standard list (keys of drugStats)
        // If it exists in drugStats (even with 0 count), use that key. Otherwise 'Other'.
        // This handles standard drugs appearing in history.
        let key = 'Other';
        if (Object.prototype.hasOwnProperty.call(drugStats, normalized)) {
            key = normalized;
        }

        drugStats[key].total += 1;
        if (isChallenge) drugStats[key].challenge += 1;
        return key;
    };

    // 1. Process Existing Static Patients
    existingPatients.forEach(p => {
      const grade = p.history.grade;
      if (grade.includes("III") || grade.includes("IV") || grade.includes("Cardiac Arrest")) {
        grade3PlusCount++;
      }
      
      if (grade.includes("IV") || grade.includes("Cardiac Arrest")) gradeCounts.IV++;
      else if (grade.includes("III")) gradeCounts.III++;
      else if (grade.includes("II")) gradeCounts.II++;
      else if (grade.includes("I ") || grade === "Grade I") gradeCounts.I++;
      else gradeCounts.Ungraded++;

      // Track agents from all sources (Pre, Post, Other)
      p.history.suspectedAgents?.forEach(agent => trackAgent(agent));
      p.history.preInductionDrugs?.forEach(str => trackAgent(str.split('@')[0].trim()));
      p.history.postInductionDrugs?.forEach(str => trackAgent(str.split('@')[0].trim()));

      p.history.symptoms?.forEach(sym => {
         const normalized = sym.trim();
         if (normalized) {
            symptomCounts[normalized] = (symptomCounts[normalized] || 0) + 1;
         }
      });
    });

    // 2. Process Newly Added Logs
    recentLogs.forEach(log => {
        // Grade Estimation for new logs
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
             trackAgent(drugName, true);
        }

        log.testPanel.forEach(test => {
            const drugName = test.drugName === 'Other' ? (test.customName || 'Other') : test.drugName;
            
            if (isSkinTestPositive(test)) {
                const key = trackAgent(drugName);
                // Update specific stats if we tracked it
                if (key) {
                    if (test.sptWheal && parseInt(test.sptWheal) >= 3) drugStats[key].spt++;
                    if (test.idt100 && parseInt(test.idt100) >= 3) drugStats[key].idt100++;
                    if (test.idt10 && parseInt(test.idt10) >= 3) drugStats[key].idt10++;
                    if (test.idtNeat && parseInt(test.idtNeat) >= 3) drugStats[key].idtNeat++;
                }
            }
        });
    });

    // Sort Agents for Chart (By Count Descending), filtering out 0 counts
    const topAgentsByCount = Object.entries(drugStats)
        .filter(([name, stats]) => stats.total > 0 && name !== 'Other') // Filter out 0 counts and 'Other' for cleaner top 5
        .map(([name, stats]) => ({ name, count: stats.total }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    if (topAgentsByCount.length < 5 && drugStats['Other'].total > 0) {
        topAgentsByCount.push({ name: 'Other', count: drugStats['Other'].total });
    }

    const mostCommonAgentEntry = Object.entries(drugStats)
        .sort(([, a], [, b]) => b.total - a.total)[0];
        
    const mostCommonSymptomEntry = Object.entries(symptomCounts).sort(([, a], [, b]) => b - a)[0];

    // Prepare Categorized Stats
    const statsByCategory = Object.entries(drugCategories).map(([category, drugs]) => {
        const categoryStats = (drugs as string[]).map(drugName => ({
            name: drugName,
            ...drugStats[drugName]
        }));
        return { category, stats: categoryStats };
    });
    
    // Add "Uncategorized / Other" stats if any events in 'Other' bucket
    if (drugStats['Other'].total > 0) {
        // Find if "Others" category exists to append, or create new
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
      mostCommonAgent: mostCommonAgentEntry?.[1].total > 0 ? mostCommonAgentEntry?.[0] : 'N/A',
      mostCommonAgentCount: mostCommonAgentEntry?.[1]?.total || 0,
      mostCommonSymptom: mostCommonSymptomEntry?.[0] || 'N/A',
      statsByCategory,
      gradeCounts,
      topAgentsByCount
    };
  }, [existingPatients, recentLogs, drugOptions, drugCategories]);

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
      
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Filtering & Pagination ---
  const filteredPatients = existingPatients.filter(p => 
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mrn.includes(searchTerm) ||
    p.history.suspectedAgents.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset page when search or data changes
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

  // Toggle Category Accordion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
        prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Toggle All Categories
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
    <div className="p-6 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-[#8055f1] shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 flex flex-col justify-center items-start h-full">
                    <div className="flex items-center gap-4 w-full mb-2">
                        <div className="p-3 bg-[#e6e1fd] dark:bg-purple-900/40 rounded-full shrink-0">
                            <Users className="w-6 h-6 text-[#8055f1] dark:text-purple-300" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Total Records</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.totalPatients}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 flex flex-col justify-center items-start h-full">
                    <div className="flex items-center gap-4 w-full mb-2">
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-full shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Severe Reactions</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.grade3PlusCount}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate pl-[3.5rem]">Grade III / IV</p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 flex flex-col justify-center items-start h-full">
                    <div className="flex items-center gap-4 w-full mb-2">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-full shrink-0">
                            <Syringe className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Top Suspected Agent</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate" title={analytics.mostCommonAgent}>
                                {analytics.mostCommonAgent}
                            </h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate pl-[3.5rem]">{analytics.mostCommonAgentCount} cases</p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 flex flex-col justify-center items-start h-full">
                    <div className="flex items-center gap-4 w-full mb-2">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full shrink-0">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Common Symptom</p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate" title={analytics.mostCommonSymptom}>
                                {analytics.mostCommonSymptom}
                            </h3>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* --- Charts Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Reaction Grade Distribution */}
            <Card className="shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <CardTitle className="text-lg text-[#441170] dark:text-purple-300 flex items-center gap-2">
                        <PieChart className="w-5 h-5" /> Reaction Severity Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex h-12 w-full rounded-lg overflow-hidden mb-6">
                        {analytics.gradeCounts.I > 0 && (
                            <div style={{ width: `${(analytics.gradeCounts.I / analytics.totalPatients) * 100}%` }} className="bg-blue-400 dark:bg-blue-500 h-full" title={`Grade I: ${analytics.gradeCounts.I}`} />
                        )}
                        {analytics.gradeCounts.II > 0 && (
                            <div style={{ width: `${(analytics.gradeCounts.II / analytics.totalPatients) * 100}%` }} className="bg-amber-400 dark:bg-amber-500 h-full" title={`Grade II: ${analytics.gradeCounts.II}`} />
                        )}
                        {analytics.gradeCounts.III > 0 && (
                            <div style={{ width: `${(analytics.gradeCounts.III / analytics.totalPatients) * 100}%` }} className="bg-orange-500 dark:bg-orange-600 h-full" title={`Grade III: ${analytics.gradeCounts.III}`} />
                        )}
                        {analytics.gradeCounts.IV > 0 && (
                            <div style={{ width: `${(analytics.gradeCounts.IV / analytics.totalPatients) * 100}%` }} className="bg-red-600 dark:bg-red-600 h-full" title={`Grade IV: ${analytics.gradeCounts.IV}`} />
                        )}
                        {analytics.gradeCounts.Ungraded > 0 && (
                            <div style={{ width: `${(analytics.gradeCounts.Ungraded / analytics.totalPatients) * 100}%` }} className="bg-slate-200 dark:bg-slate-700 h-full" title={`Ungraded: ${analytics.gradeCounts.Ungraded}`} />
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-500"></span>
                            <span className="text-slate-600 dark:text-slate-400">Grade I: <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.gradeCounts.I}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500"></span>
                            <span className="text-slate-600 dark:text-slate-400">Grade II: <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.gradeCounts.II}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-orange-500 dark:bg-orange-600"></span>
                            <span className="text-slate-600 dark:text-slate-400">Grade III: <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.gradeCounts.III}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-600"></span>
                            <span className="text-slate-600 dark:text-slate-400">Grade IV: <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.gradeCounts.IV}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                            <span className="text-slate-600 dark:text-slate-400">Ungraded: <span className="font-bold text-slate-900 dark:text-slate-100">{analytics.gradeCounts.Ungraded}</span></span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Suspected Agents Chart */}
            <Card className="shadow-sm">
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
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span>{agent.name}</span>
                                        <span>{agent.count}</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#8055f1] dark:bg-purple-500 rounded-full" 
                                            style={{ width: `${percentage}%` }}
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
        <Card className="w-full shadow-sm border-t-4 border-t-green-500">
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
        <Card className="w-full shadow-sm">
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
                                                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
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
        <Card className="w-full shadow-sm">
            <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <CardTitle className="text-lg text-[#441170] dark:text-purple-300 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> REDCap Record Database
                            <span className="text-xs font-normal text-slate-400 ml-2">(Updated {databaseDate})</span>
                        </CardTitle>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
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
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search by Name, MRN, Agent..." 
                            className="pl-9 h-9 bg-white" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>

            {/* Upload Status Banner */}
            {uploadStatus && (
                <div className={`p-4 mx-6 mt-4 rounded-md flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${
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
            
            <div className="overflow-x-auto">
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
                                            <div className="text-xs text-slate-400 font-normal block sm:hidden">{p.history.hospital}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                                            {p.history.hospital || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={getGradeVariant(p.history.grade)} className="whitespace-nowrap text-[10px]">
                                                {p.history.grade.split(' -')[0]}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 max-w-[300px] text-slate-600 dark:text-slate-400">
                                            <div className="flex flex-wrap gap-1">
                                                {p.history.suspectedAgents.map((agent, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                                                        {agent}
                                                    </span>
                                                ))}
                                                {p.history.suspectedAgents.length === 0 && '-'}
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

            {/* Pagination Controls */}
            {filteredPatients.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)} of {filteredPatients.length} records
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
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 px-2">
                            Page {currentPage} of {Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage * ITEMS_PER_PAGE >= filteredPatients.length}
                            className="h-8 px-2"
                        >
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    </div>
  );
};

export default Dashboard;