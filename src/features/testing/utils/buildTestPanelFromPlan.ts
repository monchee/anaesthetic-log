import { getSkinProtocolsForDrug } from '@shared/data/drugMasterlist';
import type { DrugTestRow, TestingPlanData } from '../types';

export interface BuildTestPanelResult {
  testPanel: DrugTestRow[];
  proceedToChallenge?: true;
  challengeDrug?: 'Other';
  challengeDrugCustom?: string;
}

export function buildTestPanelFromPlan(
  plan?: Partial<TestingPlanData> | null
): BuildTestPanelResult {
  if (!plan) {
    return { testPanel: [] };
  }

  const { selectedDrugs = [], selectedProtocols, customDrugs = [] } = plan;

  const standardRows: DrugTestRow[] = selectedDrugs.map(drug => {
    const protocolIndex = selectedProtocols?.[drug] ?? 0;
    const protocols = getSkinProtocolsForDrug(drug);
    const protocol = protocols[protocolIndex];
    return {
      drugName: drug,
      sptWheal: '',
      idtResults: Array(protocol?.idtSteps.length ?? 0).fill(''),
      protocolIndex,
      customName: '',
    };
  });

  const customRows: DrugTestRow[] = customDrugs.map(c => ({
    drugName: 'Other',
    customName: c.name,
    sptWheal: '',
    idtResults: Array(c.idtSteps?.length ?? 0).fill(''),
    protocolIndex: 0,
    customSptConcentration: c.sptConcentration,
    customIdtSteps: c.idtSteps,
    includeInChallenge: c.includeInChallenge,
  }));

  const challengeDrugCustom = customDrugs.find(c => c.includeInChallenge)?.name;

  return {
    testPanel: [...standardRows, ...customRows],
    ...(challengeDrugCustom ? { proceedToChallenge: true as const, challengeDrug: 'Other' as const, challengeDrugCustom } : {}),
  };
}
