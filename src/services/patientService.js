import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

function formatDateToYYYYMMDD(rawStr) {
  if (!rawStr) return new Date().toISOString().split('T')[0];
  const str = rawStr.toString().trim();
  if (str.includes('/')) {
    const parts = str.split(' ')[0].split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  if (str.includes('-')) {
    const parts = str.split(' ')[0].split('T')[0].split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return str.split(' ')[0];
}

export const patientService = {
  // Fetch all patients from .NET AashoraAPIController (SP: getregisterdpatientapi)
  getAllPatients: async (searchQuery = '') => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_PATIENTS, {
        params: { search: searchQuery },
      });

      let rawList = [];
      const ds = response?.patients || response?.data || response;
      if (ds) {
        if (Array.isArray(ds)) {
          rawList = ds;
        } else if (ds.Table && Array.isArray(ds.Table)) {
          rawList = ds.Table;
        } else if (ds.Table1 && Array.isArray(ds.Table1)) {
          rawList = ds.Table1;
        } else if (ds.Tables && ds.Tables[0]) {
          rawList = ds.Tables[0];
        }
      }

      return rawList.map((row, idx) => ({
        gsspatid: Number(row.gssuhid || row.gsspatid || row.pgssuhid || (idx + 1001)),
        regId: row.uhid || row.puhid || `REG-${row.gssuhid || (idx + 1001)}`,
        title: row.initialname || row.title || (row.genderid === 2 ? 'Mrs.' : 'Mr.'),
        firstname: row.firstname || row.fname || '',
        midname: row.midname || row.mname || '',
        lastname: row.lastname || row.lname || '',
        fullname: row.fullname || `${row.firstname || row.fname || ''} ${row.lastname || row.lname || ''}`.trim(),
        mobileno: row.mobileno || row.mobile || '',
        whatsappno: row.whatsappno || row.mobileno || '',
        dob: row.dob || '',
        ageDisplay: row.age ? `${row.age} Yrs` : '',
        age: Number(row.age) || 30,
        gender: row.gendername || (row.genderid === 2 ? 'Female' : 'Male'),
        city: row.cityname || row.city || '',
        address: row.address || '',
        remark: row.remark || '',
        visitType: row.visittype || 'First Visit',
        doctorRef: row.doctorname || row.doctorRef || 'General',
        status: row.status || 'Registered',
        checkInStatus: row.checkInStatus || 'Registered',
        registrationdate: formatDateToYYYYMMDD(row.regdatetime || row.entdatetime || row.regdate),
        isFinalized: true
      }));
    } catch (error) {
      console.error('Error fetching patients:', error);
      return [];
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
      let formattedDob = '01/01/1990';
      if (patientData.dob) {
        if (patientData.dob.includes('-')) {
          formattedDob = patientData.dob.split('-').reverse().join('/');
        } else {
          formattedDob = patientData.dob;
        }
      }

      const payload = {
        initialid: patientData.title === 'Mrs.' ? 2 : patientData.title === 'Miss' ? 3 : 1,
        firstname: (patientData.firstName || patientData.firstname || patientData.fullname || '').toString().trim(),
        midname: (patientData.middleName || patientData.midname || '').toString().trim(),
        lastname: (patientData.lastName || patientData.lastname || '').toString().trim(),
        fathername: (patientData.fathername || patientData.fhname || '').toString().trim(),
        genderid: patientData.gender === 'Female' ? 2 : patientData.gender === 'Other' ? 3 : 1,
        dob: formattedDob,
        mobileno: Number(patientData.mobileno) || 0,
        emailid: patientData.emailid || '',
        cityid: patientData.cityid || 1,
        locationid: patientData.locationid || 2,
        maritalstatusid: patientData.maritalstatusid || 1,
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

  // Fetch Front Desk Inbox data directly from .NET API (SP: getfrontdeskinboxdata)
  getFrontDeskInbox: async (filters = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_FRONTDESK_INBOX, { params: filters });
      let rawList = [];
      if (response && response.inboxData) {
        if (Array.isArray(response.inboxData)) {
          rawList = response.inboxData;
        } else if (response.inboxData.Table && Array.isArray(response.inboxData.Table)) {
          rawList = response.inboxData.Table;
        } else if (response.inboxData.Tables && response.inboxData.Tables[0]) {
          rawList = response.inboxData.Tables[0];
        }
      }
      return rawList.map((row, idx) => ({
        gsspatid: Number(row.gssuhid || row.gsspatid || (idx + 1001)),
        regId: row.uhid || `REG-${row.gssuhid || (idx + 1001)}`,
        title: row.initialname || row.title || 'Mr.',
        fullname: row.patientname || row.fullname || `${row.firstname || ''} ${row.lastname || ''}`.trim(),
        mobileno: row.mobileno || '',
        whatsappno: row.whatsappno || row.mobileno || '',
        dob: row.dob || '',
        ageDisplay: row.age ? `${row.age} Yrs` : '',
        age: Number(row.age) || 30,
        gender: row.gendername || 'Male',
        city: row.cityname || '',
        address: row.address || '',
        remark: row.remark || '',
        visitType: row.visittype || 'First Visit',
        doctorRef: row.doctorname || row.doctorRef || 'General',
        status: row.status || 'Registered',
        checkInStatus: row.checkinstatus || row.checkInStatus || 'Registered',
        registrationdate: formatDateToYYYYMMDD(row.regdatetime || row.entdatetime || row.regdate),
        isFinalized: true
      }));
    } catch (error) {
      console.error('Error fetching front desk inbox:', error);
      return [];
    }
  },

  // Save Check-In / Check-Out status directly to DB (SP: updatepatopdvisitchkin)
  saveCheckInOut: async (checkInData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SAVE_CHECK_IN_OUT, checkInData);
      return response;
    } catch (error) {
      console.error('Error updating check-in status:', error);
      throw error;
    }
  }
};
