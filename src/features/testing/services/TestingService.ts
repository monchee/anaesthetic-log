import { LogFormData, DrugTestRow } from '../../../../types';

/**
 * Service for testing-related business logic
 * Handles form validation, submission, and analysis
 */
export class TestingService {
  private readonly STORAGE_KEY = 'recent_testing_logs';
  private readonly MAX_RECENT_LOGS = 10;

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
   * Submit testing record
   */
  submitTestingRecord(formData: LogFormData): { success: boolean; data?: LogFormData; error?: string } {
    const validation = this.validateForm(formData);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    try {
      // Add timestamp
      const record: LogFormData = {
        ...formData,
        submittedAt: new Date().toISOString()
      };

      // Save to recent logs
      this.addToRecentLogs(record);

      return {
        success: true,
        data: record
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit record'
      };
    }
  }

  /**
   * Get recent testing logs
   */
  getRecentLogs(): LogFormData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading recent logs:', error);
      return [];
    }
  }

  /**
   * Add to recent logs (keep only last N)
   */
  private addToRecentLogs(log: LogFormData): void {
    const logs = this.getRecentLogs();
    logs.unshift(log); // Add to beginning
    
    // Keep only the most recent logs
    const trimmed = logs.slice(0, this.MAX_RECENT_LOGS);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
  }

  /**
   * Check if skin test is positive
   */
  isSkinTestPositive(test: DrugTestRow): boolean {
    const spt = parseInt(test.sptWheal) || 0;
    const idt100 = parseInt(test.idt100) || 0;
    const idt10 = parseInt(test.idt10) || 0;
    const idtNeat = parseInt(test.idtNeat) || 0;

    return spt >= 3 || idt100 >= 3 || idt10 >= 3 || idtNeat >= 3;
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

  /**
   * Clear recent logs
   */
  clearRecentLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const testingService = new TestingService();
