import api from './api';

export const appointmentService = {
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  updateAppointmentStatus: async (id, statusData) => {
    // statusData can have { status, meetingLink }
    const response = await api.patch(`/appointments/${id}/status`, statusData);
    return response.data;
  },

  getAvailableSlots: async (doctorId, date) => {
    const response = await api.get('/appointments/available-slots', {
      params: { doctorId, date }
    });
    return response.data;
  },

  approveAppointment: async (id) => {
    const response = await api.patch(`/appointments/${id}/approve`);
    return response.data;
  },

  rejectAppointment: async (id) => {
    const response = await api.patch(`/appointments/${id}/reject`);
    return response.data;
  }
};
