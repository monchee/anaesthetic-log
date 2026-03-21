import React, { useEffect, useState, useMemo } from 'react';
import { Download, RefreshCw, AlertCircle, FlaskConical } from 'lucide-react';
import { Button } from '../../../../components/ui';
import { fetchAllResults, exportToCsv } from '../services/ResearchService';
import { ResearchRecord } from '../types';

export default function ResearchDashboard() {
  const [records, setRecords] = useState<ResearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (records.length === 0) return null;

    const totalDrugs = records.reduce((s, r) => s + r.total_drugs_tested, 0);
    const totalPositive = records.reduce((s, r) => s + r.positive_count, 0);
    const challenges = records.filter((r) => r.proceed_to_challenge);
    const successfulChallenges = challenges.filter((r) => r.challenge_outcome === 'SUCCESS');

    // Positivity by drug
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

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
        <FlaskConical className="w-8 h-8" />
        <p className="text-sm">No research submissions yet.</p>
        <p className="text-xs text-slate-400">Complete a testing session and click "Save to Research DB".</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {records.length} de-identified submission{records.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="rounded-none">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToCsv(records)} className="rounded-none">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Submissions', value: stats.totalSubmissions },
            { label: 'Drugs tested', value: stats.totalDrugs },
            { label: 'Overall positivity', value: `${stats.overallPositivityRate}%` },
            {
              label: 'Challenge success',
              value: stats.challengeSuccessRate !== null ? `${stats.challengeSuccessRate}%` : 'N/A',
            },
          ].map(({ label, value }) => (
            <div key={label} className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4">
              <div className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Drug positivity breakdown */}
      {stats && stats.drugStats.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Positivity by drug (top 10)
          </h3>
          <div className="border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {stats.drugStats.map((d) => (
              <div key={d.name} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{d.name}</span>
                <span className="text-slate-400 text-xs">{d.positive}/{d.tested} tested</span>
                <span
                  className={`w-12 text-right font-semibold ${
                    parseInt(d.rate) >= 10
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {d.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Records table */}
      <div>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">All submissions</h3>
        <div className="border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                {['Date submitted', 'Visit date', 'REDCap ID', 'Drugs', 'Positive', 'Challenge', 'Outcome'].map(
                  (h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString('en-AU')}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {r.visit_date ? new Date(r.visit_date).toLocaleDateString('en-AU') : '—'}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                    {r.redcap_id ?? <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-3 py-2 text-center text-slate-700 dark:text-slate-200">
                    {r.total_drugs_tested}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={
                        r.positive_count > 0
                          ? 'font-semibold text-red-600 dark:text-red-400'
                          : 'text-slate-500'
                      }
                    >
                      {r.positive_count}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                    {r.proceed_to_challenge ? (r.challenge_drug ?? '—') : <span className="text-slate-300 dark:text-slate-600">No</span>}
                  </td>
                  <td className="px-3 py-2">
                    {r.challenge_outcome === 'SUCCESS' && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Pass</span>
                    )}
                    {r.challenge_outcome === 'UNSUCCESS' && (
                      <span className="text-red-600 dark:text-red-400 font-medium">Fail</span>
                    )}
                    {!r.challenge_outcome && <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
