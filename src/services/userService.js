import api from './api';

export const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getDoctors: async () => {
    const response = await api.get('/users/doctors');
    return response.data;
  },

  getDoctorsByDepartmentAndHospital: async (departmentId, hospitalId) => {
    const response = await api.get('/users/doctors', {
      params: { departmentId, hospitalId }
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  }
};
