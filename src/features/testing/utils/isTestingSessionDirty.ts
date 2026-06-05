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

  // Any skin-test result entered
  const panelDirty = testPanel.some(
    row => row.sptWheal.trim() !== '' || row.idtResults.some(v => v.trim() !== '') || !!row.notes?.trim(),
  );
  if (panelDirty) return true;

  // Any control reading
  if (controls.histamineSpt.trim() || controls.salineSpt.trim() || controls.salineIdt.trim()) return true;

  // Any challenge data
  if (
    formData.proceedToChallenge ||
    formData.challengeDrug.trim() ||
    formData.outcome !== null ||
    formData.reactionTime.trim() ||
    formData.symptoms.length > 0 ||
    formData.symptomsOther.trim() ||
    formData.interventionType.trim() ||
    formData.interventionOther.trim() ||
    formData.plan.trim()
  ) {
    return true;
  }

  // Any nurse notes
  if (
    nurseNotes &&
    (nurseNotes.preTesting?.trim() ||
      nurseNotes.duringTesting?.trim() ||
      nurseNotes.postTesting?.trim() ||
      nurseNotes.signedBy?.trim())
  ) {
    return true;
  }

  // Any tryptase data
  if (tryptase && (tryptase.obtained || tryptase.values.some(v => v.time.trim() || v.result.trim()))) {
    return true;
  }

  return false;
}
