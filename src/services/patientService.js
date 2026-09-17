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
      const payload = {
        initialid: patientData.title === 'Mrs.' ? 2 : patientData.title === 'Miss' ? 3 : 1,
        firstname: patientData.firstName || patientData.firstname || patientData.fullname || '',
        midname: patientData.middleName || patientData.midname || '',
        lastname: patientData.lastName || patientData.lastname || '',
        genderid: patientData.gender === 'Female' ? 2 : patientData.gender === 'Other' ? 3 : 1,
        dob: patientData.dob ? patientData.dob.split('-').reverse().join('/') : '01/01/1990',
        mobileno: parseInt(patientData.mobileno) || 0,
        emailid: patientData.emailid || '',
        cityid: patientData.cityid || 1,
        locationid: patientData.locationid || 2,
        maritalstatusid: patientData.maritalstatusid || 1,
        fathername: patientData.fathername || patientData.fhname || '',
        financialyear: patientData.financialyear || '2526',
        orgid: patientData.orgid || '11',
        IsNewReg: '1'
      };
      const response = await apiClient.post(API_ENDPOINTS.SAVE_PATIENT, payload);
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
