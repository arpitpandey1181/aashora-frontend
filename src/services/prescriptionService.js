import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

export const prescriptionService = {
  // Search drug database by name or composition
  searchDrugs: async (query) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_DRUG_SEARCH, {
        params: { q: query },
      });
      return response;
    } catch (error) {
      console.error('Error searching drugs:', error);
      throw error;
    }
  },

  // Save full E-Prescriptions with Vitals & Dosage list
  savePrescription: async (rxData) => {
    try {
      // Maps to C# PrescriptionMasterModel (gsspatid, doctorid, vitals, drugList)
      const response = await apiClient.post(API_ENDPOINTS.SAVE_PRESCRIPTION, rxData);
      return response;
    } catch (error) {
      console.error('Error saving prescription:', error);
      throw error;
    }
  },

  // Get prescription list
  getAllPrescriptions: async (gsspatid = '') => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_PRESCRIPTIONS, {
        params: { gsspatid },
      });
      return response;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  },
};
