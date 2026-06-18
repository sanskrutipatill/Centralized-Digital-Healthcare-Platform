import api from './api';

export const recordService = {
  createRecord: async (formData) => {
    // Requires FormData if uploading files
    const response = await api.post('/records', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getPatientRecords: async (patientId) => {
    const response = await api.get(`/records/patient/${patientId}`);
    return response.data;
  }
};
