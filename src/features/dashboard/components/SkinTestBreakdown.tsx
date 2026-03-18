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
      <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Thermometer className="w-5 h-5 text-primary" /> Positive Skin Test Breakdown
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
            {statsByCategory.length > 0 ? (
              statsByCategory.map((categoryGroup, cIdx) => {
                const isExpanded = expandedCategories.includes(categoryGroup.category);
                const totalCategoryPositives = categoryGroup.stats.reduce((acc, curr) => acc + curr.total, 0);

                return (
                  <React.Fragment key={cIdx}>
                    <tr
                      className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 cursor-pointer transition-colors"
                      onClick={() => toggleCategory(categoryGroup.category)}
                    >
                      <td colSpan={6} className="px-4 py-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                          {categoryGroup.category}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center border-l border-slate-200 dark:border-slate-800">
                        {totalCategoryPositives > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-medium bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-primary">
                            {totalCategoryPositives}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && categoryGroup.stats.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors border-b border-slate-50 dark:border-slate-900 animate-in fade-in slide-in-from-top-1">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 pl-10 border-l-4 border-l-primary hover:border-l-primary transition-all">{item.name}</td>
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
  );
};

export default React.memo(SkinTestBreakdown);
