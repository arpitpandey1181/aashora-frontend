export const API_ENDPOINTS = {
  // Account / Auth
  LOGIN: '/Account/Login',
  LOGOUT: '/Account/Logout',
  GET_USER_PROFILE: '/Account/GetUserProfile',

  // Patients
  GET_PATIENTS: '/Patient/GetAllPatients',
  GET_PATIENT_BY_ID: '/Patient/GetPatientById',
  SAVE_PATIENT: '/Patient/SavePatient',
  DELETE_PATIENT: '/Patient/DeletePatient',

  // Appointments
  GET_APPOINTMENTS: '/Appointment/GetAllAppointments',
  GET_APPOINTMENT_BY_ID: '/Appointment/GetAppointmentById',
  BOOK_APPOINTMENT: '/Appointment/BookAppointment',
  UPDATE_APPOINTMENT_STATUS: '/Appointment/UpdateStatus',

  // Doctors
  GET_DOCTORS: '/Doctor/GetAllDoctors',
  GET_DOCTOR_SLOTS: '/Doctor/GetAvailableSlots',

  // Prescriptions
  GET_PRESCRIPTIONS: '/Prescription/GetAllPrescriptions',
  SAVE_PRESCRIPTION: '/Prescription/SavePrescription',
  GET_DRUG_SEARCH: '/Prescription/SearchDrugs',

  // Billing
  GET_INVOICES: '/Billing/GetAllInvoices',
  CREATE_INVOICE: '/Billing/CreateInvoice',
  GET_INVOICE_DETAILS: '/Billing/GetInvoiceById',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'InProgress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
