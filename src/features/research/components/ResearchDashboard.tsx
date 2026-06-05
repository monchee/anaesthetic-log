import React, { useEffect, useState, useMemo } from 'react';
import { Download, RefreshCw, AlertCircle, FlaskConical, ChevronDown, ChevronUp, Trash2, Database, ClipboardList, TrendingUp, CheckCircle2, BarChart2, Trophy } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress, Skeleton } from '../../../../components/ui';
import { fetchAllResults, exportToCsv, deleteResult } from '../services/ResearchService';
import { ResearchRecord } from '../types';
import { Screen } from '@/types';
import { toast } from 'sonner';

function SubmissionDetail({ record, onDelete }: { record: ResearchRecord; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteResult(record.id);
      toast.success('Research record deleted');
      onDelete();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete record.';
      setDeleteError(message);
      toast.error('Failed to delete record', { description: message, duration: 8000 });
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="px-4 py-4 bg-slate-50 dark:bg-card/50 border-t border-border space-y-4">
      {/* Controls */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Controls</p>
        <div className="flex gap-4 text-xs text-slate-700 dark:text-foreground/80">
          <span>Histamine SPT: <strong>{record.histamine_spt || '—'}</strong></span>
          <span>Saline SPT: <strong>{record.saline_spt || '—'}</strong></span>
          <span>Saline IDT: <strong>{record.saline_idt || '—'}</strong></span>
        </div>
      </div>

      {/* Test Panel */}
      {record.test_panel.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Test panel</p>
          <div className="border border-border overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted border-b border-border">
                  {['Drug', 'SPT', 'IDT Results', 'Result'].map(h => (
                    <th key={h} className="px-3 py-1.5 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {record.test_panel.map((d, i) => (
                  <tr key={i} className={d.is_positive ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                    <td className="px-3 py-1.5 font-medium text-slate-700 dark:text-foreground/90">{d.drug_name}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{d.spt_wheal || '—'}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{d.idt_results || '—'}</td>
                    <td className="px-3 py-1.5">
                      {d.is_positive
                        ? <span className="text-red-600 dark:text-red-400 font-semibold">Positive</span>
                        : <span className="text-muted-foreground">Negative</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Challenge */}
      {record.proceed_to_challenge && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Challenge test</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-700 dark:text-foreground/80">
            <span>Drug: <strong>{record.challenge_drug || '—'}</strong></span>
            <span>Outcome: <strong className={record.challenge_outcome === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
              {record.challenge_outcome === 'SUCCESS' ? 'Pass' : record.challenge_outcome === 'UNSUCCESS' ? 'Fail' : '—'}
            </strong></span>
            {record.reaction_time && <span>Reaction time: <strong>{record.reaction_time}</strong></span>}
            {record.intervention_type && <span>Intervention: <strong>{record.intervention_type}</strong></span>}
          </div>
          {record.symptoms.length > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              Symptoms: {record.symptoms.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Plan */}
      {record.plan && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Plan</p>
          <p className="text-xs text-slate-700 dark:text-foreground/80 whitespace-pre-wrap">{record.plan}</p>
        </div>
      )}

      {/* Delete */}
      <div className="flex flex-col items-end gap-1 pt-1">
        {deleteError && (
          <p className="text-xs text-red-600 dark:text-red-400">{deleteError}</p>
        )}
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600 dark:text-red-400">Delete this record?</span>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="rounded-none text-xs h-7 px-2">
              {deleting ? 'Deleting…' : 'Confirm delete'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)} className="rounded-none text-xs h-7 px-2">
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleDelete} className="rounded-none text-xs h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete record
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ResearchDashboard({ setScreen }: { setScreen?: (screen: Screen) => void } = {}) {
  const [records, setRecords] = useState<ResearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllResults();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load research data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const totalDrugs = records.reduce((s, r) => s + r.total_drugs_tested, 0);
    const totalPositive = records.reduce((s, r) => s + r.positive_count, 0);
    const challenges = records.filter((r) => r.proceed_to_challenge);
    const successfulChallenges = challenges.filter((r) => r.challenge_outcome === 'SUCCESS');
    const positiveSessionCount = records.filter((r) => r.positive_count > 0).length;
    const avgDrugsPerSession = records.length > 0 ? (totalDrugs / records.length).toFixed(1) : null;

    const drugMap: Record<string, { tested: number; positive: number }> = {};
    for (const record of records) {
      for (const drug of record.test_panel) {
        if (!drugMap[drug.drug_name]) drugMap[drug.drug_name] = { tested: 0, positive: 0 };
        drugMap[drug.drug_name].tested += 1;
        if (drug.is_positive) drugMap[drug.drug_name].positive += 1;
      }
    }
    const drugStats = Object.entries(drugMap)
      .map(([name, v]) => ({
        name,
        tested: v.tested,
        positive: v.positive,
        rate: v.tested > 0 ? (v.positive / v.tested) * 100 : 0,
      }))
      .sort((a, b) => b.positive - a.positive)
      .slice(0, 10);

    return {
      totalSubmissions: records.length,
      totalDrugs,
      totalPositive,
      positiveSessionCount,
      avgDrugsPerSession,
      overallPositivityRate: totalDrugs > 0 ? ((totalPositive / totalDrugs) * 100).toFixed(1) : '0.0',
      challengeCount: challenges.length,
      challengeSuccessCount: successfulChallenges.length,
      challengeSuccessRate:
        challenges.length > 0
          ? ((successfulChallenges.length / challenges.length) * 100).toFixed(0)
          : null,
      drugStats,
    };
  }, [records]);

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    const isUnconfigured = error.includes('not configured') || error.includes('Failed to fetch');
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <Database className="w-8 h-8 text-muted-foreground" />
        <p className="font-medium text-foreground">
          {isUnconfigured ? 'Research database not available' : 'Could not load research data'}
        </p>
        <p className="text-sm text-muted-foreground max-w-sm">
          {isUnconfigured
            ? 'This feature requires a Supabase research database. Demo mode uses local data only.'
            : error}
        </p>
        {!isUnconfigured && (
          <Button variant="outline" size="sm" onClick={load} className="rounded-none">Retry</Button>
        )}
        {isUnconfigured && setScreen && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScreen(Screen.TECHNICAL_DOCUMENTATION)}
            className="rounded-none"
          >
            Learn about research setup →
          </Button>
        )}
      </div>
    );
  }

  const positivityColor = (rate: number) => {
    if (rate >= 25) return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400', badge: 'destructive' as const };
    if (rate >= 10) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'outline' as const };
    return { bar: 'bg-primary', text: 'text-primary', badge: 'secondary' as const };
  };

  return (
    <div className="space-y-4">

      {/* Header + stat cards */}
      <Card className="shadow-sm rounded-none">
        <CardHeader className="pb-3 border-b border-border bg-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-none">
                <Database className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Research Database</p>
                <p className="text-xs text-muted-foreground">{records.length} de-identified session{records.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load} className="rounded-none">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCsv(records)} disabled={records.length === 0} className="rounded-none">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Sessions */}
        <div className="border border-border border-l-4 border-l-blue-500 bg-background p-4 rounded-none">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sessions</span>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-none">
              <ClipboardList className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground tabular-nums leading-none mb-1">
            {stats.totalSubmissions}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.avgDrugsPerSession ? `avg ${stats.avgDrugsPerSession} drugs/session` : 'no data yet'}
          </div>
        </div>

        {/* Drugs tested */}
        <div className="border border-border border-l-4 border-l-violet-500 bg-background p-4 rounded-none">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Drugs Tested</span>
            <div className="bg-violet-50 dark:bg-violet-900/30 p-1.5 rounded-none">
              <FlaskConical className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground tabular-nums leading-none mb-1">
            {stats.totalDrugs}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.totalPositive > 0 ? `${stats.totalPositive} positive result${stats.totalPositive !== 1 ? 's' : ''}` : 'across all sessions'}
          </div>
        </div>

        {/* Overall positivity */}
        <div className="border border-border border-l-4 border-l-amber-500 bg-background p-4 rounded-none">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Positivity Rate</span>
            <div className="bg-amber-50 dark:bg-amber-900/30 p-1.5 rounded-none">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground tabular-nums leading-none mb-1">
            {stats.totalDrugs > 0 ? `${stats.overallPositivityRate}%` : '—'}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.positiveSessionCount > 0
              ? `${stats.positiveSessionCount} session${stats.positiveSessionCount !== 1 ? 's' : ''} with positives`
              : 'no positive results yet'}
          </div>
        </div>

        {/* Challenge pass rate */}
        <div className="border border-border border-l-4 border-l-emerald-500 bg-background p-4 rounded-none">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Challenge Pass</span>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 p-1.5 rounded-none">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground tabular-nums leading-none mb-1">
            {stats.challengeSuccessRate !== null ? `${stats.challengeSuccessRate}%` : '—'}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.challengeCount > 0
              ? `${stats.challengeSuccessCount}/${stats.challengeCount} challenge${stats.challengeCount !== 1 ? 's' : ''} passed`
              : 'no challenges recorded'}
          </div>
        </div>
        </div>
        </CardContent>
      </Card>

      {/* Drug positivity breakdown */}
      <Card className="shadow-sm rounded-none">
        <CardHeader className="pb-3 border-b border-border bg-card">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-none">
              <BarChart2 className="w-4 h-4 text-primary" />
            </div>
            Positivity by Drug
            {stats.drugStats.length > 0 && (
              <span className="text-xs font-normal text-muted-foreground ml-1">top {stats.drugStats.length}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stats.drugStats.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.drugStats.map((d, i) => {
                const { text } = positivityColor(d.rate);
                const isTop = i === 0 && d.positive > 0;
                return (
                  <div key={d.name} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-5 text-xs font-semibold text-muted-foreground tabular-nums text-right shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 font-medium text-sm text-slate-700 dark:text-foreground/90 flex items-center gap-2">
                      {d.name}
                      {isTop && <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                      {d.positive}/{d.tested}
                    </span>
                    <div className="w-28 sm:w-36 shrink-0">
                      <Progress value={Math.min(d.rate, 100)} className="h-2 rounded-none" />
                    </div>
                    <span className={`w-10 text-right text-xs font-bold tabular-nums shrink-0 ${text}`}>
                      {d.rate.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <BarChart2 className="w-6 h-6" />
              <p className="text-sm">No data yet. Save a testing session to populate this chart.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Records list */}
      <Card className="shadow-sm rounded-none">
        <CardHeader className="pb-3 border-b border-border bg-card">
          <CardTitle className="flex items-center justify-between gap-2 text-lg">
            <span className="flex items-center gap-2">
              <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-none">
                <Database className="w-4 h-4 text-primary" />
              </div>
              All Submissions
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {records.length} record{records.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <Database className="w-6 h-6" />
              <p className="text-sm">No submissions yet.</p>
              <p className="text-xs">Complete a testing session and click "Save to Research Database".</p>
            </div>
          ) : (
          <div className="divide-y divide-border">
            {records.map((r) => {
              const isExpanded = expandedId === r.id;
              return (
                <div key={r.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-card/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs">
                      <div>
                        <span className="text-muted-foreground">Visit </span>
                        <span className="font-medium text-slate-700 dark:text-foreground/90">
                          {r.visit_date ? new Date(r.visit_date).toLocaleDateString('en-AU') : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">REDCap </span>
                        <span className="font-medium text-slate-700 dark:text-foreground/90">{r.redcap_id ?? '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">{r.total_drugs_tested} drugs</span>
                        {r.positive_count > 0 ? (
                          <Badge variant="destructive" className="text-xs h-4 px-1.5 rounded-none">
                            {r.positive_count} +
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs h-4 px-1.5 rounded-none">all −</Badge>
                        )}
                      </div>
                      <div>
                        {r.proceed_to_challenge ? (
                          <span className={`font-medium ${r.challenge_outcome === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400' : r.challenge_outcome === 'UNSUCCESS' ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
                            Challenge: {r.challenge_outcome === 'SUCCESS' ? 'Pass' : r.challenge_outcome === 'UNSUCCESS' ? 'Fail' : '—'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No challenge</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-muted-foreground">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <SubmissionDetail
                      record={r}
                      onDelete={() => {
                        setRecords((prev) => prev.filter((x) => x.id !== r.id));
                        setExpandedId(null);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
