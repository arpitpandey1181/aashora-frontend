import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

export const appointmentService = {
  // Get all OPD Visit appointments matching patopdvisitmainmodel
  getAllAppointments: async (date = '', doctorid = '') => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_APPOINTMENTS, {
        params: { appointmentDate: date, doctorid },
      });
      return response;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Book OPD Appointment Slot
  bookAppointment: async (appointmentData) => {
    try {
      // Maps to patopdvisitmainmodel (opdvisitid, gsspatid, doctorid, departmentid, etc.)
      const response = await apiClient.post(API_ENDPOINTS.BOOK_APPOINTMENT, appointmentData);
      return response;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  },

  // Update status (Confirmed, InProgress, Completed, Cancelled)
  updateStatus: async (opdvisitid, status) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.UPDATE_APPOINTMENT_STATUS, {
        opdvisitid,
        status,
      });
      return response;
    } catch (error) {
      console.error(`Error updating appointment #${opdvisitid}:`, error);
      throw error;
    }
  },
};
