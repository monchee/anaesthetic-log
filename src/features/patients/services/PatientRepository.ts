import { Patient } from '../../../types';

/**
 * Repository for patient data persistence
 * Handles all localStorage interactions for patient data
 */
export class PatientRepository {
  private readonly STORAGE_KEY = 'anaesthetic_patients';

  /**
   * Retrieve all patients from storage
   */
  findAll(): Patient[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading patients from storage:', error);
      return [];
    }
  }

  /**
   * Find a patient by ID
   */
  findById(id: string): Patient | null {
    const patients = this.findAll();
    return patients.find(p => p.id === id) || null;
  }

  /**
   * Save patients to storage
   */
  save(patients: Patient[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patients));
    } catch (error) {
      console.error('Error saving patients to storage:', error);
      throw new Error('Failed to save patient data');
    }
  }

  /**
   * Add a new patient
   */
  add(patient: Patient): void {
    const patients = this.findAll();
    patients.push(patient);
    this.save(patients);
  }

  /**
   * Update an existing patient
   */
  update(id: string, updates: Partial<Patient>): boolean {
    const patients = this.findAll();
    const index = patients.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    patients[index] = { ...patients[index], ...updates };
    this.save(patients);
    return true;
  }

  /**
   * Delete a patient
   */
  delete(id: string): boolean {
    const patients = this.findAll();
    const filtered = patients.filter(p => p.id !== id);
    
    if (filtered.length === patients.length) return false;
    
    this.save(filtered);
    return true;
  }

  /**
   * Clear all patient data
   */
  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get patient count
   */
  count(): number {
    return this.findAll().length;
  }
}

// Export singleton instance
export const patientRepository = new PatientRepository();
