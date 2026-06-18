import api from './api';

export const hospitalService = {
  getHospitals: async (departmentId) => {
    const response = await api.get('/hospitals', {
      params: departmentId ? { departmentId } : {}
    });
    return response.data;
  },

  getHospitalById: async (id) => {
    const response = await api.get(`/hospitals/${id}`);
    return response.data;
  }
};
