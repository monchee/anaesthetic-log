import { LogFormData, DrugTestRow } from '../../../../types';
import { SKIN_TEST_POSITIVE_THRESHOLD } from '@shared/utils/constants';

/**
 * Service for testing-related business logic
 * Handles form validation, submission, and analysis
 */
export class TestingService {
  /**
   * Validate testing form data
   */
  validateForm(formData: LogFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!formData.mrn?.trim()) {
      errors.push('MRN is required');
    }
    if (!formData.firstName?.trim()) {
      errors.push('First name is required');
    }
    if (!formData.lastName?.trim()) {
      errors.push('Last name is required');
    }
    if (!formData.visitDate) {
      errors.push('Visit date is required');
    }

    // Test panel validation
    if (formData.testPanel.length === 0) {
      errors.push('At least one drug test is required');
    }
    const unnamedOtherRows = formData.testPanel.filter(
      (row: DrugTestRow) => row.drugName === 'Other' && !row.customName?.trim()
    );
    if (unnamedOtherRows.length > 0) {
      errors.push("Custom drug name must be specified for all 'Other' entries");
    }

    // Challenge validation
    if (formData.proceedToChallenge) {
      if (!formData.challengeDrug) {
        errors.push('Challenge drug must be selected');
      }
      if (formData.challengeDrug === 'Other' && !formData.challengeDrugCustom) {
        errors.push('Custom challenge drug name is required');
      }
      if (!formData.outcome) {
        errors.push('Challenge outcome must be recorded');
      }
      if (formData.outcome === 'UNSUCCESS') {
        if (!formData.reactionTime) {
          errors.push('Reaction time is required for unsuccessful challenges');
        }
        if (formData.symptoms.length === 0) {
          errors.push('At least one symptom must be selected');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if skin test is positive (≥3mm). Handles new idtResults array and legacy fields.
   */
  isSkinTestPositive(test: DrugTestRow): boolean {
    const check = (v: string | undefined) => (parseInt(v ?? '0', 10) || 0) >= SKIN_TEST_POSITIVE_THRESHOLD;
    if (check(test.sptWheal)) return true;
    if (test.idtResults?.some(v => check(v))) return true;
    // Legacy fallback
    return check(test.idt100) || check(test.idt10) || check(test.idtNeat);
  }

  /**
   * Get positive tests from panel
   */
  getPositiveTests(testPanel: DrugTestRow[]): DrugTestRow[] {
    return testPanel.filter(test => this.isSkinTestPositive(test));
  }

  /**
   * Calculate test statistics
   */
  calculateStatistics(testPanel: DrugTestRow[]) {
    const positive = this.getPositiveTests(testPanel);
    const negative = testPanel.filter(test => !this.isSkinTestPositive(test));

    return {
      total: testPanel.length,
      positive: positive.length,
      negative: negative.length,
      positiveRate: testPanel.length > 0 
        ? ((positive.length / testPanel.length) * 100).toFixed(1)
        : '0.0'
    };
  }
}

// Export singleton instance
export const testingService = new TestingService();
