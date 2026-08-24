import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

export const patientService = {
  // Fetch all patients from .NET PatientController.cs
  getAllPatients: async (searchQuery = '') => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_PATIENTS, {
        params: { search: searchQuery },
      });
      return response;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Fetch patient by gsspatid / PatientID
  getPatientById: async (gsspatid) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.GET_PATIENT_BY_ID}?gsspatid=${gsspatid}`);
      return response;
    } catch (error) {
      console.error(`Error fetching patient #${gsspatid}:`, error);
      throw error;
    }
  },

  // Save or Update patient (matches patregistrationmodel.cs)
  savePatient: async (patientData) => {
    try {
      // Send exact C# model properties (gsspatid, fullname, age, gender, mobileno, etc.)
      const response = await apiClient.post(API_ENDPOINTS.SAVE_PATIENT, patientData);
      return response;
    } catch (error) {
      console.error('Error saving patient:', error);
      throw error;
    }
  },

  // Delete Patient
  deletePatient: async (gsspatid) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.DELETE_PATIENT, { gsspatid });
      return response;
    } catch (error) {
      console.error(`Error deleting patient #${gsspatid}:`, error);
      throw error;
    }
  },
};
