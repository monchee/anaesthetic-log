export interface ResearchDrugResult {
  drug_name: string;
  spt_wheal: string;
  idt_results: string;
  is_positive: boolean;
}

export interface ResearchSubmission {
  redcap_id: string | null;
  visit_date: string;

  histamine_spt: string;
  saline_spt: string;
  saline_idt: string;

  test_panel: ResearchDrugResult[];
  total_drugs_tested: number;
  positive_count: number;

  proceed_to_challenge: boolean;
  challenge_drug: string | null;
  challenge_outcome: 'SUCCESS' | 'UNSUCCESS' | null;

  reaction_time: string | null;
  symptoms: string[];
  intervention_type: string | null;

  plan: string | null;
  app_version: string;
}

export interface ResearchRecord extends ResearchSubmission {
  id: string;
  created_at: string;
}
