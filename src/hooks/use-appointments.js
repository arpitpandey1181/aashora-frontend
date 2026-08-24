'use client';

import { useState } from 'react';
import { useClinicStore } from '@/store/clinic-store';

export function useAppointments() {
  const { appointments, updateAppointmentStatus, bookAppointment } = useClinicStore();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'ALL') return true;
    return apt.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const totalRevenue = appointments.reduce((sum, apt) => {
    return sum + (parseFloat(apt.cashamt) || 0) - (parseFloat(apt.discountamt) || 0);
  }, 0);

  const metrics = {
    totalCount: appointments.length,
    confirmedCount: appointments.filter((a) => a.status === 'Confirmed').length,
    inProgressCount: appointments.filter((a) => a.status === 'InProgress').length,
    completedCount: appointments.filter((a) => a.status === 'Completed').length,
    totalRevenue,
  };

  return {
    appointments: filteredAppointments,
    allAppointments: appointments,
    loading: false,
    statusFilter,
    setStatusFilter,
    updateAppointmentStatus,
    bookAppointment,
    metrics,
  };
}
