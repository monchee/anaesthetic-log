import React from 'react';
import { Card, CardHeader, CardTitle, Button } from '@/components/ui';
import { Thermometer, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

interface DrugStat {
  name: string;
  spt: number;
  idt100: number;
  idt10: number;
  idtNeat: number;
  challenge: number;
  total: number;
}

interface CategoryGroup {
  category: string;
  stats: DrugStat[];
}

interface SkinTestBreakdownProps {
  statsByCategory: CategoryGroup[];
  expandedCategories: string[];
  toggleCategory: (category: string) => void;
  toggleAllCategories: () => void;
}

const SkinTestBreakdown: React.FC<SkinTestBreakdownProps> = ({
  statsByCategory,
  expandedCategories,
  toggleCategory,
  toggleAllCategories,
}) => {
  const allCategories = statsByCategory.map(c => c.category);
  const areAllExpanded = allCategories.length > 0 && expandedCategories.length === allCategories.length;

  return (
    <Card className="w-full shadow-sm animate-enter-subtle">
      <CardHeader className="py-4 border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle as="h2" className="text-lg flex items-center gap-2 text-foreground">
              <Thermometer className="w-5 h-5 text-primary" /> Positive Skin Test Breakdown
            </CardTitle>
            <p className="text-sm text-muted-foreground">Number of positive patient reactions by drug (SPT/IDT &gt; 3mm or Positive Challenge).</p>
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
        <table className="min-w-[760px] md:min-w-full text-sm relative border-collapse">
          <thead className="bg-card text-xs uppercase text-muted-foreground font-semibold sticky top-0 z-10 shadow-sm">
            <tr>
              <th scope="col" className="px-4 py-3 text-left bg-card w-1/3">Drug</th>
              <th scope="col" className="px-4 py-3 text-center bg-card">SPT</th>
              <th scope="col" className="px-4 py-3 text-center bg-card">IDT 1:100</th>
              <th scope="col" className="px-4 py-3 text-center bg-card">IDT 1:10</th>
              <th scope="col" className="px-4 py-3 text-center bg-card">IDT Neat</th>
              <th scope="col" className="px-4 py-3 text-center bg-card">Challenge Pos</th>
              <th scope="col" className="px-4 py-3 text-center bg-muted/50 border-l border-border">Total Cases</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {statsByCategory.length > 0 ? (
              statsByCategory.map((categoryGroup, cIdx) => {
                const isExpanded = expandedCategories.includes(categoryGroup.category);
                const totalCategoryPositives = categoryGroup.stats.reduce((acc, curr) => acc + curr.total, 0);

                return (
                  <React.Fragment key={cIdx}>
                    <tr
                      style={{ '--row-index': Math.min(cIdx, 9) } as React.CSSProperties}
                      className="bg-card hover:bg-muted/80 border-b border-border transition-colors animate-row-enter"
                    >
                      <td colSpan={6} className="px-4 py-2.5">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 text-left section-label text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                          onClick={() => toggleCategory(categoryGroup.category)}
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${categoryGroup.category} skin test results`}
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                          {categoryGroup.category}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-center border-l border-border">
                        {totalCategoryPositives > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-medium bg-muted dark:bg-card text-foreground dark:text-primary">
                            <span className="tabular-nums">{totalCategoryPositives}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && categoryGroup.stats.map((item, i) => (
                      <tr key={i} className="hover:bg-muted/40 dark:hover:bg-card/50 transition-colors border-b border-border animate-in fade-in slide-in-from-top-1">
                        <td className="px-4 py-3 font-medium text-foreground/80 pl-10 border-l-4 border-l-primary hover:border-l-primary transition-[color,background-color,border-color,box-shadow]">{item.name}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">{item.spt || '-'}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">{item.idt100 || '-'}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">{item.idt10 || '-'}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">{item.idtNeat || '-'}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground tabular-nums">{item.challenge || '-'}</td>
                        <td className="px-4 py-3 text-center font-bold text-foreground bg-muted/30 dark:bg-card/30 border-l border-border tabular-nums">
                          {item.total || <span className="text-muted-foreground font-normal">-</span>}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground italic">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default React.memo(SkinTestBreakdown);
