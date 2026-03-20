import React from 'react';
import { Card, CardHeader, CardTitle, Button, Input, Badge } from '@/components/ui';
import { ChevronLeft, ChevronRight, FileText, Search, Upload, Download } from 'lucide-react';
import { formatDate, getGradeVariant, parsePatientTimeline } from '@shared/utils';
import { Patient } from '@/types';
import { AdvancedSearchFilters, AdvancedSearchPanel } from './AdvancedSearchFilters';
import { CSVUploadInstructions } from './CSVUploadInstructions';
import { exportDeidentifiedCSV, downloadFile } from '@shared/utils/auditExporter';
import { SearchFilters } from '../hooks/useAdvancedSearch';

interface PatientTableProps {
  paginatedPatients: Patient[];
  filteredPatients: Patient[];
  currentPage: number;
  ITEMS_PER_PAGE: number;
  filters: SearchFilters;
  updateFilter: (key: keyof SearchFilters, value: any) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  suggestions: Record<string, string[]>;
  isFiltersExpanded: boolean;
  setIsFiltersExpanded: (expanded: boolean) => void;
  databaseDate: string;
  onSelectPatient: (patient: Patient) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  allPatients: Patient[];
}

const PatientTable: React.FC<PatientTableProps> = ({
  paginatedPatients,
  filteredPatients,
  currentPage,
  ITEMS_PER_PAGE,
  filters,
  updateFilter,
  clearFilters,
  activeFilterCount,
  suggestions,
  isFiltersExpanded,
  setIsFiltersExpanded,
  databaseDate,
  onSelectPatient,
  handleFileUpload,
  isSheetOpen,
  setIsSheetOpen,
  isUploading,
  fileInputRef,
  handleNextPage,
  handlePrevPage,
  allPatients,
}) => {
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);

  return (
    <Card className="w-full shadow-sm animate-enter-subtle">
      <CardHeader className="py-2.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Header Top Row: Title + Update Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <FileText className="w-5 h-5 text-primary" /> REDCap Record Database
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
                aria-label="Upload CSV file"
                className="hidden"
              />
              <CSVUploadInstructions
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                onUpload={handleFileUpload}
                isUploading={isUploading}
              />
              <Button
                onClick={() => {
                  const csv = exportDeidentifiedCSV(allPatients);
                  const date = new Date().toISOString().slice(0, 10);
                  downloadFile(csv, `audit-export-${date}.csv`, 'text/csv');
                }}
                size="sm"
                variant="outline"
                disabled={allPatients.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Audit Export
              </Button>
              <Button
                onClick={() => setIsSheetOpen(true)}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
            </div>
          </div>
          {/* Search & Filters Section */}
          <div className="space-y-3">
            {/* Row 1: Search Box + Filter Button Toggle */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                <Input
                  placeholder="Search by Name, MRN..."
                  aria-label="Search patients by name, medical record number (MRN), or city"
                  className="pl-9 h-9 bg-white dark:bg-slate-800"
                  value={filters.textQuery}
                  onChange={(e) => updateFilter('textQuery', e.target.value)}
                />
              </div>
              <AdvancedSearchFilters
                activeFilterCount={activeFilterCount}
                isExpanded={isFiltersExpanded}
                setIsExpanded={setIsFiltersExpanded}
              />
            </div>

            {/* Row 2: Expanded Filters */}
            {isFiltersExpanded && (
              <AdvancedSearchPanel
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
                suggestions={suggestions}
              />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table role="table" aria-label="Patient database" className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 w-28">Date</th>
              <th scope="col" className="px-4 py-3 w-48">Patient</th>
              <th scope="col" className="px-4 py-3">Procedure</th>
              <th scope="col" className="px-4 py-3 w-48">Timeline</th>
              <th scope="col" className="px-4 py-3 text-center w-28">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
            {paginatedPatients.length > 0 ? (
              paginatedPatients.map((p) => {
                const { events: timelineEvents } = parsePatientTimeline(p.history);
                return (
                  <tr
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
                    onClick={() => onSelectPatient(p)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectPatient(p);
                      }
                    }}
                    aria-label={`View details for patient: ${p.firstName} ${p.lastName}`}
                    title="Click to view patient details"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-xs">
                      {formatDate(p.history.date)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-primary transition-colors">
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
                              ${e.type === 'induction' ? 'bg-primary' : ''}
                              ${e.type === 'med' ? 'bg-slate-300' : ''}
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
                    <div className="font-bold text-slate-900 dark:text-slate-100">
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
                        ${e.type === 'induction' ? 'bg-primary' : ''}
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
          <div
            className="text-xs text-slate-500 dark:text-slate-400 sm:hidden"
            aria-live="polite"
            aria-atomic="true"
          >
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="h-8 px-2"
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <div
              className="text-xs font-medium text-slate-700 dark:text-slate-300 px-2 hidden sm:block"
              aria-live="polite"
              aria-atomic="true"
            >
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage * ITEMS_PER_PAGE >= filteredPatients.length}
              className="h-8 px-2"
              aria-label="Go to next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default React.memo(PatientTable);
