-- Create the research_submissions table
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/<your-project>/sql)

CREATE TABLE IF NOT EXISTS research_submissions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  redcap_id            TEXT,
  visit_date           DATE,

  -- Controls
  histamine_spt        TEXT,
  saline_spt           TEXT,
  saline_idt           TEXT,

  -- Drug test panel (array of {drug_name, spt_wheal, idt_100, idt_10, idt_neat, is_positive})
  test_panel           JSONB NOT NULL DEFAULT '[]',
  total_drugs_tested   INT NOT NULL DEFAULT 0,
  positive_count       INT NOT NULL DEFAULT 0,

  -- Challenge test
  proceed_to_challenge BOOLEAN NOT NULL DEFAULT FALSE,
  challenge_drug       TEXT,
  challenge_outcome    TEXT CHECK (challenge_outcome IN ('SUCCESS', 'UNSUCCESS')),

  -- Reaction details (if unsuccessful challenge)
  reaction_time        TEXT,
  symptoms             JSONB NOT NULL DEFAULT '[]',
  intervention_type    TEXT,

  -- Clinical plan
  plan                 TEXT,

  -- App metadata
  app_version          TEXT
);

-- Enable Row Level Security
ALTER TABLE research_submissions ENABLE ROW LEVEL SECURITY;

-- Allow the anonymous (app) user to INSERT new records
CREATE POLICY "anon_insert" ON research_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- Allow the anonymous (app) user to SELECT records (data is de-identified)
CREATE POLICY "anon_select" ON research_submissions
  FOR SELECT TO anon USING (true);
