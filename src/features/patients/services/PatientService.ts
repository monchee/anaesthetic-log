import { Patient } from '../../../../types';
import { PatientRepository } from './PatientRepository';

/**
 * Service for patient business logic
 * Handles patient operations and search functionality
 */
export class PatientService {
  constructor(private repository: PatientRepository) {}

  /**
   * Get all patients
   */
  getAllPatients(): Patient[] {
    return this.repository.findAll();
  }

  /**
   * Get a patient by ID
   */
  getPatientById(id: string): Patient | null {
    return this.repository.findById(id);
  }

  /**
   * Search patients by query string
   * Searches across name, MRN, and city
   */
  searchPatients(query: string, patients?: Patient[]): Patient[] {
    const allPatients = patients || this.repository.findAll();
    
    if (!query.trim()) {
      return allPatients;
    }

    const searchTerm = query.toLowerCase().trim();
    
    return allPatients.filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const mrn = patient.mrn?.toLowerCase() || '';
      const city = patient.city?.toLowerCase() || '';
      
      return (
        fullName.includes(searchTerm) ||
        mrn.includes(searchTerm) ||
        city.includes(searchTerm)
      );
    });
  }

  /**
   * Filter patients by severity grade
   */
  filterByGrade(grade: string, patients?: Patient[]): Patient[] {
    const allPatients = patients || this.repository.findAll();
    
    return allPatients.filter(patient => 
      patient.history?.grade === grade
    );
  }

  /**
   * Filter patients by city
   */
  filterByCity(city: string, patients?: Patient[]): Patient[] {
    const allPatients = patients || this.repository.findAll();
    
    return allPatients.filter(patient => 
      patient.city?.toLowerCase() === city.toLowerCase()
    );
  }

  /**
   * Get patients with severe reactions (Grade III/IV)
   */
  getSevereReactions(): Patient[] {
    return this.repository.findAll().filter(patient => {
      const grade = patient.history?.grade;
      return grade === 'Grade III' || grade === 'Grade IV';
    });
  }

  /**
   * Get unique cities from patient data
   */
  getUniqueCities(): string[] {
    const patients = this.repository.findAll();
    const cities = patients
      .map(p => p.city)
      .filter((city): city is string => Boolean(city));
    
    return Array.from(new Set(cities)).sort();
  }

  /**
   * Add a new patient
   */
  addPatient(patient: Patient): void {
    this.repository.add(patient);
  }

  /**
   * Update patient data
   */
  updatePatient(id: string, updates: Partial<Patient>): boolean {
    return this.repository.update(id, updates);
  }

  /**
   * Delete a patient
   */
  deletePatient(id: string): boolean {
    return this.repository.delete(id);
  }

  /**
   * Get patient statistics
   */
  getStatistics() {
    const patients = this.repository.findAll();
    
    return {
      total: patients.length,
      withHistory: patients.filter(p => p.history).length,
      severe: this.getSevereReactions().length,
      cities: this.getUniqueCities().length
    };
  }
}

// Export singleton instance
export const patientService = new PatientService(
  new PatientRepository()
);
