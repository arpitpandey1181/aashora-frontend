// Comprehensive Central Master Data & Options for Clinic OPD E-Prescriptions

export const COMPLAINTS_MASTER_OPTIONS = [
  'CHEST PAIN',
  'COUGH & COLD',
  'HIGH FEVER',
  'FATIGUE & WEAKNESS',
  'PALPITATIONS',
  'BREATHLESSNESS (DYSPNEA)',
  'ACIDITY & HEARTBURN',
  'ABDOMINAL PAIN',
  'VOMITING & NAUSEA',
  'LOOSE MOTION (DIARRHEA)',
  'HEADACHE & MIGRAINE',
  'JOINT PAIN & STIFFNESS',
  'SKIN RASHES & ITCHING',
  'HIGH BLOOD SUGAR',
];

export const DIAGNOSIS_MASTER_OPTIONS = [
  'MILD DYSLIPIDAEMIA',
  'UPPER RESPIRATORY TRACT INFECTION (URTI)',
  'LOWER RESPIRATORY TRACT INFECTION (LRTI)',
  'ESSENTIAL HYPERTENSION',
  'TYPE 2 DIABETES MELLITUS',
  'VIRAL FEVER WITH COLD',
  'ACUTE GASTROENTERITIS',
  'GERD / ACID PEPTIC DISEASE',
  'BRONCHIAL ASTHMA',
  'URINARY TRACT INFECTION (UTI)',
  'OSTEOARTHRITIS',
  'ALLERGIC RHINITIS',
];

export const MEDICINES_MASTER_OPTIONS = [
  'ECOSPRIN 150MG TABLET',
  'ATORVA 10MG TABLET',
  'P ZOX TABLET',
  'ACUTROL C 400 MG TABLET',
  'ACLO SP TABLET',
  'ACTIVE D CAPSULE',
  'AFENAK TABLET',
  'ALFALFA TONIC',
  'ALPHA B - CAL TABLET',
  'ALTACEF OD 500MG TABLET',
  'PARACETAMOL 500MG TABLET',
  'AMOXICILLIN 500MG CAPSULE',
  'PANTOPRAZOLE 40MG TABLET',
  'METFORMIN 500MG TABLET',
  'TELMISARTAN 40MG TABLET',
  'CETIRIZINE 10MG TABLET',
  'AZITHROMYCIN 500MG TABLET',
];

export const LAB_TESTS_MASTER_OPTIONS = [
  'TOTAL BLOOD COUNT (CBC)',
  'SUGAR RANDOM (RBS)',
  'SUGAR FASTING (FBS)',
  'SUGAR AFTER FOOD (PPBS)',
  'HbA1c (GLYCATED HEMOGLOBIN)',
  'LIPID PROFILE (COMPLETE)',
  'THYROID PROFILE (T3, T4, TSH)',
  'LFT (LIVER FUNCTION TEST)',
  'KFT (KIDNEY FUNCTION TEST)',
  'URINE ROUTINE & MICROSCOPY',
  'ECG (RESTING 12-LEAD)',
  'EGFR',
  'TREAD MILL TEST (TMT)',
  'CHEST X-RAY (PA VIEW)',
  'USG ABDOMEN & PELVIS',
  'VITAMIN D3 & B12 TEST',
  'SERUM CREATININE & URIC ACID',
  'CT SCAN CHEST (NCCT / CECT)',
  'MRI BRAIN & SPINE',
  'DENGUE NS1 & IGG/IGM',
  'MALARIA PARASITE (MP KIT)',
  'SERUM ELECTROLYTES (Na, K, Cl)',
  '2D ECHOCARDIOGRAPHY',
  'FUNDUS CAMERA / RETINAL EXAM',
  'COMPLETE FOOT EXAMINATION',
];

export const ALLERGIES_MASTER_OPTIONS = [
  'No Known Allergies (NKDA)',
  'Penicillin / Amoxicillin',
  'Sulfa Drugs',
  'NSAIDS / Aspirin',
  'Dust & Pollen Allergy',
  'Lactose / Milk Allergy',
  'Peanut / Nut Allergy',
  'Latex / Rubber Allergy',
  'Iodine / Contrast Dye',
];

export const ADDICTION_MASTER_OPTIONS = [
  'None / N/A',
  'Smoking / Cigarette (Heavy)',
  'Smoking / Cigarette (Occasional)',
  'Alcohol Intake (Regular)',
  'Alcohol Intake (Social)',
  'Tobacco Chewing / Gutkha',
  'Betel Nut / Paan',
];

export const PAST_HISTORY_MASTER_OPTIONS = [
  'Hypertension (HTN)',
  'Type 2 Diabetes Mellitus (T2DM)',
  'Coronary Artery Disease (CAD)',
  'Bronchial Asthma / COPD',
  'Thyroid Disorder (Hypo / Hyper)',
  'Chronic Kidney Disease (CKD)',
  'Tuberculosis (TB) History',
  'Previous Surgical Procedure',
];

export const DOSE_OPTIONS = [
  '1 - 0 - 1',
  '1 - 0 - 0',
  '0 - 0 - 1',
  '1 - 1 - 1',
  '0 - 1 - 0',
  '1/2 - 0 - 1/2',
  'SOS (As Needed)',
  'STAT (Single Dose)',
];

export const WHEN_OPTIONS = [
  'After Food',
  'Before Food',
  'With Food',
  'Empty Stomach',
  'At Bed Time',
];

export const FREQ_OPTIONS = [
  'Daily',
  'Twice Daily (BID)',
  'Thrice Daily (TID)',
  'Four Times Daily (QID)',
  'Alternate Days',
  'Once a Week',
];

export const DURATION_LIST_OPTIONS = [
  '3 Days',
  '5 Days',
  '7 Days',
  '10 Days',
  '14 Days',
  '1 Month',
  '2 Months',
  '3 Months',
  'Continue',
];

export const DEFAULT_CLINIC_NAME = 'AASHORA Clinic Management';
export const DEFAULT_DOCTOR_NAME = 'Dr. BM JAYSWAL (Consultant Physician)';
