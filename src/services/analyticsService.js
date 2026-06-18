import api from './api';

export const analyticsService = {
  // Get dashboard statistics
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  }
};
