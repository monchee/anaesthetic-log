import React, { useEffect, useState, useMemo } from 'react';
import { Download, RefreshCw, AlertCircle, FlaskConical, ChevronDown, ChevronUp, Trash2, Database } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui';
import { fetchAllResults, exportToCsv, deleteResult } from '../services/ResearchService';
import { ResearchRecord } from '../types';

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
      onDelete();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete record.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 space-y-4">
      {/* Controls */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Controls</p>
        <div className="flex gap-4 text-xs text-slate-700 dark:text-slate-300">
          <span>Histamine SPT: <strong>{record.histamine_spt || '—'}</strong></span>
          <span>Saline SPT: <strong>{record.saline_spt || '—'}</strong></span>
          <span>Saline IDT: <strong>{record.saline_idt || '—'}</strong></span>
        </div>
      </div>

      {/* Test Panel */}
      {record.test_panel.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Test panel</p>
          <div className="border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  {['Drug', 'SPT', '1:100', '1:10', 'Neat', 'Result'].map(h => (
                    <th key={h} className="px-3 py-1.5 text-left font-medium text-slate-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {record.test_panel.map((d, i) => (
                  <tr key={i} className={d.is_positive ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                    <td className="px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200">{d.drug_name}</td>
                    <td className="px-3 py-1.5 text-slate-600 dark:text-slate-300">{d.spt_wheal || '—'}</td>
                    <td className="px-3 py-1.5 text-slate-600 dark:text-slate-300">{d.idt_100 || '—'}</td>
                    <td className="px-3 py-1.5 text-slate-600 dark:text-slate-300">{d.idt_10 || '—'}</td>
                    <td className="px-3 py-1.5 text-slate-600 dark:text-slate-300">{d.idt_neat || '—'}</td>
                    <td className="px-3 py-1.5">
                      {d.is_positive
                        ? <span className="text-red-600 dark:text-red-400 font-semibold">Positive</span>
                        : <span className="text-slate-400">Negative</span>
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
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Challenge test</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-700 dark:text-slate-300">
            <span>Drug: <strong>{record.challenge_drug || '—'}</strong></span>
            <span>Outcome: <strong className={record.challenge_outcome === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
              {record.challenge_outcome === 'SUCCESS' ? 'Pass' : record.challenge_outcome === 'UNSUCCESS' ? 'Fail' : '—'}
            </strong></span>
            {record.reaction_time && <span>Reaction time: <strong>{record.reaction_time}</strong></span>}
            {record.intervention_type && <span>Intervention: <strong>{record.intervention_type}</strong></span>}
          </div>
          {record.symptoms.length > 0 && (
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Symptoms: {record.symptoms.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Plan */}
      {record.plan && (
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Plan</p>
          <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{record.plan}</p>
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

export default function ResearchDashboard() {
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
        rate: ((v.positive / v.tested) * 100).toFixed(0),
      }))
      .sort((a, b) => b.positive - a.positive)
      .slice(0, 10);

    return {
      totalSubmissions: records.length,
      totalDrugs,
      totalPositive,
      overallPositivityRate: totalDrugs > 0 ? ((totalPositive / totalDrugs) * 100).toFixed(1) : '0.0',
      challengeCount: challenges.length,
      challengeSuccessRate:
        challenges.length > 0
          ? ((successfulChallenges.length / challenges.length) * 100).toFixed(0)
          : null,
      drugStats,
    };
  }, [records]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading research data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-600 dark:text-red-400">
        <AlertCircle className="w-6 h-6" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={load} className="rounded-none">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <Card className="shadow-sm rounded-none">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-none">
                <Database className="w-4 h-4 text-primary" />
              </div>
              Research Summary
            </CardTitle>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Submissions', value: stats.totalSubmissions },
              { label: 'Drugs tested', value: stats.totalDrugs },
              { label: 'Overall positivity', value: stats.totalDrugs > 0 ? `${stats.overallPositivityRate}%` : '—' },
              { label: 'Challenge success', value: stats.challengeSuccessRate !== null ? `${stats.challengeSuccessRate}%` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4">
                <div className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drug positivity breakdown */}
      <Card className="shadow-sm rounded-none">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-none">
              <FlaskConical className="w-4 h-4 text-primary" />
            </div>
            Positivity by Drug
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stats.drugStats.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.drugStats.map((d) => (
                <div key={d.name} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{d.name}</span>
                  <span className="text-slate-400 text-xs">{d.positive}/{d.tested} tested</span>
                  <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${parseInt(d.rate) >= 10 ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min(parseInt(d.rate), 100)}%` }}
                    />
                  </div>
                  <span className={`w-10 text-right text-xs font-semibold ${parseInt(d.rate) >= 10 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {d.rate}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
              <FlaskConical className="w-6 h-6" />
              <p className="text-sm">No data yet. Save a testing session to populate this chart.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Records list */}
      <Card className="shadow-sm rounded-none">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <CardTitle className="flex items-center justify-between gap-2 text-lg">
            <span className="flex items-center gap-2">
              <div className="bg-primary/10 dark:bg-primary/20 p-1.5 rounded-none">
                <Database className="w-4 h-4 text-primary" />
              </div>
              All Submissions
            </span>
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              {records.length} de-identified record{records.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
              <Database className="w-6 h-6" />
              <p className="text-sm">No submissions yet.</p>
              <p className="text-xs">Complete a testing session and click "Save to Research DB".</p>
            </div>
          ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((r) => {
              const isExpanded = expandedId === r.id;
              return (
                <div key={r.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">Visit </span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {r.visit_date ? new Date(r.visit_date).toLocaleDateString('en-AU') : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">REDCap </span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{r.redcap_id ?? '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500">Drugs </span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {r.total_drugs_tested} tested,{' '}
                          <span className={r.positive_count > 0 ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                            {r.positive_count} positive
                          </span>
                        </span>
                      </div>
                      <div>
                        {r.proceed_to_challenge ? (
                          <>
                            <span className="text-slate-400 dark:text-slate-500">Challenge </span>
                            <span className={`font-medium ${r.challenge_outcome === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400' : r.challenge_outcome === 'UNSUCCESS' ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
                              {r.challenge_outcome === 'SUCCESS' ? 'Pass' : r.challenge_outcome === 'UNSUCCESS' ? 'Fail' : '—'}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">No challenge</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-slate-400 dark:text-slate-500">
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
