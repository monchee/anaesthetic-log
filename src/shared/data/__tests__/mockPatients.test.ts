import { describe, it, expect } from 'vitest';
import { MOCK_PATIENTS } from '../mockPatients';

const NMBA_AGENTS = ['Rocuronium', 'Suxamethonium', 'Vecuronium', 'Pancuronium', 'Atracurium', 'Mivacurium', 'Cisatracurium'];
const ANTIBIOTIC_AGENTS = ['Cefazolin', 'Penicillin', 'Amoxicillin', 'Vancomycin', 'Clindamycin'];
const NSAID_AGENTS = ['Aspirin', 'Ibuprofen', 'Ketorolac', 'Diclofenac', 'Celecoxib', 'Naproxen'];

const hasSuspectedAgent = (agents: string[], candidates: string[]) =>
  agents.some(a => candidates.includes(a));

describe('MOCK_PATIENTS demo coverage criteria', () => {
  it('contains ≥1 patient with a suspected NMBA', () => {
    const match = MOCK_PATIENTS.find(p => hasSuspectedAgent(p.history.suspectedAgents, NMBA_AGENTS));
    expect(match, 'No patient with suspected NMBA found').toBeDefined();
  });

  it('contains ≥1 patient with a suspected antibiotic', () => {
    const match = MOCK_PATIENTS.find(p => hasSuspectedAgent(p.history.suspectedAgents, ANTIBIOTIC_AGENTS));
    expect(match, 'No patient with suspected antibiotic found').toBeDefined();
  });

  it('contains ≥1 patient with a suspected NSAID', () => {
    const match = MOCK_PATIENTS.find(p => hasSuspectedAgent(p.history.suspectedAgents, NSAID_AGENTS));
    expect(match, 'No patient with suspected NSAID found').toBeDefined();
  });

  it('contains ≥1 patient with Grade I reaction', () => {
    const match = MOCK_PATIENTS.find(p => p.history.grade.includes('Grade I'));
    expect(match, 'No Grade I patient found').toBeDefined();
  });

  it('contains ≥1 patient with Grade II reaction', () => {
    const match = MOCK_PATIENTS.find(p => p.history.grade.includes('Grade II'));
    expect(match, 'No Grade II patient found').toBeDefined();
  });

  it('contains ≥1 patient with Grade III reaction', () => {
    const match = MOCK_PATIENTS.find(p => p.history.grade.includes('Grade III'));
    expect(match, 'No Grade III patient found').toBeDefined();
  });

  it('contains ≥1 patient with Grade IV / Cardiac Arrest', () => {
    const match = MOCK_PATIENTS.find(p =>
      p.history.grade.includes('Grade IV') || p.history.grade.includes('Cardiac Arrest')
    );
    expect(match, 'No Grade IV / Cardiac Arrest patient found').toBeDefined();
  });

  it('contains ≥1 patient with a completed procedure (safe outcome)', () => {
    const match = MOCK_PATIENTS.find(p => p.history.procedureOutcome === 'Completed');
    expect(match, 'No patient with Completed procedure found').toBeDefined();
  });

  it('contains ≥1 patient with Chlorhexidine or Latex as suspected agent', () => {
    const match = MOCK_PATIENTS.find(p =>
      hasSuspectedAgent(p.history.suspectedAgents, ['Chlorhexidine', 'Latex'])
    );
    expect(match, 'No patient with Chlorhexidine or Latex found').toBeDefined();
  });
});
