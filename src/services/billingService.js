import api from './api';

export const billingService = {
  createBill: async (billData) => {
    const response = await api.post('/bills', billData);
    return response.data;
  },

  getBills: async () => {
    const response = await api.get('/bills');
    return response.data;
  }
};
