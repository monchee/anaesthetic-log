import { Patient, LogFormData } from '../../../../types';

interface GradeCounts {
  I: number;
  II: number;
  III: number;
  IV: number;
  Ungraded: number;
}

interface TopAgent {
  name: string;
  count: number;
}

interface Analytics {
  totalPatients: number;
  severeCount: number;
  severeRate: string;
  abandonedCount: number;
  abandonedRate: string;
  avgReactionTime: number;
  gradeCounts: GradeCounts;
  topAgentsByCount: TopAgent[];
}

/**
 * Service for dashboard analytics calculations
 */
export class AnalyticsService {
  /**
   * Calculate comprehensive analytics from patient data
   */
  calculateAnalytics(patients: Patient[], _logs?: LogFormData[]): Analytics {
    const totalPatients = patients.length;
    
    // Grade distribution
    const gradeCounts = this.getGradeDistribution(patients);
    
    // Severe reactions (Grade III/IV)
    const severeCount = gradeCounts.III + gradeCounts.IV;
    const severeRate = totalPatients > 0 
      ? ((severeCount / totalPatients) * 100).toFixed(1)
      : '0.0';
    
    // Abandoned procedures
    const abandonedCount = this.getAbandonedCount(patients);
    const abandonedRate = totalPatients > 0
      ? ((abandonedCount / totalPatients) * 100).toFixed(1)
      : '0.0';
    
    // Average reaction time
    const avgReactionTime = this.calculateAverageReactionTime(patients);
    
    // Top suspected agents
    const topAgentsByCount = this.getTopAgents(patients, 5);

    return {
      totalPatients,
      severeCount,
      severeRate,
      abandonedCount,
      abandonedRate,
      avgReactionTime,
      gradeCounts,
      topAgentsByCount
    };
  }

  /**
   * Get grade distribution counts
   */
  getGradeDistribution(patients: Patient[]): GradeCounts {
    const counts: GradeCounts = {
      I: 0,
      II: 0,
      III: 0,
      IV: 0,
      Ungraded: 0
    };

    patients.forEach(patient => {
      const grade = patient.history?.grade;
      
      if (!grade) {
        counts.Ungraded++;
      } else if (grade.includes('I') && !grade.includes('II') && !grade.includes('III') && !grade.includes('IV')) {
        counts.I++;
      } else if (grade.includes('II')) {
        counts.II++;
      } else if (grade.includes('III')) {
        counts.III++;
      } else if (grade.includes('IV')) {
        counts.IV++;
      } else {
        counts.Ungraded++;
      }
    });

    return counts;
  }

  /**
   * Count abandoned procedures
   */
  private getAbandonedCount(patients: Patient[]): number {
    return patients.filter(patient => {
      const grade = patient.history?.grade;
      return grade === 'Grade III' || grade === 'Grade IV';
    }).length;
  }

  /**
   * Calculate average reaction time
   */
  private calculateAverageReactionTime(patients: Patient[]): number {
    const times: number[] = [];

    patients.forEach(patient => {
      const history = patient.history;
      if (!history?.inductionTime || !history?.reactionTime) return;

      try {
        const [inductionHour, inductionMin] = history.inductionTime.split(':').map(Number);
        const [reactionHour, reactionMin] = history.reactionTime.split(':').map(Number);

        const inductionMinutes = inductionHour * 60 + inductionMin;
        const reactionMinutes = reactionHour * 60 + reactionMin;

        const diff = reactionMinutes - inductionMinutes;
        if (diff > 0 && diff < 300) { // Reasonable range: 0-5 hours
          times.push(diff);
        }
      } catch {
        // Skip invalid time formats
      }
    });

    if (times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / times.length);
  }

  /**
   * Get top suspected agents
   */
  private getTopAgents(patients: Patient[], limit: number = 5): TopAgent[] {
    const agentCounts = new Map<string, number>();

    patients.forEach(patient => {
      const agents = patient.history?.suspectedAgents || [];
      agents.forEach(agent => {
        if (agent && agent.trim()) {
          const count = agentCounts.get(agent) || 0;
          agentCounts.set(agent, count + 1);
        }
      });
    });

    return Array.from(agentCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get statistics by category
   */
  getStatsByCategory(logs: LogFormData[]) {
    const categoryStats = new Map<string, { positive: number; total: number }>();

    logs.forEach(log => {
      log.testPanel.forEach(test => {
        const category = this.getDrugCategory(test.drugName);
        const stats = categoryStats.get(category) || { positive: 0, total: 0 };
        
        stats.total++;
        if (this.isPositive(test)) {
          stats.positive++;
        }
        
        categoryStats.set(category, stats);
      });
    });

    return Object.fromEntries(categoryStats);
  }

  /**
   * Helper: Check if test is positive
   */
  private isPositive(test: any): boolean {
    const check = (v: string | undefined) => (parseInt(v ?? '0') || 0) >= 3;
    if (check(test.sptWheal)) return true;
    if (Array.isArray(test.idtResults) && test.idtResults.some((v: string) => check(v))) return true;
    return check(test.idt100) || check(test.idt10) || check(test.idtNeat);
  }

  /**
   * Helper: Get drug category (simplified)
   */
  private getDrugCategory(_drugName: string): string {
    // This would ideally use DRUG_CATEGORIES constant
    // For now, return a default category
    return 'General';
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
