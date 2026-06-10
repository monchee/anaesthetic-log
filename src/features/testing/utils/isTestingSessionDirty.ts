import { LogFormData } from '../types';

/**
 * Has the clinician entered any actual testing data this session?
 *
 * Used to decide whether the in-progress form is worth autosaving as a draft.
 * Patient identity (name/MRN) and the default visit date are prefilled when a
 * patient is selected, so they do NOT count as dirty — only clinical input the
 * user typed does.
 */
export function isTestingSessionDirty(formData: LogFormData): boolean {
  const { controls, testPanel, nurseNotes, tryptase } = formData;
  const hasText = (value: unknown) => String(value ?? '').trim() !== '';

  // Any skin-test result entered
  const panelDirty = testPanel.some(
    row => hasText(row.sptWheal) || (Array.isArray(row.idtResults) && row.idtResults.some(hasText)) || hasText(row.notes),
  );
  if (panelDirty) return true;

  // Any control reading
  if (hasText(controls.histamineSpt) || hasText(controls.salineSpt) || hasText(controls.salineIdt)) return true;

  // Any challenge data
  if (
    formData.proceedToChallenge ||
    hasText(formData.challengeDrug) ||
    formData.outcome !== null ||
    hasText(formData.reactionTime) ||
    formData.symptoms.length > 0 ||
    hasText(formData.symptomsOther) ||
    hasText(formData.interventionType) ||
    hasText(formData.interventionOther) ||
    hasText(formData.plan)
  ) {
    return true;
  }

  // Any nurse notes
  if (
    nurseNotes &&
    (hasText(nurseNotes.preTesting) ||
      hasText(nurseNotes.duringTesting) ||
      hasText(nurseNotes.postTesting) ||
      hasText(nurseNotes.signedBy))
  ) {
    return true;
  }

  // Any tryptase data
  if (
    tryptase &&
    (tryptase.obtained || (Array.isArray(tryptase.values) && tryptase.values.some(v => hasText(v.time) || hasText(v.result))))
  ) {
    return true;
  }

  return false;
}
