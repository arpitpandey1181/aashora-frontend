export const API_ENDPOINTS = {
  // Account / Auth
  LOGIN: '/Aashora/GetUserLogin',
  LOGOUT: '/Aashora/Logout',

  // Patients
  GET_PATIENTS: '/Aashora/GetOrgRegPat',
  GET_PATIENT_BY_ID: '/Aashora/GetOrgRegPat',
  SAVE_PATIENT: '/Aashora/SavePatientRegistration',
  GENERATE_UHID: '/Aashora/GenerateUHID',

  // Appointments
  GET_APPOINTMENTS: '/Aashora/GetAppointments',
  BOOK_APPOINTMENT: '/Aashora/SaveAppointment',

  // Prescriptions
  GET_PRESCRIPTIONS: '/Aashora/GetPrescription',
  SAVE_PRESCRIPTION: '/Aashora/SavePrescription',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'InProgress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
