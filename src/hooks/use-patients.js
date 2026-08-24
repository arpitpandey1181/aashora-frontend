'use client';

import { useClinicStore } from '@/store/clinic-store';

export function usePatients() {
  const { patients, registerPatient } = useClinicStore();

  return {
    patients,
    loading: false,
    addPatient: registerPatient,
  };
}
