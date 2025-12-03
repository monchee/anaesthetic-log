import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, AccordionItem } from './ui';
import { LayoutDashboard, Users, AlertTriangle, Activity, Search, ArrowLeft, Ban, Syringe, FileText, Thermometer, Clock } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Screen, Patient, LogFormData } from '../types';

interface DashboardProps {
  setScreen: (screen: Screen) => void;
  existingPatients: Patient[];
  recentLogs: LogFormData[];
  drugOptions: string[];
  onViewLog: (log: LogFormData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setScreen, existingPatients, recentLogs, drugOptions, onViewLog }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // --- Analytics Calculation ---
  const analytics = useMemo(() => {
    const totalPatients = existingPatients.length + recentLogs.length;
    let grade3PlusCount = 0;
    
    // Drug Stats: { Name: { spt: 0, idt100: 0, idt10: 0, idtNeat: 0, challenge: 0, total: 0 } }
    const drugStats: Record<string, { spt: number, idt100: number, idt10: number, idtNeat: number, challenge: number, total: number }> = {};
    const symptomCounts: Record<string, number> = {};

    // 1. Process Existing Static Patients
    existingPatients.forEach(p => {
      // Grade Count
      if (p.history.grade.includes("III") || p.history.grade.includes("IV") || p.history.grade.includes("Cardiac Arrest")) {
        grade3PlusCount++;
      }

      // Agent Counts (Static data lacks specific test results, so we only add to 'total')
      p.history.suspectedAgents?.forEach(agent => {
        const normalized = agent.trim();
        if (!normalized) return;
        const isStandard = drugOptions.includes(normalized);
        const key = isStandard ? normalized : 'Other';

        if (!drugStats[key]) drugStats[key] = { spt: 0, idt100: 0, idt10: 0, idtNeat: 0, challenge: 0, total: 0 };
        drugStats[key].total += 1;
      });

      // Symptom Counts
      p.history.symptoms?.forEach(sym => {
         const normalized = sym.trim();
         if (normalized) {
            symptomCounts[normalized] = (symptomCounts[normalized] || 0) + 1;
         }
      });
    });

    // 2. Process Newly Added Logs (Granular Data)
    recentLogs.forEach(log => {
        // Challenge Positive
        if (log.proceedToChallenge && log.outcome === 'UNSUCCESS') {
             const key = drugOptions.includes(log.challengeDrug) ? log.challengeDrug : 'Other';
             if (!drugStats[key]) drugStats[key] = { spt: 0, idt100: 0, idt10: 0, idtNeat: 0, challenge: 0, total: 0 };
             drugStats[key].challenge += 1;
             drugStats[key].total += 1;
        }

        // Skin Test Positives
        log.testPanel.forEach(test => {
            const drugName = test.drugName === 'Other' ? (test.customName || 'Other') : test.drugName;
            const key = drugOptions.includes(drugName) ? drugName : 'Other';
            
            if (!drugStats[key]) drugStats[key] = { spt: 0, idt100: 0, idt10: 0, idtNeat: 0, challenge: 0, total: 0 };
            
            let isPositive = false;
            if (test.sptWheal && parseInt(test.sptWheal) >= 3) {
                drugStats[key].spt += 1;
                isPositive = true;
            }
            if (test.idt100 && parseInt(test.idt100) >= 3) {
                drugStats[key].idt100 += 1;
                isPositive = true;
            }
            if (test.idt10 && parseInt(test.idt10) >= 3) {
                drugStats[key].idt10 += 1;
                isPositive = true;
            }
            if (test.idtNeat && parseInt(test.idtNeat) >= 3) {
                drugStats[key].idtNeat += 1;
                isPositive = true;
            }

            if (isPositive) {
                drugStats[key].total += 1;
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

    // Find most common for the card
    const mostCommonAgentEntry = Object.entries(drugStats).sort(([, a], [, b]) => b.total - a.total)[0];
    
    // Find most common symptom
    const mostCommonSymptomEntry = Object.entries(symptomCounts).sort(([, a], [, b]) => b - a)[0];

    return {
      totalPatients,
      grade3PlusCount,
      mostCommonAgent: mostCommonAgentEntry?.[0] || 'N/A',
      mostCommonAgentCount: mostCommonAgentEntry?.[1]?.total || 0,
      mostCommonSymptom: mostCommonSymptomEntry?.[0] || 'N/A',
      sortedAgentsAlpha
    };
  }, [existingPatients, recentLogs, drugOptions]);

  // --- Filtering ---
  const filteredPatients = existingPatients.filter(p => 
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mrn.includes(searchTerm) ||
    p.history.suspectedAgents.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                <CardContent className="p-6 flex items-center h-full">
                    <div className="flex items-center gap-4 w-full">
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
                <CardContent className="p-6 flex items-center h-full">
                    <div className="flex items-center gap-4 w-full">
                        <div className="p-3 bg-red-50 rounded-full shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 truncate">Severe Reactions</p>
                            <h3 className="text-2xl font-bold text-slate-900">{analytics.grade3PlusCount}</h3>
                            <p className="text-xs text-slate-400 truncate">Grade III / IV</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 flex items-center h-full">
                    <div className="flex items-center gap-4 w-full">
                        <div className="p-3 bg-orange-50 rounded-full shrink-0">
                            <Syringe className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 truncate">Top Suspected Agent</p>
                            <h3 className="text-xl font-bold text-slate-900 truncate" title={analytics.mostCommonAgent}>
                                {analytics.mostCommonAgent}
                            </h3>
                            <p className="text-xs text-slate-400 truncate">{analytics.mostCommonAgentCount} cases</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 flex items-center h-full">
                    <div className="flex items-center gap-4 w-full">
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

        {/* Patient Database Table (Full Width) - Accordion */}
        <Card className="w-full shadow-sm">
            <CardHeader className="py-0 border-b border-slate-100 bg-slate-50/50 px-0">
                <AccordionItem
                    defaultOpen={true}
                    title={
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full pr-2">
                            <CardTitle className="text-lg text-[#441170] flex items-center gap-2">
                                <FileText className="w-5 h-5" /> REDCap Record Database
                            </CardTitle>
                            <div className="relative w-full sm:w-72" onClick={(e) => e.stopPropagation()}>
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input 
                                    placeholder="Search by Name, MRN, Agent..." 
                                    className="pl-9 h-9 bg-white" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    }
                    className="border-none"
                >
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                                <tr>
                                    <th className="px-4 py-3 w-32">Date</th>
                                    <th className="px-4 py-3">Patient</th>
                                    <th className="px-4 py-3">Hospital</th>
                                    <th className="px-4 py-3">Grade</th>
                                    <th className="px-4 py-3">Suspected Agent(s)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((p) => (
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
                                            <td className="px-4 py-3">
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
                </AccordionItem>
            </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;