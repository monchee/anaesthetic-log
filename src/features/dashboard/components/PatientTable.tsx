import React from 'react';
import { Card, CardHeader, CardTitle, Button, Input, Badge, Skeleton } from '@/components/ui';
import { ChevronLeft, ChevronRight, FileText, Search, Upload, Download } from 'lucide-react';
import { ACTIVE_REPORT_TTL_MS, formatDate, formatTime, getGradeVariant, parsePatientTimeline } from '@shared/utils';
import { Patient } from '@/types';
import { AdvancedSearchFilters, AdvancedSearchPanel } from './AdvancedSearchFilters';
import { CSVUploadInstructions } from './CSVUploadInstructions';
import { exportDeidentifiedCSV, downloadFile } from '@shared/utils/auditExporter';
import { AdvancedSearchFilters as SearchFilters } from '../hooks/useAdvancedSearch';

interface PatientTableProps {
  paginatedPatients: Patient[];
  filteredPatients: Patient[];
  currentPage: number;
  ITEMS_PER_PAGE: number;
  filters: SearchFilters;
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  suggestions: {
    procedures: string[];
    hospitals: string[];
    agents: string[];
  };
  isFiltersExpanded: boolean;
  setIsFiltersExpanded: (expanded: boolean) => void;
  databaseDate: string;
  isCustomData?: boolean;
  onSelectPatient: (patient: Patient) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  allPatients: Patient[];
  isLoading?: boolean;
  patientDbSavedAt?: number | null;
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
  isCustomData = false,
  onSelectPatient,
  handleFileUpload,
  isSheetOpen,
  setIsSheetOpen,
  isUploading,
  fileInputRef,
  handleNextPage,
  handlePrevPage,
  allPatients,
  isLoading = false,
  patientDbSavedAt,
}) => {
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const handleMobileCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, patient: Patient) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectPatient(patient);
    }
  };

  return (
    <Card className="w-full shadow-sm animate-enter-subtle">
      <CardHeader className="py-2.5 sm:py-4 border-b border-border bg-card">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Header Top Row: Title + Update Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <div className="space-y-1">
              <CardTitle as="h2" className="text-lg flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-primary" /> REDCap Record Database
              </CardTitle>
              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{isCustomData ? `Updated ${databaseDate}` : 'Demo data'}</span>
                {isCustomData && patientDbSavedAt !== null && patientDbSavedAt !== undefined ? (
                  <span>
                    Imported database · {allPatients.length} patients · expires {formatTime(patientDbSavedAt + ACTIVE_REPORT_TTL_MS)}
                  </span>
                ) : null}
                <span className="flex items-center gap-2" aria-label="Timeline legend">
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />Induction</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />Reaction</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-muted/60" aria-hidden="true" />Medication</span>
                </span>
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
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Search by Name, MRN..."
                  aria-label="Search patients by name, medical record number (MRN), or city"
                  className="pl-9 h-9 bg-muted"
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
        <table aria-label="Patient database" className="w-full text-sm text-left">
          <thead className="bg-card text-xs uppercase text-muted-foreground font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 w-28">Date</th>
              <th scope="col" className="px-4 py-3 w-48">Patient</th>
              <th scope="col" className="px-4 py-3">Procedure</th>
              <th scope="col" className="px-4 py-3 w-48">Timeline</th>
              <th scope="col" className="px-4 py-3 text-center w-28">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3 text-center"><Skeleton className="h-5 w-16 mx-auto" /></td>
                </tr>
              ))
            ) : paginatedPatients.length > 0 ? (
              paginatedPatients.map((p, index) => {
                const { events: timelineEvents } = parsePatientTimeline(p.history);
                return (
                  <tr
                    key={p.id}
                    style={{ '--row-index': Math.min(index, 9) } as React.CSSProperties}
                    className="hover:bg-slate-50/80 dark:hover:bg-card/50 transition-colors group animate-row-enter"
                    title="Click to view patient details"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono tabular-nums text-xs">
                      {formatDate(p.history.date)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors">
                      <button
                        type="button"
                        onClick={() => onSelectPatient(p)}
                        className="block max-w-[180px] truncate border-0 bg-transparent p-0 text-left font-medium text-foreground cursor-pointer group-hover:text-primary dark:group-hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        aria-label={`View details for patient: ${p.firstName} ${p.lastName}`}
                        title={`${p.lastName}, ${p.firstName}`}
                      >
                        {p.lastName}, {p.firstName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="line-clamp-1 max-w-xs" title={p.history.procedure}>
                        {p.history.procedure || <span className="italic text-muted-foreground">Unknown</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {timelineEvents.map((e, idx) => (
                          <div
                            key={idx}
                            role="img"
                            aria-label={`${e.type} event: ${e.time} - ${e.label}`}
                            className={`
                              h-2.5 w-2.5 rounded-full cursor-help inline-block
                              ${e.type === 'reaction' ? 'bg-red-500' : ''}
                              ${e.type === 'induction' ? 'bg-primary' : ''}
                              ${e.type === 'med' ? 'bg-slate-300 dark:bg-muted/60' : ''}
                            `}
                            title={`${e.time} - ${e.label}`}
                          />
                        ))}
                        {timelineEvents.length === 0 && <span className="text-muted-foreground text-xs">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={getGradeVariant(p.history.grade || 'Ungraded')}
                        className="whitespace-nowrap text-xs cursor-help w-20 justify-center"
                        title={p.history.grade || 'Ungraded'}
                      >
                        {(p.history.grade || 'Ungraded').split(' -')[0]}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            ) : activeFilterCount > 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                  No matching records found.
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8 opacity-40" aria-hidden="true" />
                    <p className="text-sm font-medium">No patient data loaded</p>
                    <p className="text-xs">Upload a REDCap CSV to get started.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View (Card List) */}
      <div className="md:hidden divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-border space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))
        ) : paginatedPatients.length > 0 ? (
          paginatedPatients.map((p, index) => {
            const { events: timelineEvents } = parsePatientTimeline(p.history);
            return (
              <div
                role="button"
                tabIndex={0}
                key={p.id}
                style={{ '--row-index': Math.min(index, 9) } as React.CSSProperties}
                className="block w-full p-2.5 text-left hover:bg-slate-50 dark:hover:bg-card/50 transition-colors cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 animate-row-enter focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => onSelectPatient(p)}
                onKeyDown={(event) => handleMobileCardKeyDown(event, p)}
                aria-label={`View details for patient: ${p.firstName} ${p.lastName}`}
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <div>
                    <div className="font-bold text-foreground">
                      {p.lastName}, {p.firstName}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-[200px]">
                      {formatDate(p.history.date)}
                    </div>
                  </div>
                  <Badge variant={getGradeVariant(p.history.grade || 'Ungraded')} className="whitespace-nowrap text-xs shrink-0 w-20 justify-center">
                    {(p.history.grade || 'Ungraded').split(' -')[0]}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground mt-1 line-clamp-1 italic">
                  {p.history.procedure || 'Unknown Procedure'}
                </div>

                <div className="flex items-center gap-1.5 mt-1.5">
                  {timelineEvents.map((e, idx) => (
                    <div
                      key={idx}
                      role="img"
                      aria-label={`${e.type} event: ${e.time} - ${e.label}`}
                      className={`
                        h-2 w-2 rounded-full
                        ${e.type === 'reaction' ? 'bg-red-500' : ''}
                        ${e.type === 'induction' ? 'bg-primary' : ''}
                        ${e.type === 'med' ? 'bg-slate-300 dark:bg-muted/60' : ''}
                      `}
                    />
                  ))}
                  {timelineEvents.length === 0 && <span className="text-xs text-muted-foreground">No timed events</span>}
                </div>
              </div>
            );
          })
        ) : activeFilterCount > 0 ? (
          <div className="p-8 text-center text-muted-foreground italic text-sm">
            No matching records found.
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="w-8 h-8 opacity-40" aria-hidden="true" />
              <p className="text-sm font-medium">No patient data loaded</p>
              <p className="text-xs">Upload a REDCap CSV to get started.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredPatients.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-slate-50/50 dark:bg-muted/20">
          <div className="text-xs text-muted-foreground hidden sm:block">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)} of {filteredPatients.length} records
          </div>
          <div
            className="text-xs text-muted-foreground sm:hidden"
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
              className="text-xs font-medium text-slate-700 dark:text-foreground/80 px-2 hidden sm:block"
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
