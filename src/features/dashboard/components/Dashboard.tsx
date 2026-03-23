
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { parseRedcapCSV } from '@shared/utils';
import { Screen, Patient, LogFormData } from '@/types';
import { toast } from 'sonner';
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
  isLoadingPatients?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ existingPatients, recentLogs, drugOptions, drugCategories, onViewLog, onSelectPatient, onUploadPatients, databaseDate, isCustomData, isLoadingPatients }) => {
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

  // Trigger chart animations on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimateCharts(true));
    return () => cancelAnimationFrame(raf);
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
                        const dupDetail = duplicates.length > 3
                            ? `First few: ${duplicates.slice(0, 3).map(d => d.id).join(', ')}...`
                            : `IDs: ${duplicates.map(d => d.id).join(', ')}`;
                        toast.error('Duplicate records detected', {
                            description: `${duplicates.length} record(s) already exist in the database. ${dupDetail}`,
                            duration: 10000,
                        });
                    } else {
                        onUploadPatients(result.data, file.lastModified);
                        toast.success('Database updated', {
                            description: `Successfully loaded ${result.data.length} records from CSV.${result.details ? ` ${result.details.join(' ')}` : ''}`,
                        });
                        setIsSheetOpen(false);
                    }
                } else {
                    toast.error('Failed to parse CSV file', {
                        description: `${result.error || 'Please check the file format.'} Make sure the CSV was exported from REDCap and has the correct headers.`,
                        duration: 8000,
                    });
                }
              } catch {
                  toast.error('Error processing file', {
                      description: 'An unexpected error occurred. Please check the file format and try again.',
                      duration: 8000,
                  });
              } finally {
                  setIsUploading(false);
              }
          };
          reader.onerror = () => {
              toast.error('Error reading file', {
                  description: 'Failed to read the file. It may be corrupted or in an unsupported format. Please try exporting from REDCap again.',
                  duration: 8000,
              });
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
        <div style={{ '--section-index': 0 } as React.CSSProperties} className="animate-section-reveal">
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
        </div>

        {/* Screen reader announcement for search results */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
        </div>

        {/* Patient Database Table (Full Width) - Paginated */}
        <div style={{ '--section-index': 1 } as React.CSSProperties} className="animate-section-reveal">
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
            isLoading={isLoadingPatients}
          />
        </div>

        {/* Recent Skin Testing Activity Card */}
        <div style={{ '--section-index': 2 } as React.CSSProperties} className="animate-section-reveal">
          <RecentTestingActivity
            recentLogs={recentLogs}
            onViewLog={onViewLog}
          />
        </div>

        {/* Positive Skin Test Breakdown */}
        <div style={{ '--section-index': 3 } as React.CSSProperties} className="animate-section-reveal">
          <SkinTestBreakdown
            statsByCategory={analytics.statsByCategory}
            expandedCategories={expandedCategories}
            toggleCategory={toggleCategory}
            toggleAllCategories={toggleAllCategories}
          />
        </div>

    </div>
  );
};

export default Dashboard;
