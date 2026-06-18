import api from './api';

export const departmentService = {
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  getDepartmentsByHospital: async (hospitalId) => {
    const response = await api.get(`/departments/hospital/${hospitalId}`);
    return response.data;
  },

  createDepartment: async (deptData) => {
    const response = await api.post('/departments', deptData);
    return response.data;
  }
};
