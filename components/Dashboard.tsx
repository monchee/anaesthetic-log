
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, Button, Input, Badge, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui';
import { Search, Thermometer, Upload, ChevronLeft, ChevronDown, ChevronUp, X, CheckCircle2, ChevronRight, FileText, ExternalLink, FileUp, AlertTriangle } from 'lucide-react';
import { formatDate, parseRedcapCSV, getGradeVariant, parsePatientTimeline } from '../lib/utils';
import { Screen, Patient, LogFormData } from '../types';
import toast from 'react-hot-toast';
import { useCountUp } from '../hooks/useCountUp';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { AnalyticsPanel } from '../src/features/dashboard/components/AnalyticsPanel';
import { RecentTestingActivity } from '../src/features/dashboard/components/RecentTestingActivity';
import { useAdvancedSearch } from '../src/features/dashboard/hooks/useAdvancedSearch';
import { AdvancedSearchFilters, AdvancedSearchPanel } from '../src/features/dashboard/components/AdvancedSearchFilters';

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

const Dashboard: React.FC<DashboardProps> = ({ existingPatients, recentLogs, drugOptions, drugCategories, onViewLog, onSelectPatient, onUploadPatients, databaseDate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string, details?: string[] } | null>(null);
  const [animateCharts, setAnimateCharts] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced Search Hook
  const { filteredPatients, suggestions, filters, updateFilter, clearFilters, activeFilterCount } = useAdvancedSearch(existingPatients);

  const ITEMS_PER_PAGE = 10;

  // Trigger chart animations on mount - reduced delay for less aggressive animation
  useEffect(() => {
    const timer = setTimeout(() => setAnimateCharts(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // --- Analytics Calculation ---
  // --- Analytics Calculation ---
  const analytics = useDashboardAnalytics({
    existingPatients,
    recentLogs,
    drugOptions,
    drugCategories
  });

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

  // --- Pagination ---
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, existingPatients]);

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
        <AnalyticsPanel
          animatedTotalPatients={animatedTotalPatients}
          animatedSevereCount={animatedSevereCount}
          severeRate={severeRate}
          animatedAbandonedCount={animatedAbandonedCount}
          abandonedRate={abandonedRate}
          animatedAvgTime={animatedAvgTime}
          gradeCounts={analytics.gradeCounts}
          topAgents={analytics.topAgentsByCount}
          animateCharts={animateCharts}
        />

        {/* Screen reader announcement for search results */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
        </div>

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
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 items-center">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                accept=".csv" 
                                className="hidden" 
                            />
                            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                <SheetTrigger>
                                    <Button variant="outline" size="sm" className="shrink-0 h-9">
                                        <Upload className="w-3 h-3 mr-1.5" /> Upload CSV
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
                    </div>
                    {/* Search & Filters Section */}
                    <div className="space-y-3">
                        {/* Row 1: Search Box + Filter Button Toggle */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="relative flex-1 sm:flex-none sm:w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                                <Input
                                    placeholder="Search by Name, MRN..."
                                    aria-label="Search patients by name, medical record number (MRN), or city"
                                    className="pl-9 h-9 bg-white"
                                    value={filters.textQuery}
                                    onChange={(e) => updateFilter('textQuery', e.target.value)}
                                />
                            </div>
                            <AdvancedSearchFilters
                                isExpanded={isFiltersExpanded} 
                                setIsExpanded={setIsFiltersExpanded}
                                activeFilterCount={activeFilterCount}
                                clearFilters={clearFilters}
                            />
                        </div>

                        {/* Row 2: Expanded Filter Panel Content - Guaranteed to be below */}
                        {isFiltersExpanded && (
                            <div className="w-full animate-in fade-in slide-in-from-top-2 duration-200">
                                <AdvancedSearchPanel
                                    filters={filters}
                                    updateFilter={updateFilter}
                                    suggestions={suggestions}
                                    clearFilters={clearFilters}
                                    activeFilterCount={activeFilterCount}
                                />
                            </div>
                        )}
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
                                                className="whitespace-nowrap text-[10px] cursor-help w-20 justify-center"
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
                                className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer active:bg-slate-100 dark:active:bg-slate-800"
                                onClick={() => onSelectPatient(p)}
                            >
                                <div className="flex justify-between items-start mb-1 gap-2">
                                    <div>
                                        <div className="font-bold text-[#441170] dark:text-purple-300">
                                            {p.lastName}, {p.firstName}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">
                                            {formatDate(p.history.date)}
                                        </div>
                                    </div>
                                    <Badge variant={getGradeVariant(p.history.grade || 'Ungraded')} className="whitespace-nowrap text-[10px] shrink-0 w-20 justify-center">
                                        {(p.history.grade || 'Ungraded').split(' -')[0]}
                                    </Badge>
                                </div>

                                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-1 italic">
                                    {p.history.procedure || 'Unknown Procedure'}
                                </div>

                                <div className="flex items-center gap-1.5 mt-1.5">
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


        {/* Recent Skin Testing Activity Card */}
        <RecentTestingActivity
          recentLogs={recentLogs}
          onViewLog={onViewLog}
        />

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
            <div className="overflow-x-auto">
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

    </div>
  );
};

export default Dashboard;
