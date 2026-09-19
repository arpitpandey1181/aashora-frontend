// import { apiClient } from '@/lib/api-client';
// import { API_ENDPOINTS } from '@/lib/constants';

// function formatDateToYYYYMMDD(rawStr) {
//   if (!rawStr) return new Date().toISOString().split('T')[0];
//   const str = rawStr.toString().trim();
//   if (str.includes('/')) {
//     const parts = str.split(' ')[0].split('/');
//     if (parts.length === 3) {
//       if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
//       return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
//     }
//   }
//   if (str.includes('-')) {
//     const parts = str.split(' ')[0].split('T')[0].split('-');
//     if (parts.length === 3) {
//       if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
//       return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
//     }
//   }
//   return str.split(' ')[0];
// }

// export const patientService = {
//   // Fetch all patients from .NET AashoraAPIController (SP: getregisterdpatientapi)
//   getAllPatients: async (searchQuery = '') => {
//     try {
//       let response = await apiClient.get(API_ENDPOINTS.GET_PATIENTS, {
//         params: { search: searchQuery },
//       });

//       if (typeof response === 'string') {
//         try { response = JSON.parse(response); } catch {}
//       }

//       let rawList = [];
//       const ds = response?.Table || response?.patients || response?.data || (Array.isArray(response) ? response : null);
//       if (ds) {
//         if (Array.isArray(ds)) {
//           rawList = ds;
//         } else if (ds.Table && Array.isArray(ds.Table)) {
//           rawList = ds.Table;
//         } else if (ds.Table1 && Array.isArray(ds.Table1)) {
//           rawList = ds.Table1;
//         } else if (ds.Tables && ds.Tables[0]) {
//           rawList = ds.Tables[0];
//         }
//       }

//       return rawList.map((row, idx) => ({
//         gsspatid: Number(row.gssuhid || row.gsspatid || row.pgssuhid || (idx + 1001)),
//         regId: row.uhid || row.puhid || `REG-${row.gssuhid || (idx + 1001)}`,
//         title: row.initialname || row.title || (row.genderid === 2 ? 'Mrs.' : 'Mr.'),
//         firstname: row.firstname || row.fname || '',
//         midname: row.midname || row.mname || '',
//         lastname: row.lastname || row.lname || '',
//         fullname: row.fullname || `${row.firstname || row.fname || ''} ${row.lastname || row.lname || ''}`.trim(),
//         mobileno: row.mobileno || row.mobile || '',
//         whatsappno: row.whatsappno || row.mobileno || '',
//         dob: row.dob || '',
//         ageDisplay: row.age ? `${row.age} Yrs` : '',
//         age: Number(row.age) || 30,
//         gender: row.gendername || (row.genderid === 2 ? 'Female' : 'Male'),
//         city: row.cityname || row.city || '',
//         address: row.address || '',
//         remark: row.remark || '',
//         visitType: row.visittype || 'First Visit',
//         doctorRef: row.doctorname || row.doctorRef || 'General',
//         status: row.status || 'Registered',
//         checkInStatus: row.checkInStatus || 'Registered',
//         registrationdate: formatDateToYYYYMMDD(row.regdatetime || row.entdatetime || row.regdate),
//         isFinalized: true
//       }));
//     } catch (error) {
//       console.error('Error fetching patients:', error);
//       return [];
//     }
//   },

//   // Fetch patient by gsspatid / PatientID
//   getPatientById: async (gsspatid) => {
//     try {
//       const response = await apiClient.get(`${API_ENDPOINTS.GET_PATIENT_BY_ID}?gsspatid=${gsspatid}`);
//       return response;
//     } catch (error) {
//       console.error(`Error fetching patient #${gsspatid}:`, error);
//       throw error;
//     }
//   },

//   // Save or Update patient (matches patregistrationmodel.cs)
//   savePatient: async (patientData) => {
//     try {
//       let formattedDob = '01/01/1990';
//       if (patientData.dob) {
//         if (patientData.dob.includes('-')) {
//           formattedDob = patientData.dob.split('-').reverse().join('/');
//         } else {
//           formattedDob = patientData.dob;
//         }
//       }

//       const payload = {
//         initialid: patientData.title === 'Mrs.' ? 2 : patientData.title === 'Miss' ? 3 : 1,
//         firstname: (patientData.firstName || patientData.firstname || patientData.fullname || '').toString().trim(),
//         midname: (patientData.middleName || patientData.midname || '').toString().trim(),
//         lastname: (patientData.lastName || patientData.lastname || '').toString().trim(),
//         fathername: (patientData.fathername || patientData.fhname || '').toString().trim(),
//         genderid: patientData.gender === 'Female' ? 2 : patientData.gender === 'Other' ? 3 : 1,
//         dob: formattedDob,
//         mobileno: Number(patientData.mobileno) || 0,
//         emailid: patientData.emailid || '',
//         cityid: patientData.cityid || 1,
//         locationid: patientData.locationid || 2,
//         maritalstatusid: patientData.maritalstatusid || 1,
//         financialyear: patientData.financialyear || '2526',
//         orgid: patientData.orgid || '11',
//         IsNewReg: '1'
//       };
//       const response = await apiClient.post(API_ENDPOINTS.SAVE_PATIENT, payload);
//       return response;
//     } catch (error) {
//       console.error('Error saving patient:', error);
//       throw error;
//     }
//   },

//   // Delete Patient
//   deletePatient: async (gsspatid) => {
//     try {
//       const response = await apiClient.post(API_ENDPOINTS.DELETE_PATIENT, { gsspatid });
//       return response;
//     } catch (error) {
//       console.error(`Error deleting patient #${gsspatid}:`, error);
//       throw error;
//     }
//   },

//   // Fetch Front Desk Inbox data directly from .NET API (SP: getfrontdeskinboxdata)
//   getFrontDeskInbox: async (filters = {}) => {
//     try {
//       const todayStr = new Date().toLocaleDateString('en-GB'); // "18/09/2026"
//       const payload = {
//         doctorid: filters.doctorid || 0,
//         departmentid: 0,
//         bllnggrpid: 0,
//         todate: filters.todate || todayStr,
//         gssuhid: filters.gssuhid || 0,
//         billinggroupid: 0,
//         corporateid: 0,
//         opdbillid: 0,
//         visittypeid: 0,
//         totalcharges: 0,
//         totalpaidamnt: 0,
//         servicecharges: 0,
//         disper: 0,
//         totaldiscount: 0,
//         discrefid: 0,
//         netcharges: 0,
//         duecharges: 0,
//         duerefid: 0,
//         iscancled: 0,
//         locationid: filters.locationid !== undefined ? filters.locationid : 0,
//         financialyear: 0,
//         istpadue: 0,
//         isopdproadvance: 0,
//         refundableamt: 0,
//         consultantid: 0,
//         partnerid: 0,
//         chaneltypeid: 0,
//         isallowalllocation: filters.isallowalllocation !== undefined ? filters.isallowalllocation : 1
//       };

//       let response = await apiClient.post(API_ENDPOINTS.GET_FRONTDESK_INBOX, payload);
//       if (typeof response === 'string') {
//         try { response = JSON.parse(response); } catch {}
//       }

//       let rawList = [];
//       const ds = response?.Table || response?.Tables?.[0] || response?.inboxData?.Table || (Array.isArray(response) ? response : []);
//       if (Array.isArray(ds)) {
//         rawList = ds;
//       }

//       return rawList.map((row, idx) => ({
//         gsspatid: Number(row.gssuhid || row.gsspatid || (idx + 1001)),
//         visitid: row.visitid || '',
//         regId: row.uhid || `REG-${row.gssuhid || (idx + 1001)}`,
//         title: '',
//         fullname: row.patientname || row.fullname || '',
//         patientname: row.patientname || '',
//         mobileno: row.mobileno || '',
//         whatsappno: row.mobileno || '',
//         consultantname: row.consultantname || 'General Consultant',
//         doctorRef: row.consultantname || 'General Consultant',
//         paymentdate: row.paymentdate || '',
//         appdate: row.appdate || '',
//         apptimefrom: row.apptimefrom || 'WALK-IN',
//         tokenno: row.tokenno || '1',
//         pattype: row.pattype || 'FIRST TIME',
//         visitType: row.pattype || 'First Visit',
//         checkintime: row.checkintime || '',
//         isappcheckin: Number(row.isappcheckin) || 0,
//         checkInStatus: Number(row.isappcheckin) === 1 ? 'Checked-In' : 'Registered',
//         isvitaltaken: Number(row.isvitaltaken) || 0,
//         vitalstatus: row.vitalstatus || 'PENDING',
//         waitingtime: row.waitingtime || '0 min',
//         ischeckout: Number(row.ischeckout) || 0,
//         checkoutdatetime: row.checkoutdatetime || '',
//         processtime: row.processtime || '',
//         preparedbyemp: row.preparedbyemp || '',
//         appbookby: row.appbookby || '',
//         status: Number(row.ischeckout) === 1 ? 'Completed' : Number(row.isappcheckin) === 1 ? 'Checked-In' : 'Registered',
//         registrationdate: row.paymentdate || new Date().toISOString().split('T')[0],
//         isFinalized: true
//       }));
//     } catch (error) {
//       console.error('Error fetching front desk inbox:', error);
//       return [];
//     }
//   },

//   // Save Check-In / Check-Out status directly to DB (SP: updatepatopdvisitchkin)
//   saveCheckInOut: async (checkInData) => {
//     try {
//       const response = await apiClient.post(API_ENDPOINTS.SAVE_CHECK_IN_OUT, checkInData);
//       return response;
//     } catch (error) {
//       console.error('Error updating check-in status:', error);
//       throw error;
//     }
//   }
// };

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
      let response = await apiClient.get(API_ENDPOINTS.GET_PATIENTS, {
        params: { search: searchQuery },
      });

      if (typeof response === 'string') {
        try { response = JSON.parse(response); } catch {}
      }

      let rawList = [];
      const ds = response?.Table || response?.patients || response?.data || (Array.isArray(response) ? response : null);
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
      const todayStr = new Date().toLocaleDateString('en-GB'); // "19/09/2026"
      const payload = {
        doctorid: filters.doctorid || 0,
        departmentid: 0,
        bllnggrpid: 0,
        // Both dates always sent - default to TODAY when not supplied so the
        // roster keeps working exactly as before if a page doesn't pass a range.
        fromdate: filters.fromdate || todayStr,
        todate: filters.todate || todayStr,
        gssuhid: filters.gssuhid || 0,
        billinggroupid: 0,
        corporateid: 0,
        opdbillid: 0,
        visittypeid: 0,
        totalcharges: 0,
        totalpaidamnt: 0,
        servicecharges: 0,
        disper: 0,
        totaldiscount: 0,
        discrefid: 0,
        netcharges: 0,
        duecharges: 0,
        duerefid: 0,
        iscancled: 0,
        locationid: filters.locationid !== undefined ? filters.locationid : 0,
        financialyear: 0,
        istpadue: 0,
        isopdproadvance: 0,
        refundableamt: 0,
        consultantid: 0,
        partnerid: 0,
        chaneltypeid: 0,
        isallowalllocation: filters.isallowalllocation !== undefined ? filters.isallowalllocation : 1
      };

      console.log('[getFrontDeskInbox] payload sent:', payload);
      let response = await apiClient.post(API_ENDPOINTS.GET_FRONTDESK_INBOX, payload);
      console.log('[getFrontDeskInbox] raw API response:', response);
      if (typeof response === 'string') {
        try { response = JSON.parse(response); } catch {}
      }

      let rawList = [];
      const ds = response?.Table || response?.Tables?.[0] || response?.inboxData?.Table || (Array.isArray(response) ? response : []);
      if (Array.isArray(ds)) {
        rawList = ds;
      }
      console.log('[getFrontDeskInbox] rawList extracted:', rawList);

      const mapped = rawList.map((row, idx) => ({
        gsspatid: Number(row.gssuhid || row.gsspatid || (idx + 1001)),
        visitid: row.visitid || '',
        regId: row.uhid || `REG-${row.gssuhid || (idx + 1001)}`,
        title: '',
        fullname: row.patientname || row.fullname || '',
        patientname: row.patientname || '',
        mobileno: row.mobileno || '',
        whatsappno: row.mobileno || '',
        consultantname: row.consultantname || 'General Consultant',
        doctorRef: row.consultantname || 'General Consultant',
        consultantid: Number(row.consultantid) || 0,
        paymentdate: row.paymentdate || '',
        appdate: row.appdate || '',
        apptimefrom: row.apptimefrom || 'WALK-IN',
        tokenno: row.tokenno || '1',
        pattype: row.pattype || 'FIRST TIME',
        visitType: row.pattype || 'First Visit',
        checkintime: row.checkintime || '',
        isappcheckin: Number(row.isappcheckin) || 0,
        checkInStatus: Number(row.isappcheckin) === 1 ? 'Checked-In' : 'Registered',
        isvitaltaken: Number(row.isvitaltaken) || 0,
        vitalstatus: row.vitalstatus || 'PENDING',
        waitingtime: row.waitingtime || '0 min',
        ischeckout: Number(row.ischeckout) || 0,
        checkoutdatetime: row.checkoutdatetime || '',
        processtime: row.processtime || '',
        preparedbyemp: row.preparedbyemp || '',
        appbookby: row.appbookby || '',
        status: Number(row.ischeckout) === 1 ? 'Completed' : Number(row.isappcheckin) === 1 ? 'Checked-In' : 'Registered',
        registrationdate: row.paymentdate || new Date().toISOString().split('T')[0],
        isFinalized: true
      }));
      console.log('[getFrontDeskInbox] mapped data returned to page:', mapped);
      return mapped;
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