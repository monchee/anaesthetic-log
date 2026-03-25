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
        timestamp: new Date().toISOString()
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
   * Get recent testing logs, migrating any legacy DrugTestRow records on read.
   */
  getRecentLogs(): LogFormData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const logs = JSON.parse(data) as LogFormData[];
      return logs.map(log => ({
        ...log,
        testPanel: (log.testPanel || []).map(this.migrateRow),
      }));
    } catch (error) {
      console.error('Error reading recent logs:', error);
      return [];
    }
  }

  private migrateRow(row: any): DrugTestRow {
    if (Array.isArray(row.idtResults)) return row as DrugTestRow;
    return {
      ...row,
      idtResults: [row.idt100 ?? '', row.idt10 ?? '', row.idtNeat ?? ''],
      protocolIndex: 0,
    };
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
   * Check if skin test is positive (≥3mm). Handles new idtResults array and legacy fields.
   */
  isSkinTestPositive(test: DrugTestRow): boolean {
    const check = (v: string | undefined) => (parseInt(v ?? '0') || 0) >= 3;
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

  /**
   * Clear recent logs
   */
  clearRecentLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const testingService = new TestingService();
