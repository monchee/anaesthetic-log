
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { parseRedcapCSV } from '@shared/utils';
import { Screen, Patient, LogFormData } from '@/types';
import toast from 'react-hot-toast';
import { useCountUp } from '@shared/hooks/useCountUp';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import AnalyticsPanel from './AnalyticsPanel';
import RecentTestingActivity from './RecentTestingActivity';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import PatientTable from './PatientTable';
import SkinTestBreakdown from './SkinTestBreakdown';

interface DashboardProps {
  setScreen: (screen: Screen) => void;
  existingPatients: Patient[];
  recentLogs: LogFormData[];
  drugOptions: string[];
  drugCategories: Record<string, string[]>;
  onViewLog: (log: LogFormData) => void;
  onSelectPatient: (patient: Patient) => void;
  onUploadPatients: (patients: Patient[], fileLastModified?: number) => void;
  databaseDate: string;
  isCustomData?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ existingPatients, recentLogs, drugOptions, drugCategories, onViewLog, onSelectPatient, onUploadPatients, databaseDate, isCustomData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [animateCharts, setAnimateCharts] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
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

      if (file) {
          setIsUploading(true);
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                const text = event.target?.result as string;
                const result = parseRedcapCSV(text);

                if (result.success) {
                    // Check for duplicate patient IDs
                    const existingIds = new Set(existingPatients.map(p => p.id));
                    const duplicates = result.data.filter(p => existingIds.has(p.id));

                    if (duplicates.length > 0) {
                        toast.error(
                            <div className="flex flex-col gap-1">
                                <span className="font-bold">Duplicate records detected</span>
                                <span className="text-sm font-normal">
                                    {duplicates.length} record(s) already exist in the database. Import would create duplicates.
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {duplicates.length > 3 ? `First few: ${duplicates.slice(0, 3).map(d => d.id).join(', ')}...` : `IDs: ${duplicates.map(d => d.id).join(', ')}`}
                                </span>
                            </div>,
                            { duration: 10000 }
                        );
                    } else {
                        onUploadPatients(result.data, file.lastModified);
                        toast.success(
                            <div className="flex flex-col gap-1">
                                <span className="font-bold">Database updated</span>
                                <span className="text-sm font-normal">Successfully loaded {result.data.length} records from CSV.</span>
                                {result.details && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                        {result.details.join(' ')}
                                    </span>
                                )}
                            </div>
                        );
                        setIsSheetOpen(false);
                    }
                } else {
                    toast.error(
                        <div className="flex flex-col gap-1">
                             <span className="font-bold">Failed to parse CSV file</span>
                             <span className="text-sm font-normal">{result.error || "Please check the file format."}</span>
                             <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Make sure the CSV was exported from REDCap and has the correct headers.
                             </span>
                        </div>,
                        { duration: 8000 }
                    );
                }
              } catch {
                  toast.error(
                    <div className="flex flex-col gap-1">
                         <span className="font-bold">Error processing file</span>
                         <span className="text-sm font-normal">An unexpected error occurred while processing the file.</span>
                         <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Please check the file format and try again. If the issue persists, contact IT support.
                         </span>
                    </div>,
                    { duration: 8000 }
                  );
              } finally {
                  setIsUploading(false);
              }
          };
          reader.onerror = () => {
              toast.error(
                <div className="flex flex-col gap-1">
                     <span className="font-bold">Error reading file</span>
                     <span className="text-sm font-normal">Failed to read the file. It may be corrupted or in an unsupported format.</span>
                     <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Please try exporting the CSV again from REDCap and upload the new file.
                     </span>
                </div>,
                { duration: 8000 }
              );
              setIsUploading(false);
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
        <PatientTable
          paginatedPatients={paginatedPatients}
          filteredPatients={filteredPatients}
          currentPage={currentPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          filters={filters}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          suggestions={suggestions}
          isFiltersExpanded={isFiltersExpanded}
          setIsFiltersExpanded={setIsFiltersExpanded}
          databaseDate={databaseDate}
          isCustomData={isCustomData}
          onSelectPatient={onSelectPatient}
          handleFileUpload={handleFileUpload}
          isSheetOpen={isSheetOpen}
          setIsSheetOpen={setIsSheetOpen}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          handleNextPage={handleNextPage}
          handlePrevPage={handlePrevPage}
          allPatients={existingPatients}
        />


        {/* Recent Skin Testing Activity Card */}
        <RecentTestingActivity
          recentLogs={recentLogs}
          onViewLog={onViewLog}
        />

        {/* Positive Skin Test Breakdown */}
        <SkinTestBreakdown
          statsByCategory={analytics.statsByCategory}
          expandedCategories={expandedCategories}
          toggleCategory={toggleCategory}
          toggleAllCategories={toggleAllCategories}
        />

    </div>
  );
};

export default Dashboard;
