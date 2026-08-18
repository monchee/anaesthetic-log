import { supabase } from '../../../lib/supabase';
import { LogFormData, DrugTestRow } from '@shared/types';
import { ResearchSubmission, ResearchRecord } from '../types';
import { SKIN_TEST_POSITIVE_THRESHOLD } from '@shared/utils/constants';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'unknown';

const TABLE = 'research_submissions';

function isSkinTestPositive(test: DrugTestRow): boolean {
  const check = (v: string | undefined) => (parseInt(v ?? '0', 10) || 0) >= SKIN_TEST_POSITIVE_THRESHOLD;
  if (check(test.sptWheal)) return true;
  if (test.idtResults?.some(v => check(v))) return true;
  return check(test.idt100) || check(test.idt10) || check(test.idtNeat);
}

export function deidentify(formData: LogFormData, redcapId?: string): ResearchSubmission {
  const testPanel = formData.testPanel.map((t) => ({
    drug_name: t.customName || t.drugName,
    spt_wheal: t.sptWheal,
    idt_results: t.idtResults?.length
      ? t.idtResults.join(' | ')
      : [t.idt100, t.idt10, t.idtNeat].filter(Boolean).join(' | '),
    is_positive: isSkinTestPositive(t),
  }));

  const positiveCount = testPanel.filter((t) => t.is_positive).length;

  const challengeDrug = formData.proceedToChallenge
    ? formData.challengeDrug === 'Other'
      ? (formData.challengeDrugCustom ?? null)
      : formData.challengeDrug || null
    : null;

  return {
    redcap_id: redcapId ?? null,
    visit_date: formData.visitDate,

    histamine_spt: formData.controls.histamineSpt,
    saline_spt: formData.controls.salineSpt,
    saline_idt: formData.controls.salineIdt,

    test_panel: testPanel,
    total_drugs_tested: testPanel.length,
    positive_count: positiveCount,

    proceed_to_challenge: formData.proceedToChallenge,
    challenge_drug: challengeDrug,
    challenge_outcome: formData.proceedToChallenge ? formData.outcome : null,

    reaction_time: formData.outcome === 'UNSUCCESS' ? formData.reactionTime || null : null,
    symptoms: formData.outcome === 'UNSUCCESS' ? formData.symptoms : [],
    intervention_type:
      formData.outcome === 'UNSUCCESS' ? formData.interventionType || null : null,

    plan: formData.plan || null,
    app_version: APP_VERSION,
  };
}

export async function submitResult(submission: ResearchSubmission): Promise<void> {
  if (!supabase) throw new Error('Research database is not configured.');

  const { error } = await supabase.from(TABLE).insert(submission);
  if (error) throw new Error(error.message);
}

export async function deleteResult(id: string): Promise<void> {
  if (!supabase) throw new Error('Research database is not configured.');

  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error('Delete was blocked. Run this in Supabase SQL Editor: CREATE POLICY "anon_delete" ON research_submissions FOR DELETE TO anon USING (true);');
  }
}

export async function fetchAllResults(): Promise<ResearchRecord[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ResearchRecord[];
}

export function exportToCsv(records: ResearchRecord[]): void {
  if (records.length === 0) return;

  const headers = [
    'id',
    'created_at',
    'redcap_id',
    'visit_date',
    'histamine_spt',
    'saline_spt',
    'saline_idt',
    'total_drugs_tested',
    'positive_count',
    'proceed_to_challenge',
    'challenge_drug',
    'challenge_outcome',
    'reaction_time',
    'symptoms',
    'intervention_type',
    'plan',
    'app_version',
    'test_panel',
  ];

  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const rows = records.map((r) =>
    [
      r.id,
      r.created_at,
      r.redcap_id,
      r.visit_date,
      r.histamine_spt,
      r.saline_spt,
      r.saline_idt,
      r.total_drugs_tested,
      r.positive_count,
      r.proceed_to_challenge,
      r.challenge_drug,
      r.challenge_outcome,
      r.reaction_time,
      r.symptoms.join('; '),
      r.intervention_type,
      r.plan,
      r.app_version,
      JSON.stringify(r.test_panel),
    ]
      .map(escape)
      .join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `research_results_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
