
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from './ui';
import { LayoutDashboard, Users, AlertTriangle, Activity, Search, ArrowLeft, Ban, Syringe, FileText, Thermometer, Clock, Upload, ChevronLeft, ChevronRight, BarChart3, PieChart } from 'lucide-react';
import { formatDate, parseRedcapCSV } from '../lib/utils';
import { Screen, Patient, LogFormData } from '../types';

interface DashboardProps {
  setScreen: (screen: Screen) => void;
  existingPatients: Patient[];
  recentLogs: LogFormData[];
  drugOptions: string[];
  onViewLog: (log: LogFormData) => void;
  onUploadPatients: (patients: Patient[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setScreen, existingPatients, recentLogs, drugOptions, onViewLog, onUploadPatients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 10;

  // --- Analytics Calculation ---
  const analytics = useMemo(() => {
    const totalPatients = existingPatients.length + recentLogs.length;
    let grade3PlusCount = 0;
    
    const drugStats: Record<string, { spt: number, idt100: number, idt10: number, idtNeat: number, challenge: number, total: number }> = {};
    const symptomCounts: Record<string, number> = {};
    const gradeCounts = { I: 0, II: 0, III: 0, IV: 0, Ungraded: 0 };

    // Helper to normalize and count agent usage
    const trackAgent = (agentName: string, isChallenge = false) => {
        const normalized = agentName.trim();
        if (!normalized) return;
        const isStandard = drugOptions.includes(normalized);
        const key = isStandard ? normalized : 'Other';

        if (!drugStats[key]) drugStats[key] = { spt: 0, idt100: 0, idt10: 0, idtNeat: 0, challenge: 0, total: 0 };
        drugStats[key].total += 1;
        if (isChallenge) drugStats[key].challenge += 1;
        return key;
    };

    // 1. Process Existing Static Patients
    existingPatients.forEach(p => {
      if (p.history.grade.includes("III") || p.history.grade.includes("IV") || p.history.grade.includes("Cardiac Arrest")) {
        grade3PlusCount++;
      }
      
      if (p.history.grade.includes("IV") || p.history.grade.includes("Cardiac Arrest")) gradeCounts.IV++;
      else if (p.history.grade.includes("III")) gradeCounts.III++;
      else if (p.history.grade.includes("II")) gradeCounts.II++;
      else if (p.history.grade.includes("I ") || p.history.grade === "Grade I") gradeCounts.I++;
      else gradeCounts.Ungraded++;

      p.history.suspectedAgents?.forEach(agent => trackAgent(agent));

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
             trackAgent(log.challengeDrug, true);
        }

        log.testPanel.forEach(test => {
            const drugName = test.drugName === 'Other' ? (test.customName || 'Other') : test.drugName;
            // Just tracking total counts for top level stats here, granular breakdown is in table below
            let isPositive = false;
            if ((test.sptWheal && parseInt(test.sptWheal) >= 3) || 
                (test.idt100 && parseInt(test.idt100) >= 3) ||
                (test.idt10 && parseInt(test.idt10) >= 3) || 
                (test.idtNeat && parseInt(test.idtNeat) >= 3)) {
                isPositive = true;
            }

            if (isPositive) {
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

    // Sort Agents
    const sortedAgentsAlpha = Object.entries(drugStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => {
          if (a.name === 'Other') return 1;
          if (b.name === 'Other') return -1;
          return a.name.localeCompare(b.name);
      });

    const topAgentsByCount = Object.entries(drugStats)
        .map(([name, stats]) => ({ name, count: stats.total }))
        .sort((a, b) => {
             // Force Other to bottom
             if (a.name === 'Other') return 1;
             if (b.name === 'Other') return -1;
             return b.count - a.count;
        })
        .slice(0, 5);

    const mostCommonAgentEntry = Object.entries(drugStats).sort(([, a], [, b]) => b.total - a.total)[0];
    const mostCommonSymptomEntry = Object.entries(symptomCounts).sort(([, a], [, b]) => b - a)[0];

    return {
      totalPatients,
      grade3PlusCount,
      mostCommonAgent: mostCommonAgentEntry?.[0] || 'N/A',
      mostCommonAgentCount: mostCommonAgentEntry?.[1]?.total || 0,
      mostCommonSymptom: mostCommonSymptomEntry?.[0] || 'N/A',
      sortedAgentsAlpha,
      gradeCounts,
      topAgentsByCount
    };
  }, [existingPatients, recentLogs, drugOptions]);

  // --- Handle File Upload ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const text = event.target?.result as string;
              const parsedPatients = parseRedcapCSV(text);
              if (parsedPatients.length > 0) {
                  onUploadPatients(parsedPatients);
              } else {
                  alert("No valid patient records found in CSV.");
              }
          };
          reader.readAsText(file);
      }
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

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-[#fbfaff] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#441170] text-white p-4 shadow-md flex justify-between items-center no-print">
        <h1 className="font-bold text-lg flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" /> Clinical Dashboard
        </h1>
        <Button onClick={() => setScreen('log')} variant="headerAction" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Log
        </Button>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-[#8055f1] shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 flex flex-col justify-center items-start h-full">
                    <div className="flex items-center gap-4 w-full mb-2">
                        <div className="p-3 bg-[#e6e1fd] rounded-full shrink-0">
                            <Users className="w-6 h-6 text-[#8055f1]" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 truncate">Total Records</p>
                            <h3 className="text-2xl font-bold text-slate-900">{analytics.totalPatients}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 flex flex-col justify-center items-start h-full">
                    <div className="flex items-center gap-4 w-full mb-2">
                        <div className="p-3 bg-red-50 rounded-full shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 truncate">Severe Reactions</p>
                            <h3 className="text-2xl font-bold text-slate-900">{analytics.grade3PlusCount}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 truncate pl-[3.5rem]">Grade III / IV</p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 flex flex-col justify-center items-start h-full">
                    <div className="flex items-center gap-4 w-full mb-2">
                        <div className="p-3 bg-orange-50 rounded-full shrink-0">
                            <Syringe className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 truncate">Top Suspected Agent</p>
                            <h3 className="text-xl font-bold text-slate-900 truncate" title={analytics.mostCommonAgent}>
                                {analytics.mostCommonAgent}
                            </h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 truncate pl-[3.5rem]">{analytics.mostCommonAgentCount} cases</p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 flex flex-col justify-center items-start h-full">
                    <div className="flex items-center gap-4 w-full mb-2">
                        <div className="p-3 bg-blue-50 rounded-full shrink-0">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 truncate">Common Symptom</p>
                            <h3 className="text-xl font-bold text-slate-900 truncate" title={analytics.mostCommonSymptom}>
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
                <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-lg text-[#441170] flex items-center gap-2">
                        <PieChart className="w-5 h-5" /> Reaction Severity Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex h-12 w-full rounded-lg overflow-hidden mb-6">
                        {analytics.gradeCounts.I > 0 && (
                            <div style={{ width: `${(analytics.gradeCounts.I / analytics.totalPatients) * 100}%` }} className="bg-blue-400 h-full" title={`Grade I: ${analytics.gradeCounts.I}`} />
                        )}
                        {analytics.gradeCounts.II > 0 && (
                            <div style={{ width: `${(analytics.gradeCounts.II / analytics.totalPatients) * 100}%` }} className="bg-yellow-400 h-full" title={`Grade II: ${analytics.gradeCounts.II}`} />
                        )}
                        {analytics.gradeCounts.III > 0 && (
                            <div style={{ width: `${(analytics.gradeCounts.III / analytics.totalPatients) * 100}%` }} className="bg-orange-500 h-full" title={`Grade III: ${analytics.gradeCounts.III}`} />
                        )}
                        {analytics.gradeCounts.IV > 0 && (
                            <div style={{ width: `${(analytics.gradeCounts.IV / analytics.totalPatients) * 100}%` }} className="bg-red-600 h-full" title={`Grade IV: ${analytics.gradeCounts.IV}`} />
                        )}
                        {analytics.gradeCounts.Ungraded > 0 && (
                            <div style={{ width: `${(analytics.gradeCounts.Ungraded / analytics.totalPatients) * 100}%` }} className="bg-slate-200 h-full" title={`Ungraded: ${analytics.gradeCounts.Ungraded}`} />
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                            <span className="text-slate-600">Grade I: <span className="font-bold text-slate-900">{analytics.gradeCounts.I}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                            <span className="text-slate-600">Grade II: <span className="font-bold text-slate-900">{analytics.gradeCounts.II}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                            <span className="text-slate-600">Grade III: <span className="font-bold text-slate-900">{analytics.gradeCounts.III}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-600"></span>
                            <span className="text-slate-600">Grade IV: <span className="font-bold text-slate-900">{analytics.gradeCounts.IV}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                            <span className="text-slate-600">Ungraded: <span className="font-bold text-slate-900">{analytics.gradeCounts.Ungraded}</span></span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Suspected Agents Chart */}
            <Card className="shadow-sm">
                <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-lg text-[#441170] flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" /> Top 5 Suspected Agents
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {analytics.topAgentsByCount.map((agent, idx) => {
                        const max = analytics.topAgentsByCount[0]?.count || 1;
                        const percentage = (agent.count / max) * 100;
                        return (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-sm font-medium text-slate-700">
                                    <span>{agent.name}</span>
                                    <span>{agent.count}</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-[#8055f1] rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>

        {/* Recent Skin Testing Activity Card */}
        <Card className="w-full shadow-sm border-t-4 border-t-green-500">
            <CardHeader className="py-4 border-b border-slate-100 bg-green-50/50">
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Recent Skin Testing Activity
                </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Patient</th>
                            <th className="px-4 py-3">Results (SPT/IDT)</th>
                            <th className="px-4 py-3">Challenge Outcome</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {recentLogs.length > 0 ? (
                            recentLogs.map((log, idx) => {
                                const positives: string[] = [];
                                const negatives: string[] = [];

                                log.testPanel.forEach(t => {
                                    const isPos = (parseInt(t.sptWheal || '0') >= 3) || 
                                                  (parseInt(t.idt100 || '0') >= 3) || 
                                                  (parseInt(t.idt10 || '0') >= 3) || 
                                                  (parseInt(t.idtNeat || '0') >= 3);
                                    if (isPos) {
                                        positives.push(t.drugName);
                                    } else {
                                        negatives.push(t.drugName);
                                    }
                                });
                                
                                return (
                                    <tr 
                                        key={idx} 
                                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                                        onClick={() => onViewLog(log)}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500 group-hover:text-slate-700">{formatDate(log.visitDate)}</td>
                                        <td className="px-4 py-3 font-medium text-[#441170] group-hover:text-[#6b42d1]">{log.lastName}, {log.firstName}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1 items-center">
                                                {positives.map(p => <Badge key={p} variant="danger" className="text-[10px] px-1.5 py-0 h-5">{p}</Badge>)}
                                                {negatives.map(n => <span key={n} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{n}</span>)}
                                                {positives.length === 0 && negatives.length === 0 && <span className="text-slate-400 italic text-xs">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {log.proceedToChallenge ? (
                                                log.outcome === 'SUCCESS' 
                                                ? <Badge variant="success" className="text-[10px]">Negative Challenge</Badge> 
                                                : <Badge variant="danger" className="text-[10px]">Positive Challenge</Badge>
                                            ) : <span className="text-slate-500">No Challenge</span>}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">
                                    No recent activity recorded in this session.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>

        {/* Top Suspected Agents Table (Full Width) */}
        <Card className="w-full shadow-sm">
            <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg text-[#441170] flex items-center gap-2">
                    <Thermometer className="w-5 h-5" /> Positive Skin Test Breakdown
                </CardTitle>
                <p className="text-sm text-slate-500">Number of positive patient reactions by drug (SPT/IDT &gt; 3mm or Positive Challenge). Organised alphabetically.</p>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-4 py-3 text-left">Drug</th>
                            <th className="px-4 py-3 text-center">SPT</th>
                            <th className="px-4 py-3 text-center">IDT 1:100</th>
                            <th className="px-4 py-3 text-center">IDT 1:10</th>
                            <th className="px-4 py-3 text-center">IDT Neat</th>
                            <th className="px-4 py-3 text-center">Challenge Positive</th>
                            <th className="px-4 py-3 text-center bg-slate-100/50">Total Cases</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {analytics.sortedAgentsAlpha.length > 0 ? (
                            analytics.sortedAgentsAlpha.map((item, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-[#441170]">{item.name}</td>
                                    {/* These columns are only populated by recent live logs for now, static data has placeholders for specific tests */}
                                    <td className="px-4 py-3 text-center text-slate-500">{item.spt || '-'}</td>
                                    <td className="px-4 py-3 text-center text-slate-500">{item.idt100 || '-'}</td>
                                    <td className="px-4 py-3 text-center text-slate-500">{item.idt10 || '-'}</td>
                                    <td className="px-4 py-3 text-center text-slate-500">{item.idtNeat || '-'}</td>
                                    <td className="px-4 py-3 text-center text-slate-500">{item.challenge || '-'}</td>
                                    <td className="px-4 py-3 text-center font-bold text-slate-900 bg-slate-50/30 border-l border-slate-100">
                                        {item.total}
                                    </td>
                                </tr>
                            ))
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
            <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <CardTitle className="text-lg text-[#441170] flex items-center gap-2">
                            <FileText className="w-5 h-5" /> REDCap Record Database
                            <span className="text-xs font-normal text-slate-400 ml-2">(Updated 03/12/2025)</span>
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
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-32">Date</th>
                            <th className="px-4 py-3">Patient</th>
                            <th className="px-4 py-3">Hospital</th>
                            <th className="px-4 py-3 text-center w-32">Grade</th>
                            <th className="px-4 py-3">Suspected Agent(s)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {paginatedPatients.length > 0 ? (
                            paginatedPatients.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-xs">
                                        {formatDate(p.history.date)}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-[#441170]">
                                        {p.lastName}, {p.firstName}
                                        <div className="text-xs text-slate-400 font-normal block sm:hidden">{p.history.hospital}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                                        {p.history.hospital || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant={
                                            p.history.grade.includes("III") || p.history.grade.includes("IV") 
                                            ? "danger" 
                                            : p.history.grade.includes("II") ? "warning" : "default"
                                        } className="whitespace-nowrap text-[10px]">
                                            {p.history.grade.split(' -')[0]}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 max-w-[300px] text-slate-600">
                                        <div className="flex flex-wrap gap-1">
                                            {p.history.suspectedAgents.map((agent, i) => (
                                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                                    {agent}
                                                </span>
                                            ))}
                                            {p.history.suspectedAgents.length === 0 && '-'}
                                        </div>
                                    </td>
                                </tr>
                            ))
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
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                    <div className="text-xs text-slate-500">
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
                        <div className="text-xs font-medium text-slate-700 px-2">
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
    </div>
  );
};

export default Dashboard;
